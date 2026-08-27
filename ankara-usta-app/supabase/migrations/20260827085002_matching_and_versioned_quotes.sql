create table public.tradesperson_availability (
  tradesperson_id uuid primary key references public.tradesperson_profiles(user_id) on delete cascade,
  available_from date not null,
  available_to date not null,
  accepts_urgent boolean not null default false,
  active boolean not null default true,
  updated_at timestamptz not null default now(),
  check (available_from <= available_to)
);

create index tradesperson_availability_active_range_idx
  on public.tradesperson_availability (available_from, available_to, tradesperson_id)
  where active;

create table public.matching_runs (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.service_requests(id) on delete cascade,
  supply_state text not null check (supply_state in ('no_supply', 'limited_supply', 'healthy')),
  eligible_count integer not null check (eligible_count >= 0),
  recommended_action text not null,
  calculated_at timestamptz not null default now()
);

create table public.request_matches (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.matching_runs(id) on delete cascade,
  request_id uuid not null references public.service_requests(id) on delete cascade,
  tradesperson_id uuid not null references public.tradesperson_profiles(user_id) on delete cascade,
  score integer not null check (score between 0 and 100),
  score_components jsonb not null check (jsonb_typeof(score_components) = 'object'),
  reasons jsonb not null check (jsonb_typeof(reasons) = 'array'),
  created_at timestamptz not null default now(),
  unique (request_id, tradesperson_id)
);

create index request_matches_request_score_idx
  on public.request_matches (request_id, score desc, tradesperson_id);
create index request_matches_tradesperson_created_idx
  on public.request_matches (tradesperson_id, created_at desc);

alter table public.quotes
  add column warranty_days integer not null default 0 check (warranty_days between 0 and 3650),
  add column included_scope text[] not null default array['Kapsam belirtilmedi']::text[] check (cardinality(included_scope) between 1 and 20),
  add column excluded_scope text[] not null default '{}'::text[] check (cardinality(excluded_scope) <= 20),
  add column note text check (note is null or length(note) <= 2000),
  add column supersedes_quote_id uuid references public.quotes(id),
  add column submitted_at timestamptz not null default now(),
  add column accepted_at timestamptz,
  add column accepted_by uuid references auth.users(id);

update public.quotes quote
set accepted_at = coalesce(quote.updated_at, now()),
    accepted_by = request.customer_id
from public.service_requests request
where quote.request_id = request.id and quote.status = 'accepted';

alter table public.quotes
  add constraint quotes_acceptance_consistency check (
    (status = 'accepted') = (accepted_at is not null and accepted_by is not null)
  );

create index quotes_supersedes_idx on public.quotes (supersedes_quote_id)
  where supersedes_quote_id is not null;
create unique index quotes_one_accepted_per_request_idx
  on public.quotes (request_id) where status = 'accepted';
create index quotes_current_request_idx
  on public.quotes (request_id, tradesperson_id, version desc)
  where status = 'submitted';

create or replace function private.guard_quote_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.status = 'accepted' then
    raise exception 'Accepted quotes are immutable';
  end if;
  if current_setting('app.quote_internal_mutation', true) <> 'on' then
    raise exception 'Submitted quotes are immutable; create a new version';
  end if;
  return new;
end;
$$;

revoke execute on function private.guard_quote_mutation()
from public, anon, authenticated, service_role;

create trigger quotes_guard_mutation
before update or delete on public.quotes
for each row execute function private.guard_quote_mutation();

