-- M4 slice 1: immutable customer feedback on a quote, using the existing version engine.
create table public.quote_revision_requests (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null unique references public.quotes(id),
  customer_id uuid not null references auth.users(id),
  professional_id uuid not null references public.tradesperson_profiles(user_id),
  fields text[] not null check(cardinality(fields) between 1 and 5 and fields <@ array['price','material','duration','scope','warranty']::text[]),
  reason text not null check(length(trim(reason)) between 10 and 2000),
  created_at timestamptz not null default now()
);
create index quote_revision_customer_idx on public.quote_revision_requests(customer_id,created_at desc);
create index quote_revision_professional_idx on public.quote_revision_requests(professional_id,created_at desc);
alter table public.quote_revision_requests enable row level security;
revoke all on public.quote_revision_requests from public,anon,authenticated;
grant select on public.quote_revision_requests to authenticated;
create policy "quote revision participants read" on public.quote_revision_requests for select to authenticated
  using(customer_id=(select auth.uid()) or professional_id=(select auth.uid()));
create function private.guard_revision_request() returns trigger language plpgsql set search_path='' as $$
begin raise exception 'Revision requests are immutable' using errcode='23514'; end $$;
revoke all on function private.guard_revision_request() from public,anon,authenticated;
create trigger quote_revision_immutable before update or delete on public.quote_revision_requests
  for each row execute function private.guard_revision_request();

create function private.request_quote_revision(p_quote_id uuid,p_fields text[],p_reason text)
returns public.quote_revision_requests language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); q public.quotes%rowtype; r public.service_requests%rowtype;
  saved public.quote_revision_requests%rowtype; normalized text[];
begin
  if actor is null then raise exception 'Authentication required' using errcode='42501'; end if;
  select * into q from public.quotes where id=p_quote_id;
  select * into r from public.service_requests where id=q.request_id for update;
  if r.id is null or r.customer_id<>actor then raise exception 'Quote unavailable' using errcode='42501'; end if;
  select array_agg(distinct f order by f) into normalized from unnest(p_fields) f;
  if normalized is null or array_position(p_fields,null) is not null or cardinality(normalized) not between 1 and 5
    or not normalized <@ array['price','material','duration','scope','warranty']::text[]
    or p_reason is null or length(trim(p_reason)) not between 10 and 2000 then
    raise exception 'Invalid revision request' using errcode='22023';
  end if;
  select * into saved from public.quote_revision_requests where quote_id=q.id;
  if found then
    if saved.fields=normalized and saved.reason=trim(p_reason) then return saved; end if;
    raise exception 'Revision request already recorded' using errcode='23514';
  end if;
  -- Re-read after acquiring the request lock; a concurrent version may have expired this row.
  select * into q from public.quotes where id=p_quote_id;
  if r.status<>'quotes_received' or q.status<>'submitted' or exists(
    select 1 from public.quotes newer where newer.request_id=q.request_id and newer.tradesperson_id=q.tradesperson_id and newer.version>q.version
  ) then raise exception 'Quote is no longer current' using errcode='23514'; end if;
  insert into public.quote_revision_requests(quote_id,customer_id,professional_id,fields,reason)
    values(q.id,actor,q.tradesperson_id,normalized,trim(p_reason)) returning * into saved;
  return saved;
end $$;
revoke all on function private.request_quote_revision(uuid,text[],text) from public,anon;
grant execute on function private.request_quote_revision(uuid,text[],text) to authenticated;
create function public.request_quote_revision(p_quote_id uuid,p_fields text[],p_reason text)
returns public.quote_revision_requests language sql security invoker set search_path='' as $$
  select private.request_quote_revision(p_quote_id,p_fields,p_reason)
$$;
revoke all on function public.request_quote_revision(uuid,text[],text) from public,anon;
grant execute on function public.request_quote_revision(uuid,text[],text) to authenticated;

create function private.revise_quote_version(p_base_quote_id uuid,p_labor_amount_kurus bigint,p_material_amount_kurus bigint,
  p_estimated_duration_minutes integer,p_warranty_days integer,p_included_scope text[],p_excluded_scope text[],p_note text default null)
returns public.quotes language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); base public.quotes%rowtype; latest public.quotes%rowtype;
begin
  if actor is null then raise exception 'Authentication required' using errcode='42501'; end if;
  select * into base from public.quotes where id=p_base_quote_id;
  if not found or base.tradesperson_id<>actor then raise exception 'Quote unavailable' using errcode='42501'; end if;
  -- Preserve create_quote_version's advisory -> request lock order, including legacy callers.
  perform pg_advisory_xact_lock(hashtextextended(base.request_id::text||actor::text,0));
  perform 1 from public.service_requests where id=base.request_id for update;
  select * into latest from public.quotes where request_id=base.request_id and tradesperson_id=actor order by version desc limit 1;
  if latest.id<>base.id then
    -- Lost acknowledgement retry: return only the exact immediate successor payload.
    if latest.supersedes_quote_id=base.id
      and latest.labor_amount_kurus is not distinct from p_labor_amount_kurus
      and latest.material_amount_kurus is not distinct from p_material_amount_kurus
      and latest.estimated_duration_minutes is not distinct from p_estimated_duration_minutes
      and latest.warranty_days is not distinct from p_warranty_days
      and latest.included_scope is not distinct from p_included_scope
      and latest.excluded_scope is not distinct from coalesce(p_excluded_scope,'{}'::text[])
      and latest.note is not distinct from p_note then return latest;
    end if;
    raise exception 'Base quote is stale' using errcode='23514';
  end if;
  if latest.status<>'submitted' then raise exception 'Quote is closed' using errcode='23514'; end if;
  return private.create_quote_version(base.request_id,p_labor_amount_kurus,p_material_amount_kurus,
    p_estimated_duration_minutes,p_warranty_days,p_included_scope,p_excluded_scope,p_note);
end $$;
revoke all on function private.revise_quote_version(uuid,bigint,bigint,integer,integer,text[],text[],text) from public,anon;
grant execute on function private.revise_quote_version(uuid,bigint,bigint,integer,integer,text[],text[],text) to authenticated;
create function public.revise_quote_version(p_base_quote_id uuid,p_labor_amount_kurus bigint,p_material_amount_kurus bigint,
  p_estimated_duration_minutes integer,p_warranty_days integer,p_included_scope text[],p_excluded_scope text[],p_note text default null)
returns public.quotes language sql security invoker set search_path='' as $$
  select private.revise_quote_version(p_base_quote_id,p_labor_amount_kurus,p_material_amount_kurus,
    p_estimated_duration_minutes,p_warranty_days,p_included_scope,p_excluded_scope,p_note)
$$;
revoke all on function public.revise_quote_version(uuid,bigint,bigint,integer,integer,text[],text[],text) from public,anon;
grant execute on function public.revise_quote_version(uuid,bigint,bigint,integer,integer,text[],text[],text) to authenticated;
