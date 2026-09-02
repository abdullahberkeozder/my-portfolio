-- M2: private invitations. Expiry is derived from response_due_at, never a cron-driven publication.
create table public.request_invitations (
  request_id uuid primary key references public.service_requests(id),
  customer_id uuid not null references auth.users(id),
  professional_id uuid not null references public.tradesperson_profiles(user_id),
  status text not null default 'awaiting' check(status in ('awaiting','quoted','declined','broadened')),
  response_due_at timestamptz not null,
  decline_reason text check(decline_reason is null or length(trim(decline_reason)) between 10 and 1000),
  responded_at timestamptz,
  successor_request_id uuid unique references public.service_requests(id) on delete set null,
  created_at timestamptz not null default now(),
  check(customer_id<>professional_id),
  check(status<>'declined' or (decline_reason is not null and responded_at is not null)),
  check(successor_request_id is null or status='broadened')
);
create index request_invitations_professional_idx on public.request_invitations(professional_id,created_at desc);
create index request_invitations_customer_idx on public.request_invitations(customer_id,created_at desc);
alter table public.request_invitations enable row level security;
revoke all on public.request_invitations from anon,authenticated;
grant select on public.request_invitations to authenticated;
create policy "invitation participants read" on public.request_invitations for select to authenticated
  using(customer_id=(select auth.uid()) or professional_id=(select auth.uid()));

create table public.request_invitation_events (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.request_invitations(request_id),
  actor_id uuid references auth.users(id),
  event_type text not null,
  reason text,
  created_at timestamptz not null default now()
);
create index request_invitation_events_request_idx on public.request_invitation_events(request_id,created_at);
alter table public.request_invitation_events enable row level security;
revoke all on public.request_invitation_events from anon,authenticated;
grant select on public.request_invitation_events to authenticated;
create policy "invitation participants read events" on public.request_invitation_events for select to authenticated
  using(exists(select 1 from public.request_invitations i where i.request_id=request_invitation_events.request_id));

create function private.prevent_invitation_event_mutation() returns trigger language plpgsql set search_path='' as $$
begin raise exception 'Invitation events are append-only' using errcode='23514'; end $$;
revoke all on function private.prevent_invitation_event_mutation() from public,anon,authenticated;
create trigger invitation_events_immutable before update or delete on public.request_invitation_events
  for each row execute function private.prevent_invitation_event_mutation();

create function private.record_invitation_event() returns trigger language plpgsql security definer set search_path='' as $$
begin
  if tg_op='INSERT' then
    insert into public.request_invitation_events(request_id,actor_id,event_type) values(new.request_id,auth.uid(),'invited');
  elsif old.status is distinct from new.status then
    insert into public.request_invitation_events(request_id,actor_id,event_type,reason)
      values(new.request_id,auth.uid(),new.status,case when new.status='declined' then new.decline_reason end);
  end if;
  return new;
end $$;
revoke all on function private.record_invitation_event() from public,anon,authenticated;
create trigger record_invitation_event after insert or update on public.request_invitations
  for each row execute function private.record_invitation_event();

create function private.create_request_invitation() returns trigger language plpgsql security definer set search_path='' as $$
begin
  if new.routing_mode='direct' and new.status='submitted' then
    insert into public.request_invitations(request_id,customer_id,professional_id,response_due_at)
      values(new.id,new.customer_id,new.target_professional_id,new.submitted_at+interval '48 hours')
      on conflict(request_id) do nothing;
  end if;
  return new;
end $$;
revoke all on function private.create_request_invitation() from public,anon,authenticated;
create trigger create_request_invitation after insert or update of status on public.service_requests
  for each row execute function private.create_request_invitation();

-- Fail closed if deploying over earlier direct records: backfill requires a separately reviewed policy.
do $$ begin
  if exists(select 1 from public.service_requests where routing_mode='direct' and status<>'draft') then
    raise exception 'Existing direct requests require an explicit invitation backfill before M2';
  end if;
end $$;

create or replace function private.can_read_request(p_request_id uuid)
returns boolean language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.service_requests r where r.id=p_request_id and (
    r.customer_id=(select auth.uid()) or (r.status<>'draft' and (
      (r.routing_mode='direct' and r.target_professional_id=(select auth.uid())
        and exists(select 1 from public.request_invitations i where i.request_id=r.id and i.professional_id=(select auth.uid())))
      or (r.routing_mode='open' and exists(select 1 from public.request_matches m where m.request_id=r.id and m.tradesperson_id=(select auth.uid())))
    ))
  ))
$$;

