-- Keep privileged implementations outside the exposed public schema. Public RPC
-- entry points remain SECURITY INVOKER wrappers, while the private functions
-- retain the existing explicit auth.uid() authorization and locking rules.
grant usage on schema private to authenticated;

alter function public.match_request(uuid) set schema private;
alter function public.create_quote_version(uuid,bigint,bigint,integer,integer,text[],text[],text) set schema private;
alter function public.accept_quote(uuid) set schema private;
alter function public.transition_job(uuid,text) set schema private;
alter function public.send_job_message(uuid,text,uuid) set schema private;
alter function public.propose_inspection(uuid,timestamptz,text) set schema private;
alter function public.respond_inspection(uuid,boolean) set schema private;
alter function public.propose_scope_change(uuid,text,bigint,bigint,integer,text[],text[]) set schema private;
alter function public.respond_scope_change(uuid,boolean) set schema private;
alter function public.save_job_address(uuid,text,text,text,text) set schema private;

revoke all on function private.match_request(uuid) from public, anon;
revoke all on function private.create_quote_version(uuid,bigint,bigint,integer,integer,text[],text[],text) from public, anon;
revoke all on function private.accept_quote(uuid) from public, anon;
revoke all on function private.transition_job(uuid,text) from public, anon;
revoke all on function private.send_job_message(uuid,text,uuid) from public, anon;
revoke all on function private.propose_inspection(uuid,timestamptz,text) from public, anon;
revoke all on function private.respond_inspection(uuid,boolean) from public, anon;
revoke all on function private.propose_scope_change(uuid,text,bigint,bigint,integer,text[],text[]) from public, anon;
revoke all on function private.respond_scope_change(uuid,boolean) from public, anon;
revoke all on function private.save_job_address(uuid,text,text,text,text) from public, anon;

grant execute on function private.match_request(uuid) to authenticated;
grant execute on function private.create_quote_version(uuid,bigint,bigint,integer,integer,text[],text[],text) to authenticated;
grant execute on function private.accept_quote(uuid) to authenticated;
grant execute on function private.transition_job(uuid,text) to authenticated;
grant execute on function private.send_job_message(uuid,text,uuid) to authenticated;
grant execute on function private.propose_inspection(uuid,timestamptz,text) to authenticated;
grant execute on function private.respond_inspection(uuid,boolean) to authenticated;
grant execute on function private.propose_scope_change(uuid,text,bigint,bigint,integer,text[],text[]) to authenticated;
grant execute on function private.respond_scope_change(uuid,boolean) to authenticated;
grant execute on function private.save_job_address(uuid,text,text,text,text) to authenticated;

create function public.match_request(p_request_id uuid)
returns public.matching_runs language sql security invoker set search_path = ''
as $$ select private.match_request(p_request_id) $$;

create function public.create_quote_version(
  p_request_id uuid,
  p_labor_amount_kurus bigint,
  p_material_amount_kurus bigint,
  p_estimated_duration_minutes integer,
  p_warranty_days integer,
  p_included_scope text[],
  p_excluded_scope text[],
  p_note text default null
)
returns public.quotes language sql security invoker set search_path = ''
as $$
  select private.create_quote_version(
    p_request_id,p_labor_amount_kurus,p_material_amount_kurus,
    p_estimated_duration_minutes,p_warranty_days,p_included_scope,
    p_excluded_scope,p_note
  )
$$;

create function public.accept_quote(p_quote_id uuid)
returns public.quotes language sql security invoker set search_path = ''
as $$ select private.accept_quote(p_quote_id) $$;

create function public.transition_job(p_job_id uuid,p_status text)
returns public.jobs language sql security invoker set search_path = ''
as $$ select private.transition_job(p_job_id,p_status) $$;

create function public.send_job_message(p_job_id uuid,p_body text,p_idempotency_key uuid)
returns public.job_messages language sql security invoker set search_path = ''
as $$ select private.send_job_message(p_job_id,p_body,p_idempotency_key) $$;

create function public.propose_inspection(p_job_id uuid,p_scheduled_for timestamptz,p_note text default null)
returns public.inspection_appointments language sql security invoker set search_path = ''
as $$ select private.propose_inspection(p_job_id,p_scheduled_for,p_note) $$;

create function public.respond_inspection(p_appointment_id uuid,p_accept boolean)
returns public.inspection_appointments language sql security invoker set search_path = ''
as $$ select private.respond_inspection(p_appointment_id,p_accept) $$;

create function public.propose_scope_change(
  p_job_id uuid,p_description text,p_labor_delta_kurus bigint,
  p_material_delta_kurus bigint,p_duration_delta_minutes integer,
  p_included_scope text[],p_excluded_scope text[]
)
returns public.scope_changes language sql security invoker set search_path = ''
as $$
  select private.propose_scope_change(
    p_job_id,p_description,p_labor_delta_kurus,p_material_delta_kurus,
    p_duration_delta_minutes,p_included_scope,p_excluded_scope
  )
$$;

create function public.respond_scope_change(p_scope_change_id uuid,p_approve boolean)
returns public.scope_changes language sql security invoker set search_path = ''
as $$ select private.respond_scope_change(p_scope_change_id,p_approve) $$;

