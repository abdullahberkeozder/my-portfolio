do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'service_requests', 'matching_runs', 'request_matches', 'quotes',
    'jobs', 'job_events', 'job_messages', 'inspection_appointments',
    'scope_changes', 'job_addresses', 'work_log_entries', 'reviews',
    'workmanship_certificates', 'dispute_cases', 'dispute_evidence',
    'dispute_statements', 'dispute_decisions', 'dispute_events',
    'dispute_internal_notes', 'dispute_appeals', 'tradesperson_sanctions'
  ] loop
    if to_regclass(format('public.%I', table_name)) is not null
      and not exists (
        select 1
        from pg_publication_tables
        where pubname = 'supabase_realtime'
          and schemaname = 'public'
          and tablename = table_name
      ) then
      execute format('alter publication supabase_realtime add table public.%I', table_name);
    end if;
  end loop;
end
$$;