-- All writers acquire the request lock before the invitation lock, including quote RPCs.
create function private.guard_invitation_quote() returns trigger language plpgsql security definer set search_path='' as $$
declare r public.service_requests%rowtype; i public.request_invitations%rowtype;
begin
  if new.status not in ('submitted','accepted') then return new; end if;
  select * into r from public.service_requests where id=new.request_id for update;
  if r.routing_mode<>'direct' then return new; end if;
  select * into i from public.request_invitations where request_id=r.id for update;
  if not found or i.professional_id<>new.tradesperson_id or i.status in ('declined','broadened')
    or (i.status='awaiting' and i.response_due_at<=clock_timestamp()) then
    raise exception 'Invitation no longer accepts a quote' using errcode='23514';
  end if;
  return new;
end $$;
revoke all on function private.guard_invitation_quote() from public,anon,authenticated;
create trigger guard_invitation_quote before insert or update of status on public.quotes
  for each row execute function private.guard_invitation_quote();

create function private.mark_invitation_quoted() returns trigger language plpgsql security definer set search_path='' as $$
begin
  if new.status='submitted' then
    update public.request_invitations set status='quoted',responded_at=clock_timestamp()
      where request_id=new.request_id and status='awaiting';
  end if;
  return new;
end $$;
revoke all on function private.mark_invitation_quoted() from public,anon,authenticated;
create trigger mark_invitation_quoted after insert on public.quotes for each row execute function private.mark_invitation_quoted();

create function private.respond_request_invitation(p_request_id uuid,p_action text,p_reason text default null,p_confirm boolean default false)
returns public.request_invitations language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); r public.service_requests%rowtype; i public.request_invitations%rowtype; successor public.service_requests%rowtype;
begin
  if actor is null then raise exception 'Authentication required' using errcode='42501'; end if;
  select * into r from public.service_requests where id=p_request_id for update;
  if not found or r.routing_mode<>'direct' then raise exception 'Invitation unavailable' using errcode='42501'; end if;
  select * into i from public.request_invitations where request_id=r.id for update;
  if not found then raise exception 'Invitation unavailable' using errcode='42501'; end if;
  if p_action='decline' then
    if actor<>i.professional_id then raise exception 'Not invited professional' using errcode='42501'; end if;
    if p_reason is null or length(trim(p_reason)) not between 10 and 1000 then raise exception 'Reason required' using errcode='23514'; end if;
    if i.status='declined' then return i; end if;
    if i.status<>'awaiting' or i.response_due_at<=clock_timestamp() or r.status not in ('submitted','matching') then
      raise exception 'Invitation no longer accepts a response' using errcode='23514';
    end if;
    update public.request_invitations set status='declined',decline_reason=trim(p_reason),responded_at=clock_timestamp()
      where request_id=r.id returning * into i;
  elsif p_action='broaden' then
    if actor<>i.customer_id then raise exception 'Not request owner' using errcode='42501'; end if;
    if p_confirm is distinct from true then raise exception 'Explicit confirmation required' using errcode='23514'; end if;
    if i.status='broadened' then return i; end if;
    if not (i.status='declined' or (i.status='awaiting' and i.response_due_at<=clock_timestamp()))
      or r.status not in ('submitted','matching')
      or exists(select 1 from public.quotes q where q.request_id=r.id and q.status in ('submitted','accepted')) then
      raise exception 'Invitation cannot be broadened' using errcode='23514';
    end if;
    -- Explicit successor: preserve original audience/history. No media, notes or conversations copied.
    successor:=private.upsert_request_draft(gen_random_uuid(),r.service_id,r.delivery_model,r.answers,r.district,r.neighborhood,r.preferred_timing);
    update public.request_invitations set status='broadened',successor_request_id=successor.id
      where request_id=r.id returning * into i;
  else raise exception 'Unknown action' using errcode='23514';
  end if;
  return i;
end $$;
revoke all on function private.respond_request_invitation(uuid,text,text,boolean) from public,anon;
grant execute on function private.respond_request_invitation(uuid,text,text,boolean) to authenticated;
create function public.respond_request_invitation(p_request_id uuid,p_action text,p_reason text default null,p_confirm boolean default false)
returns public.request_invitations language sql security invoker set search_path='' as $$
  select private.respond_request_invitation(p_request_id,p_action,p_reason,p_confirm)
$$;
revoke all on function public.respond_request_invitation(uuid,text,text,boolean) from public,anon;
grant execute on function public.respond_request_invitation(uuid,text,text,boolean) to authenticated;

do $$ begin
  if exists(select 1 from pg_publication where pubname='supabase_realtime') then
    alter publication supabase_realtime add table public.request_invitations;
  end if;
end $$;
