-- Sprint 6: lead quality classification and analytics operation deduplication.
-- Run after the base schema, analytics_events_migration.sql and Sprint 5 migration.

alter table public.appointment_requests
  add column if not exists lead_quality text;

alter table public.appointment_requests
  add column if not exists lead_quality_note text;

alter table public.appointment_requests
  add column if not exists lead_quality_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'appointment_requests_lead_quality_check'
  ) then
    alter table public.appointment_requests
      add constraint appointment_requests_lead_quality_check
      check (
        lead_quality is null or
        lead_quality in ('qualified', 'unqualified', 'outside_area', 'spam')
      );
  end if;
end $$;

create index if not exists appointment_requests_lead_quality_idx
  on public.appointment_requests(lead_quality, created_at desc);

-- The client includes operation_id only when retries must represent one operation.
create unique index if not exists analytics_events_operation_dedupe_idx
  on public.analytics_events(session_id, event_name, (properties->>'operation_id'))
  where properties ? 'operation_id';

create index if not exists analytics_events_utm_source_idx
  on public.analytics_events((properties->>'source'), created_at desc)
  where properties ? 'source';

notify pgrst, 'reload schema';
