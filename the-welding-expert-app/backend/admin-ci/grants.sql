-- Disposable CI only. Authenticated RLS policies remain the repository policies.
create role booking_reader login nosuperuser nocreatedb nocreaterole noinherit nobypassrls;
create role booking_writer login nosuperuser nocreatedb nocreaterole noinherit nobypassrls;
revoke create on schema public from public;
revoke execute on all functions in schema public from public;
grant usage on schema public to booking_reader, booking_writer;
grant select on public.service_configs, public.appointment_availability_days,
  public.appointment_availability_slots, public.appointment_requests,
  public.admin_profiles to booking_reader;
create policy ci_reader on public.service_configs for select to booking_reader using (true);
create policy ci_reader on public.appointment_availability_days for select to booking_reader using (true);
create policy ci_reader on public.appointment_availability_slots for select to booking_reader using (true);
create policy ci_reader on public.appointment_requests for select to booking_reader using (true);
create policy ci_reader on public.admin_profiles for select to booking_reader using (true);
grant select on public.admin_profiles, public.appointment_requests to booking_writer;
grant update(status, requested_date, requested_time, archived_at) on public.appointment_requests to booking_writer;
grant execute on function public.create_appointment_request(text,text,text,date,time,text,text,text) to booking_writer;
create policy ci_writer on public.admin_profiles for select to booking_writer using (true);
create policy ci_writer_read on public.appointment_requests for select to booking_writer using (true);
create policy ci_writer_update on public.appointment_requests for update to booking_writer using (true) with check (true);

-- Local API table exposure is explicit; these grants do not bypass RLS.
grant select on public.admin_profiles, public.appointment_requests to authenticated;
grant update(archived_at) on public.appointment_requests to authenticated;
grant execute on function public.has_admin_role(text[]), public.is_admin(uuid) to authenticated;

-- Keep mutation invalidation observable independently of Realtime delivery.
do $$ declare item record; begin
  for item in select schemaname, tablename from pg_publication_tables
    where pubname='supabase_realtime' and tablename in ('appointment_requests','appointment_attachments')
  loop
    execute format('alter publication supabase_realtime drop table %I.%I', item.schemaname, item.tablename);
  end loop;
end $$;
notify pgrst, 'reload schema';