create function public.save_job_address(
  p_job_id uuid,p_address_line text,p_building text default null,
  p_apartment text default null,p_directions text default null
)
returns public.job_addresses language sql security invoker set search_path = ''
as $$ select private.save_job_address(p_job_id,p_address_line,p_building,p_apartment,p_directions) $$;

revoke execute on function public.match_request(uuid) from public, anon;
revoke execute on function public.create_quote_version(uuid,bigint,bigint,integer,integer,text[],text[],text) from public, anon;
revoke execute on function public.accept_quote(uuid) from public, anon;
revoke execute on function public.transition_job(uuid,text) from public, anon;
revoke execute on function public.send_job_message(uuid,text,uuid) from public, anon;
revoke execute on function public.propose_inspection(uuid,timestamptz,text) from public, anon;
revoke execute on function public.respond_inspection(uuid,boolean) from public, anon;
revoke execute on function public.propose_scope_change(uuid,text,bigint,bigint,integer,text[],text[]) from public, anon;
revoke execute on function public.respond_scope_change(uuid,boolean) from public, anon;
revoke execute on function public.save_job_address(uuid,text,text,text,text) from public, anon;

grant execute on function public.match_request(uuid) to authenticated;
grant execute on function public.create_quote_version(uuid,bigint,bigint,integer,integer,text[],text[],text) to authenticated;
grant execute on function public.accept_quote(uuid) to authenticated;
grant execute on function public.transition_job(uuid,text) to authenticated;
grant execute on function public.send_job_message(uuid,text,uuid) to authenticated;
grant execute on function public.propose_inspection(uuid,timestamptz,text) to authenticated;
grant execute on function public.respond_inspection(uuid,boolean) to authenticated;
grant execute on function public.propose_scope_change(uuid,text,bigint,bigint,integer,text[],text[]) to authenticated;
grant execute on function public.respond_scope_change(uuid,boolean) to authenticated;
grant execute on function public.save_job_address(uuid,text,text,text,text) to authenticated;

-- The directory view no longer needs an externally executable privileged helper.
create or replace view public.tradesperson_directory with (security_invoker = true) as
select profile.user_id,profile.display_name,profile.bio,profile.city,
  exists (
    select 1 from public.tradesperson_documents document
    where document.tradesperson_id=profile.user_id
      and document.kind='professional_certificate'
      and document.status='verified'
      and (document.expires_at is null or document.expires_at>=current_date)
  ) as verification_badge
from public.tradesperson_profiles profile
where profile.application_status='approved';

revoke execute on function public.has_current_professional_verification(uuid) from public,anon,authenticated;
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke execute on function public.rls_auto_enable() from public,anon,authenticated';
  end if;
end
$$;

-- Merge overlapping SELECT policies and make owner mutation policies command-specific.
drop policy "customers read own requests" on public.service_requests;
drop policy "matched tradespeople read request scope" on public.service_requests;
create policy "customers and matched tradespeople read request scope"
on public.service_requests for select to authenticated
using (
  (select auth.uid())=customer_id
  or exists (
    select 1 from public.request_matches match
    where match.request_id=service_requests.id
      and match.tradesperson_id=(select auth.uid())
  )
);

drop policy "users manage own services" on public.tradesperson_services;
create policy "users insert own services" on public.tradesperson_services for insert to authenticated
with check ((select auth.uid())=tradesperson_id and exists (
  select 1 from public.tradesperson_profiles profile
  where profile.user_id=tradesperson_id and profile.application_status in ('draft','needs_changes','rejected')
));
create policy "users update own services" on public.tradesperson_services for update to authenticated
using ((select auth.uid())=tradesperson_id and exists (
  select 1 from public.tradesperson_profiles profile
  where profile.user_id=tradesperson_id and profile.application_status in ('draft','needs_changes','rejected')
))
with check ((select auth.uid())=tradesperson_id and exists (
  select 1 from public.tradesperson_profiles profile
  where profile.user_id=tradesperson_id and profile.application_status in ('draft','needs_changes','rejected')
));
create policy "users delete own services" on public.tradesperson_services for delete to authenticated
using ((select auth.uid())=tradesperson_id and exists (
  select 1 from public.tradesperson_profiles profile
  where profile.user_id=tradesperson_id and profile.application_status in ('draft','needs_changes','rejected')
));

drop policy "users manage own service areas" on public.tradesperson_service_areas;
create policy "users insert own service areas" on public.tradesperson_service_areas for insert to authenticated
with check ((select auth.uid())=tradesperson_id and exists (
  select 1 from public.tradesperson_profiles profile
  where profile.user_id=tradesperson_id and profile.application_status in ('draft','needs_changes','rejected')
));
create policy "users update own service areas" on public.tradesperson_service_areas for update to authenticated
using ((select auth.uid())=tradesperson_id and exists (
  select 1 from public.tradesperson_profiles profile
  where profile.user_id=tradesperson_id and profile.application_status in ('draft','needs_changes','rejected')
))
with check ((select auth.uid())=tradesperson_id and exists (
  select 1 from public.tradesperson_profiles profile
  where profile.user_id=tradesperson_id and profile.application_status in ('draft','needs_changes','rejected')
));
create policy "users delete own service areas" on public.tradesperson_service_areas for delete to authenticated
using ((select auth.uid())=tradesperson_id and exists (
  select 1 from public.tradesperson_profiles profile
  where profile.user_id=tradesperson_id and profile.application_status in ('draft','needs_changes','rejected')
));
