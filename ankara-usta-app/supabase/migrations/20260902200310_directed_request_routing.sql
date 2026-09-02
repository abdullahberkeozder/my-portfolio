-- M0/M1. Additive and gated in the application until multi-account verification.
alter table public.service_requests
  add column routing_mode text not null default 'open',
  add column target_professional_id uuid references public.tradesperson_profiles(user_id),
  add constraint request_routing_valid check (
    (routing_mode='open' and target_professional_id is null)
    or (routing_mode='direct' and target_professional_id is not null)
  ),
  add constraint request_no_self_target check (target_professional_id is distinct from customer_id);

create index service_requests_direct_target_idx
  on public.service_requests(target_professional_id,status) where target_professional_id is not null;

create function private.direct_target_eligible(p_target uuid,p_service text,p_district text)
returns boolean language sql stable security definer set search_path=''
as $$
  select exists(select 1 from public.tradesperson_profiles p
    where p.user_id=p_target and p.application_status='approved'
      and exists(select 1 from public.tradesperson_services s where s.tradesperson_id=p.user_id and s.service_id=p_service)
      and (nullif(trim(p_district),'') is null or exists(select 1 from public.tradesperson_service_areas a where a.tradesperson_id=p.user_id and a.district=p_district))
      and exists(select 1 from public.tradesperson_documents d where d.tradesperson_id=p.user_id
        and d.kind='professional_certificate' and d.status='verified' and (d.expires_at is null or d.expires_at>=current_date)))
$$;
revoke all on function private.direct_target_eligible(uuid,text,text) from public,anon,authenticated;

create function private.guard_request_routing()
returns trigger language plpgsql security definer set search_path=''
as $$
begin
  if tg_op='UPDATE' then
    if (old.target_professional_id is not null or old.status<>'draft')
      and (new.routing_mode is distinct from old.routing_mode or new.target_professional_id is distinct from old.target_professional_id) then
      raise exception 'Request audience is immutable' using errcode='23514';
    end if;
  end if;
  if new.routing_mode='direct' and new.status in ('draft','submitted') then
    if not private.direct_target_eligible(new.target_professional_id,new.service_id,new.district) then
      raise exception 'Selected professional is not eligible' using errcode='23514';
    end if;
  end if;
  return new;
end;
$$;
revoke all on function private.guard_request_routing() from public,anon,authenticated;
create trigger guard_request_routing before insert or update on public.service_requests
  for each row execute function private.guard_request_routing();

create function private.upsert_direct_request_draft(
  p_idempotency_key uuid,p_service_id text,p_delivery_model text,p_answers jsonb,p_target_professional_id uuid,
  p_district text default null,p_neighborhood text default null,p_preferred_timing text default null
)
returns public.service_requests language plpgsql security definer set search_path=''
as $$
declare actor uuid := (select auth.uid()); r public.service_requests%rowtype;
begin
  if actor is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if p_target_professional_id is null or p_target_professional_id=actor then
    raise exception 'Invalid target' using errcode='23514';
  end if;
  if private.request_service_model(p_service_id) is distinct from p_delivery_model
    or not private.request_answers_valid(p_service_id,p_answers,false) then
    raise exception 'Draft fields are invalid' using errcode='23514';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(actor::text||p_idempotency_key::text,0));
  select * into r from public.service_requests where customer_id=actor and idempotency_key=p_idempotency_key for update;
  if found then
    if r.routing_mode<>'direct' or r.target_professional_id is distinct from p_target_professional_id
      or r.service_id<>p_service_id or r.delivery_model<>p_delivery_model then
      raise exception 'Idempotency key belongs to another request' using errcode='23505';
    end if;
    if r.status<>'draft' then return r; end if;
    update public.service_requests set answers=p_answers,district=nullif(trim(p_district),''),
      neighborhood=nullif(trim(p_neighborhood),''),preferred_timing=nullif(trim(p_preferred_timing),'')
      where id=r.id returning * into r;
    return r;
  end if;
  insert into public.service_requests(customer_id,service_id,delivery_model,status,answers,district,neighborhood,preferred_timing,idempotency_key,routing_mode,target_professional_id)
  values(actor,p_service_id,p_delivery_model,'draft',p_answers,nullif(trim(p_district),''),nullif(trim(p_neighborhood),''),nullif(trim(p_preferred_timing),''),p_idempotency_key,'direct',p_target_professional_id)
  returning * into r;
  return r;
