-- Run this migration once in the Supabase SQL Editor for an existing project.
-- It ensures that if a confirmed appointment is cancelled, updated to another status,
-- or deleted, the associated availability slot is automatically reopened (set back to is_available = true).

-- 1. Drop existing legacy trigger on appointment_requests
drop trigger if exists close_slot_on_appointment_confirmation on public.appointment_requests;
drop trigger if exists sync_appointment_status_with_slot on public.appointment_requests;

-- 2. Create the unified trigger function for status and slot synchronization
create or replace function public.handle_appointment_status_slot_sync()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_slot_id uuid;
begin
  -- 1. Randevu onaylandığında (UPDATE): Slotu kapat
  if TG_OP = 'UPDATE' 
     and new.status = 'confirmed' 
     and old.status is distinct from 'confirmed'
  then
    select slot.id
    into v_slot_id
    from public.appointment_availability_slots as slot
    join public.appointment_availability_days as day
      on day.id = slot.day_id
    where day.work_date = new.requested_date
      and day.is_visible = true
      and day.status <> 'closed'
      and slot.slot_time = new.requested_time
      and slot.is_available = true
      and not exists (
        select 1
        from public.appointment_requests as existing_request
        where existing_request.id <> new.id
          and existing_request.requested_date = new.requested_date
          and existing_request.requested_time = new.requested_time
          and existing_request.status = 'confirmed'
      )
    for update of slot;

    if v_slot_id is null then
      raise exception 'appointment_slot_unavailable' using errcode = 'P0001';
    end if;

    update public.appointment_availability_slots
    set is_available = false
    where id = v_slot_id;
  end if;

  -- 2. Randevu onaylı durumdan başka duruma (iptal, yeni vb.) geçtiğinde (UPDATE): Slotu geri aç
  if TG_OP = 'UPDATE'
     and old.status = 'confirmed'
     and new.status in ('cancelled', 'new', 'contacted')
  then
    update public.appointment_availability_slots as slot
    set is_available = true
    from public.appointment_availability_days as day
    where day.id = slot.day_id
      and day.work_date = old.requested_date
      and slot.slot_time = old.requested_time;
  end if;

  -- 3. Onaylı randevu silindiğinde (DELETE): Slotu geri aç
  if TG_OP = 'DELETE'
     and old.status = 'confirmed'
  then
    update public.appointment_availability_slots as slot
    set is_available = true
    from public.appointment_availability_days as day
    where day.id = slot.day_id
      and day.work_date = old.requested_date
      and slot.slot_time = old.requested_time;
  end if;

  if TG_OP = 'DELETE' then
    return old;
  else
    return new;
  end if;
end;
$$;

-- 3. Register the trigger for status update and deletion on appointment_requests
create trigger sync_appointment_status_with_slot
before update of status or delete on public.appointment_requests
for each row execute function public.handle_appointment_status_slot_sync();

-- 4. Revoke public execute rights and grant explicitly
revoke all on function public.handle_appointment_status_slot_sync() from public;
grant execute on function public.handle_appointment_status_slot_sync() to authenticated;

-- 5. Force PostgREST to reload schema
notify pgrst, 'reload schema';
