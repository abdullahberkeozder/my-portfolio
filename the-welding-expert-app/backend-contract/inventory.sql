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