end;
$$;
revoke all on function private.upsert_direct_request_draft(uuid,text,text,jsonb,uuid,text,text,text) from public,anon;
grant execute on function private.upsert_direct_request_draft(uuid,text,text,jsonb,uuid,text,text,text) to authenticated;

create function public.upsert_direct_request_draft(
  p_idempotency_key uuid,p_service_id text,p_delivery_model text,p_answers jsonb,p_target_professional_id uuid,
  p_district text default null,p_neighborhood text default null,p_preferred_timing text default null
)
returns public.service_requests language sql security invoker set search_path=''
as $$ select private.upsert_direct_request_draft(p_idempotency_key,p_service_id,p_delivery_model,p_answers,p_target_professional_id,p_district,p_neighborhood,p_preferred_timing) $$;
revoke all on function public.upsert_direct_request_draft(uuid,text,text,jsonb,uuid,text,text,text) from public,anon;
grant execute on function public.upsert_direct_request_draft(uuid,text,text,jsonb,uuid,text,text,text) to authenticated;

-- Preserve existing scoring/availability logic, adding the audience filter BEFORE LIMIT.
-- Fail migration on unexpected definition rather than silently losing authorization.
do $$
declare original text; amended text;
begin
  original := pg_get_functiondef('private.upsert_request_draft(uuid,text,text,jsonb,text,text,text)'::regprocedure);
  amended := replace(original, 'if found then',
    $replacement$if found and request_row.routing_mode <> 'open' then
      raise exception 'Idempotency key belongs to a direct request' using errcode='23505';
    end if;
    if found then$replacement$);
  if amended=original then raise exception 'Draft definition changed; review routing migration'; end if;
  execute amended;
  original := pg_get_functiondef('private.match_request(uuid)'::regprocedure);
  amended := replace(original, $needle$where profile.application_status = 'approved'$needle$,
    $replacement$where profile.application_status = 'approved'
      and (request_row.routing_mode='open' or profile.user_id=request_row.target_professional_id)$replacement$);
  if amended=original then raise exception 'Matching definition changed; review routing migration'; end if;
  execute amended;
end;
$$;

-- Defense in depth for future matching/quote writers, including privileged RPCs.
create function private.guard_direct_recipient()
returns trigger language plpgsql security definer set search_path=''
as $$
declare r public.service_requests%rowtype;
begin
  select * into r from public.service_requests where id=new.request_id for share;
  if r.routing_mode='direct' and (new.tradesperson_id is distinct from r.target_professional_id
    or not private.direct_target_eligible(new.tradesperson_id,r.service_id,r.district)) then
    raise exception 'Professional is outside request audience' using errcode='42501';
  end if;
  return new;
end;
$$;
revoke all on function private.guard_direct_recipient() from public,anon,authenticated;
create trigger guard_direct_match before insert or update on public.request_matches
  for each row execute function private.guard_direct_recipient();
create trigger guard_direct_quote before insert or update of request_id,tradesperson_id,status on public.quotes
  for each row execute function private.guard_direct_recipient();

create or replace function private.can_read_request(p_request_id uuid)
returns boolean language sql stable security definer set search_path=''
as $$
  select exists(select 1 from public.service_requests r where r.id=p_request_id and (
    r.customer_id=(select auth.uid()) or (
      r.status<>'draft' and (r.routing_mode='open' or r.target_professional_id=(select auth.uid()))
      and exists(select 1 from public.request_matches m where m.request_id=r.id and m.tradesperson_id=(select auth.uid()))
    )
  ))
$$;
-- Existing RLS policies and grants remain in place. No direct table-write grant is added.
