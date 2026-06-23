-- Run this migration once in Supabase SQL Editor for an existing project.
-- Confirming a request and closing its availability slot now happen in the
-- same PostgreSQL transaction. If the slot cannot be closed, confirmation
-- fails and the request remains unchanged.

create or replace function public.close_slot_on_appointment_confirmation()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_slot_id uuid;
begin
  if new.status = 'confirmed'
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

  return new;
end;
$$;

drop trigger if exists close_slot_on_appointment_confirmation
on public.appointment_requests;

create trigger close_slot_on_appointment_confirmation
before update of status on public.appointment_requests
for each row execute function public.close_slot_on_appointment_confirmation();

revoke all on function public.close_slot_on_appointment_confirmation()
from public;

notify pgrst, 'reload schema';
