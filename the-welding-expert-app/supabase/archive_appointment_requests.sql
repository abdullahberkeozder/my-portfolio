-- Run this migration once in the Supabase SQL Editor for an existing project.
-- It adds an 'archived_at' column for soft deletes (archiving) and updates the slot sync trigger.

-- 1. Add archived_at column to appointment_requests table if it doesn't exist
alter table public.appointment_requests
  add column if not exists archived_at timestamp with time zone default null;

-- 2. Drop existing slot sync trigger
drop trigger if exists sync_appointment_status_with_slot on public.appointment_requests;

-- 3. Create or replace the updated trigger function
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
     and new.archived_at is null
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
          and existing_request.archived_at is null
      )
    for update of slot;

    if v_slot_id is null then
      raise exception 'appointment_slot_unavailable' using errcode = 'P0001';
    end if;

    update public.appointment_availability_slots
    set is_available = false
    where id = v_slot_id;
  end if;

  -- 2. Randevu onaylı durumdan başka duruma (iptal, yeni vb.) geçtiğinde (UPDATE) VEYA onaylı randevu arşivlendiğinde (UPDATE): Slotu geri aç
  if TG_OP = 'UPDATE'
     and old.status = 'confirmed'
     and (
       (new.status in ('cancelled', 'new', 'contacted') and old.archived_at is null)
       or (old.archived_at is null and new.archived_at is not null)
     )
  then
    update public.appointment_availability_slots as slot
    set is_available = true
    from public.appointment_availability_days as day
    where day.id = slot.day_id
      and day.work_date = old.requested_date
      and slot.slot_time = old.requested_time;
  end if;

  -- 3. Onaylı ve arşivlenmemiş randevu silindiğinde (DELETE): Slotu geri aç
  if TG_OP = 'DELETE'
     and old.status = 'confirmed'
     and old.archived_at is null
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

-- 4. Re-create the trigger to watch for updates on status, archived_at, and delete
create trigger sync_appointment_status_with_slot
before update of status, archived_at or delete on public.appointment_requests
for each row execute function public.handle_appointment_status_slot_sync();