create or replace function public.protect_customer_request_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  internal_transition boolean := current_setting('app.request_internal_transition', true) = 'on';
begin
  if new.customer_id <> old.customer_id
    or new.idempotency_key <> old.idempotency_key
    or new.service_id <> old.service_id
    or new.delivery_model <> old.delivery_model then
    raise exception 'Immutable request fields cannot be changed';
  end if;

  if internal_transition then
    if new.answers <> old.answers
      or new.district is distinct from old.district
      or new.neighborhood is distinct from old.neighborhood
      or new.preferred_timing is distinct from old.preferred_timing
      or new.submitted_at is distinct from old.submitted_at then
      raise exception 'Workflow transitions cannot edit request scope';
    end if;
    if (old.status, new.status) not in (
      ('submitted', 'matching'),
      ('matching', 'matching'),
      ('matching', 'quotes_received'),
      ('quotes_received', 'quotes_received'),
      ('quotes_received', 'provider_selected')
    ) then
      raise exception 'Invalid internal request transition: % -> %', old.status, new.status;
    end if;
    return new;
  end if;

  if old.status <> 'draft' then
    raise exception 'A submitted request cannot be edited by the customer';
  end if;
  if new.status not in ('draft', 'submitted') then
    raise exception 'Invalid customer request transition';
  end if;
  return new;
end;
$$;

revoke execute on function public.protect_customer_request_fields()
from public, anon, authenticated, service_role;

create or replace function public.match_request(p_request_id uuid)
returns public.matching_runs
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_row public.service_requests%rowtype;
  run_row public.matching_runs%rowtype;
  eligible_total integer;
  horizon_days integer;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;

  select * into request_row
  from public.service_requests
  where id = p_request_id
  for update;

  if not found or request_row.customer_id <> (select auth.uid()) then
    raise exception 'Request not found';
  end if;
  if request_row.status not in ('submitted', 'matching') then
    raise exception 'Request cannot be matched in its current state';
  end if;

  horizon_days := case request_row.preferred_timing
    when 'Bugün / acil' then 0
    when 'Bu hafta' then 7
    when 'Önümüzdeki iki hafta' then 14
    else 30
  end;

  delete from public.request_matches where request_id = p_request_id;

  insert into public.matching_runs (request_id, supply_state, eligible_count, recommended_action, calculated_at)
  values (p_request_id, 'no_supply', 0, 'broaden_time_or_area', now())
  on conflict (request_id) do update set calculated_at = excluded.calculated_at
  returning * into run_row;

  insert into public.request_matches (
    run_id, request_id, tradesperson_id, score, score_components, reasons
  )
  select run_row.id,
         request_row.id,
         profile.user_id,
         90
           + case when exists (
               select 1 from public.tradesperson_service_areas area
               where area.tradesperson_id = profile.user_id
                 and area.district = request_row.district
                 and area.neighborhood = request_row.neighborhood
             ) then 5 else 0 end
           + case when exists (
               select 1 from public.tradesperson_references reference
               where reference.tradesperson_id = profile.user_id
                 and reference.status = 'verified'
             ) then 5 else 0 end,
         jsonb_build_object(
           'service', 35,
           'district', 25,
           'availability', 20,
           'verification', 10,
           'neighborhood', case when exists (
             select 1 from public.tradesperson_service_areas area
             where area.tradesperson_id = profile.user_id
               and area.district = request_row.district
               and area.neighborhood = request_row.neighborhood
           ) then 5 else 0 end,
           'references', case when exists (
             select 1 from public.tradesperson_references reference
             where reference.tradesperson_id = profile.user_id
               and reference.status = 'verified'
           ) then 5 else 0 end
         ),
         to_jsonb(array_remove(array[
           'Talep edilen hizmeti veriyor',
           request_row.district || ' ilçesinde çalışıyor',
           'Tercih edilen zaman aralığında müsait',
           'Başvurusu ve mesleki belgesi doğrulanmış',
           case when exists (
             select 1 from public.tradesperson_service_areas area
             where area.tradesperson_id = profile.user_id
               and area.district = request_row.district
               and area.neighborhood = request_row.neighborhood
           ) then 'Aynı mahallede hizmet veriyor' end,
           case when exists (
             select 1 from public.tradesperson_references reference
             where reference.tradesperson_id = profile.user_id
               and reference.status = 'verified'
           ) then 'Doğrulanmış referansı bulunuyor' end
         ]::text[], null))
  from public.tradesperson_profiles profile
  where profile.application_status = 'approved'
    and exists (
      select 1 from public.tradesperson_services service
      where service.tradesperson_id = profile.user_id
        and service.service_id = request_row.service_id
    )
    and exists (
      select 1 from public.tradesperson_service_areas area
      where area.tradesperson_id = profile.user_id
        and area.district = request_row.district
    )
    and exists (
      select 1 from public.tradesperson_availability availability
      where availability.tradesperson_id = profile.user_id
        and availability.active
        and availability.available_from <= current_date + horizon_days
        and availability.available_to >= current_date
        and (horizon_days <> 0 or availability.accepts_urgent)
    )
    and exists (
      select 1 from public.tradesperson_documents document
      where document.tradesperson_id = profile.user_id
        and document.kind = 'professional_certificate'
        and document.status = 'verified'
        and (document.expires_at is null or document.expires_at >= current_date)
    )
  order by 4 desc, profile.user_id
  limit 20;

  select count(*)::integer into eligible_total
  from public.request_matches where request_id = p_request_id;

  update public.matching_runs
  set eligible_count = eligible_total,
      supply_state = case when eligible_total = 0 then 'no_supply' when eligible_total < 3 then 'limited_supply' else 'healthy' end,
      recommended_action = case when eligible_total = 0 then 'broaden_time_or_area' when eligible_total < 3 then 'continue_and_notify_supply' else 'invite_top_matches' end,
      calculated_at = now()
  where id = run_row.id
  returning * into run_row;

  perform set_config('app.request_internal_transition', 'on', true);
  update public.service_requests set status = 'matching' where id = p_request_id;
  return run_row;
