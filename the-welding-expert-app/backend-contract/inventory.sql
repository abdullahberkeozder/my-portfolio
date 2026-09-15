-- Read-only. Definitions and server version only; no customer data or secrets.
select current_setting('server_version') as server_version;

select n.nspname as schema_name, p.proname,
       pg_get_function_identity_arguments(p.oid) as arguments,
       pg_get_functiondef(p.oid) as definition
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('create_appointment_request',
    'handle_appointment_status_slot_sync', 'close_slot_on_appointment_confirmation',
    'submit_appointment_customer_action', 'get_public_appointment_request')
order by p.proname, arguments;

select c.relname as table_name, t.tgname, pg_get_triggerdef(t.oid) as definition
from pg_trigger t join pg_class c on c.oid = t.tgrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and not t.tgisinternal
  and c.relname in ('appointment_requests', 'appointment_availability_slots',
    'appointment_availability_days', 'appointment_customer_actions')
order by c.relname, t.tgname;

select tablename, indexname, indexdef from pg_indexes
where schemaname = 'public' and tablename in
  ('appointment_requests', 'appointment_availability_slots', 'appointment_availability_days')
order by tablename, indexname;

-- Pre-deployment integrity checks (Counts and IDs only; zero customer PII)
-- 1. Check for duplicate active confirmed appointments for the same date/time
select r.requested_date, r.requested_time, count(*) as active_confirmed_count
from public.appointment_requests r
where r.status = 'confirmed' and r.archived_at is null
group by r.requested_date, r.requested_time
having count(*) > 1;

-- 2. Check for slot availability inconsistencies (active confirmed appointment but slot is available)
select r.id as request_id, r.requested_date, r.requested_time, s.id as slot_id, s.is_available
from public.appointment_requests r
join public.appointment_availability_days d on d.work_date = r.requested_date
join public.appointment_availability_slots s on s.day_id = d.id and s.slot_time = r.requested_time
where r.status = 'confirmed' and r.archived_at is null and s.is_available = true;

-- 3. Check role table & column privileges for reader/writer
select grantee, table_name, privilege_type
from information_schema.role_table_grants
where grantee in ('booking_reader', 'booking_writer')
order by grantee, table_name, privilege_type;

select grantee, table_name, column_name, privilege_type
from information_schema.role_column_grants
where grantee in ('booking_reader', 'booking_writer')
order by grantee, table_name, column_name, privilege_type;

-- 4. Check RLS status and policies
select tablename, rowsecurity from pg_tables
where schemaname = 'public' and tablename in
  ('appointment_requests', 'appointment_availability_slots', 'appointment_availability_days', 'admin_profiles');

select schemaname, tablename, policyname, permissive, roles, cmd, qual
from pg_policies
where schemaname = 'public' and tablename in
  ('appointment_requests', 'appointment_availability_slots', 'appointment_availability_days', 'admin_profiles')
order by tablename, policyname;
