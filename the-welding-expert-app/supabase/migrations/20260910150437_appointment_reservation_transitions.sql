-- Apply after welding_appointments_schema.sql. No customer data repair is attempted.
create or replace function public.handle_appointment_status_slot_sync()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_old_active boolean := false;
  v_new_active boolean := false;
  v_moved boolean := false;
  v_reserve boolean := false;
  v_release boolean := false;
  v_slot_id uuid;
begin
  if TG_OP = 'INSERT' then
    if new.status = 'confirmed' then
      raise exception 'appointment_confirmation_requires_update' using errcode = 'P0001';
    end if;
    return new;
  end if;

  v_old_active := old.status = 'confirmed' and old.archived_at is null;
  if TG_OP = 'UPDATE' then
    v_new_active := new.status = 'confirmed' and new.archived_at is null;
    v_moved := (old.requested_date, old.requested_time)
      is distinct from (new.requested_date, new.requested_time);
    -- Do not combine a move with a terminal/status transition.
    if v_old_active and v_moved and not v_new_active then
      raise exception 'appointment_move_requires_active_confirmation' using errcode = 'P0001';
    end if;
    v_reserve := v_new_active and (not v_old_active or v_moved);
    v_release := v_old_active and (
      v_moved or new.archived_at is not null
      or new.status in ('cancelled', 'new', 'contacted'));
  else
    v_release := v_old_active;
  end if;

  -- Lock both slots in a stable order before checking or modifying either.
  -- Keep the existing slot-row serialization shared with request creation.
  if v_reserve or v_release then
    perform slot.id
    from public.appointment_availability_slots slot
    join public.appointment_availability_days day on day.id = slot.day_id
    where (v_release and day.work_date = old.requested_date and slot.slot_time = old.requested_time)
       or (v_reserve and day.work_date = new.requested_date and slot.slot_time = new.requested_time)
    order by day.work_date, slot.slot_time, slot.id
    for update of slot;
  end if;

  if v_reserve then
    select slot.id into v_slot_id
    from public.appointment_availability_slots slot
    join public.appointment_availability_days day on day.id = slot.day_id
    where day.work_date = new.requested_date and slot.slot_time = new.requested_time
      and day.is_visible and day.status <> 'closed' and slot.is_available
      and not exists (
        select 1 from public.appointment_requests r
        where r.id <> new.id and r.requested_date = new.requested_date
          and r.requested_time = new.requested_time
          and r.status = 'confirmed' and r.archived_at is null)
    for update of slot;
    if v_slot_id is null then
      raise exception 'appointment_slot_unavailable' using errcode = 'P0001';
    end if;
    update public.appointment_availability_slots set is_available = false where id = v_slot_id;
  end if;

  if v_release then
    update public.appointment_availability_slots slot set is_available = true
    from public.appointment_availability_days day
    where day.id = slot.day_id and day.work_date = old.requested_date
      and slot.slot_time = old.requested_time
      and not exists (
        select 1 from public.appointment_requests r
        where r.id <> old.id and r.requested_date = old.requested_date
          and r.requested_time = old.requested_time
          and r.status = 'confirmed' and r.archived_at is null);
  end if;
  if TG_OP = 'DELETE' then return old; end if;
  return new;
end;
$$;

drop trigger if exists sync_appointment_status_with_slot on public.appointment_requests;
create trigger sync_appointment_status_with_slot
before insert or update of status, archived_at, requested_date, requested_time or delete
on public.appointment_requests
for each row execute function public.handle_appointment_status_slot_sync();