end;
$$;

revoke execute on function public.match_request(uuid) from public, anon;
grant execute on function public.match_request(uuid) to authenticated;

create or replace function public.create_quote_version(
  p_request_id uuid,
  p_labor_amount_kurus bigint,
  p_material_amount_kurus bigint,
  p_estimated_duration_minutes integer,
  p_warranty_days integer,
  p_included_scope text[],
  p_excluded_scope text[],
  p_note text default null
)
returns public.quotes
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  previous_quote public.quotes%rowtype;
  created_quote public.quotes%rowtype;
  next_version integer;
begin
  if actor_id is null then raise exception 'Authentication required'; end if;
  if not private.is_quote_eligible() then raise exception 'Tradesperson is not eligible to quote'; end if;
  if cardinality(p_included_scope) not between 1 and 20
     or cardinality(p_excluded_scope) > 20
     or p_warranty_days not between 0 and 3650
     or p_estimated_duration_minutes <= 0
     or p_labor_amount_kurus < 0
     or p_material_amount_kurus < 0 then
    raise exception 'Quote fields are invalid';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_request_id::text || actor_id::text, 0));
  perform 1 from public.service_requests request
  where request.id = p_request_id and request.status in ('matching', 'quotes_received')
  for update;
  if not found then raise exception 'Request is not open for quotes'; end if;
  if not exists (
    select 1 from public.request_matches match
    where match.request_id = p_request_id and match.tradesperson_id = actor_id
  ) then raise exception 'Tradesperson was not matched to this request'; end if;

  select * into previous_quote
  from public.quotes
  where request_id = p_request_id and tradesperson_id = actor_id
  order by version desc limit 1;
  next_version := coalesce(previous_quote.version, 0) + 1;

  perform set_config('app.quote_internal_mutation', 'on', true);
  update public.quotes set status = 'expired', updated_at = now()
  where request_id = p_request_id and tradesperson_id = actor_id and status = 'submitted';

  insert into public.quotes (
    request_id, tradesperson_id, status, labor_amount_kurus,
    material_amount_kurus, estimated_duration_minutes, warranty_days,
    included_scope, excluded_scope, note, version, supersedes_quote_id, submitted_at
  ) values (
    p_request_id, actor_id, 'submitted', p_labor_amount_kurus,
    p_material_amount_kurus, p_estimated_duration_minutes, p_warranty_days,
    p_included_scope, coalesce(p_excluded_scope, '{}'::text[]), p_note,
    next_version, previous_quote.id, now()
  ) returning * into created_quote;

  perform set_config('app.request_internal_transition', 'on', true);
  update public.service_requests set status = 'quotes_received' where id = p_request_id;
  return created_quote;
