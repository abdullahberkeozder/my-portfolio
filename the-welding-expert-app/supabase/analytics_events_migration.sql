-- ============================================================================
-- Analytics Events Table
-- Supabase-native, privacy-first olay loglama.
-- Üçüncü taraf script gerektirmez.
-- ============================================================================

create table if not exists public.analytics_events (
  id          uuid        primary key default gen_random_uuid(),
  created_at  timestamptz not null    default now(),
  event_name  text        not null,
  session_id  text,
  properties  jsonb
);

create index if not exists analytics_events_event_name_idx
  on public.analytics_events (event_name);

create index if not exists analytics_events_created_at_idx
  on public.analytics_events (created_at desc);

-- Anonlar olay yazabilir (müşteri tarafı loglama)
alter table public.analytics_events enable row level security;

drop policy if exists "Anyone can insert analytics events"
  on public.analytics_events;

create policy "Anyone can insert analytics events"
  on public.analytics_events
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Admins can read analytics events"
  on public.analytics_events;

create policy "Admins can read analytics events"
  on public.analytics_events
  for select
  to authenticated
  using (public.is_admin(auth.uid()));

grant insert on public.analytics_events to anon, authenticated;
grant select on public.analytics_events to authenticated;
