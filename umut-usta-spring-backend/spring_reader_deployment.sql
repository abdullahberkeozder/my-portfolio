-- First read-only deployment. Credentials are provisioned separately, never in migration history.
-- Version matches the Supabase migration record applied on 2026-09-16.
-- Fail if the role already exists rather than changing unknown existing privileges.
create role booking_reader nologin nosuperuser nocreatedb nocreaterole
  noinherit noreplication nobypassrls connection limit 10;
alter role booking_reader set default_transaction_read_only = on;
alter role booking_reader set statement_timeout = '10s';
grant usage on schema public to booking_reader;

grant select on public.service_configs, public.appointment_availability_days,
  public.appointment_availability_slots to booking_reader;
grant select (user_id, role, status) on public.admin_profiles to booking_reader;
grant select (id, customer_name, customer_phone, customer_email, customer_note,
  notes, admin_note, customer_action_note, cancellation_reason, customer_feedback,
  lead_quality, service_type, requested_date, requested_time, status, created_at,
  archived_at) on public.appointment_requests to booking_reader;

create policy spring_reader_select on public.service_configs
  for select to booking_reader using (true);
create policy spring_reader_select on public.appointment_availability_days
  for select to booking_reader using (true);
create policy spring_reader_select on public.appointment_availability_slots
  for select to booking_reader using (true);
create policy spring_reader_select on public.admin_profiles
  for select to booking_reader using (true);
create policy spring_reader_select on public.appointment_requests
  for select to booking_reader using (true);

-- PUBLIC privileges are additive, even for NOINHERIT roles. Fail closed if the
-- existing schema would turn this reader into a writer through a definer RPC.
do $$
begin
  if has_schema_privilege('booking_reader', 'public', 'CREATE') then
    raise exception 'Reader unexpectedly inherits schema creation';
  end if;
  if exists (
    select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.prosecdef
      and p.prorettype not in ('trigger'::regtype, 'event_trigger'::regtype)
      and p.oid <> 'public.is_admin(uuid)'::regprocedure
      and has_function_privilege('booking_reader', p.oid, 'EXECUTE')
  ) then
    raise exception 'Reader unexpectedly inherits a security-definer RPC';
  end if;
end $$;