end;
$$;

revoke execute on function public.create_quote_version(uuid,bigint,bigint,integer,integer,text[],text[],text)
from public, anon;
grant execute on function public.create_quote_version(uuid,bigint,bigint,integer,integer,text[],text[],text)
to authenticated;

create or replace function public.accept_quote(p_quote_id uuid)
returns public.quotes
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  quote_row public.quotes%rowtype;
  request_row public.service_requests%rowtype;
begin
  if actor_id is null then raise exception 'Authentication required'; end if;

  select request.* into request_row
  from public.service_requests request
  join public.quotes quote on quote.request_id = request.id
  where quote.id = p_quote_id
  for update of request;

  if not found or request_row.customer_id <> actor_id then raise exception 'Quote not found'; end if;
  if request_row.status <> 'quotes_received' then raise exception 'A quote has already been accepted or the request is closed'; end if;

  select * into quote_row from public.quotes where id = p_quote_id;
  if quote_row.status <> 'submitted' then raise exception 'Quote is not available'; end if;
  if exists (
    select 1 from public.quotes newer
    where newer.request_id = quote_row.request_id
      and newer.tradesperson_id = quote_row.tradesperson_id
      and newer.version > quote_row.version
  ) then raise exception 'Only the latest quote version can be accepted'; end if;

  perform set_config('app.quote_internal_mutation', 'on', true);
  update public.quotes
  set status = case when id = p_quote_id then 'accepted' else 'rejected' end,
      accepted_at = case when id = p_quote_id then now() else null end,
      accepted_by = case when id = p_quote_id then actor_id else null end,
      updated_at = now()
  where request_id = quote_row.request_id and status = 'submitted';

  perform set_config('app.request_internal_transition', 'on', true);
  update public.service_requests set status = 'provider_selected' where id = quote_row.request_id;
  select * into quote_row from public.quotes where id = p_quote_id;
  return quote_row;
end;
$$;

revoke execute on function public.accept_quote(uuid) from public, anon;
grant execute on function public.accept_quote(uuid) to authenticated;

alter table public.tradesperson_availability enable row level security;
alter table public.matching_runs enable row level security;
alter table public.request_matches enable row level security;

create policy "tradespeople manage own availability"
on public.tradesperson_availability for all to authenticated
using ((select auth.uid()) = tradesperson_id or (select private.is_admin()))
with check ((select auth.uid()) = tradesperson_id or (select private.is_admin()));

create policy "customers read own matching runs"
on public.matching_runs for select to authenticated
using (exists (
  select 1 from public.service_requests request
  where request.id = request_id and request.customer_id = (select auth.uid())
));

create policy "customers and matched tradespeople read matches"
on public.request_matches for select to authenticated
using (
  tradesperson_id = (select auth.uid())
  or exists (
    select 1 from public.service_requests request
    where request.id = request_id and request.customer_id = (select auth.uid())
  )
);

create policy "matched tradespeople read request scope"
on public.service_requests for select to authenticated
using (exists (
  select 1 from public.request_matches match
  where match.request_id = service_requests.id and match.tradesperson_id = (select auth.uid())
));

drop policy if exists "tradespeople read own quotes" on public.quotes;
create policy "participants read quotes"
on public.quotes for select to authenticated
using (
  tradesperson_id = (select auth.uid())
  or exists (
    select 1 from public.service_requests request
    where request.id = request_id and request.customer_id = (select auth.uid())
  )
);

revoke insert, update, delete on public.quotes from authenticated;
grant select on public.quotes to authenticated;
grant select, insert, update on public.tradesperson_availability to authenticated;
grant select on public.matching_runs, public.request_matches to authenticated;
