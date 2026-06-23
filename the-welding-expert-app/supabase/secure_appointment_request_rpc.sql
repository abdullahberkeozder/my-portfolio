-- Run this migration once in Supabase SQL Editor for an existing project.
-- It validates public appointment requests inside PostgreSQL and removes
-- direct public INSERT access to appointment_requests. The legacy p_notes
-- argument now writes customer_note; admin_note is never public input.

alter table public.appointment_requests
  add column if not exists customer_note text;

alter table public.appointment_requests
  add column if not exists admin_note text;

update public.appointment_requests
set
  customer_note = case
    when customer_note is not null then customer_note
    when notes is not null
      and position(lower(trim(notes)) in lower(coalesce(message, ''))) > 0
      then notes
    else null
  end,
  admin_note = case
    when admin_note is not null then admin_note
    when notes is not null
      and position(lower(trim(notes)) in lower(coalesce(message, ''))) = 0
      then notes
    else null
  end
where notes is not null
  and (customer_note is null or admin_note is null);

create or replace function public.create_appointment_request(
  p_customer_name text,
  p_customer_phone text,
  p_service_type text,
  p_requested_date date,
  p_requested_time time without time zone,
  p_customer_email text default null,
  p_message text default null,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_slot_id uuid;
  v_request_id uuid;
begin
  if char_length(trim(coalesce(p_customer_name, ''))) not between 2 and 120
    or char_length(trim(coalesce(p_customer_phone, ''))) not between 6 and 30
    or char_length(trim(coalesce(p_service_type, ''))) not between 2 and 120
  then
    raise exception 'invalid_customer_details' using errcode = 'P0001';
  end if;

  if p_customer_email is not null
    and char_length(trim(p_customer_email)) > 254
  then
    raise exception 'invalid_customer_email' using errcode = 'P0001';
  end if;

  if char_length(coalesce(p_message, '')) > 2000
    or char_length(coalesce(p_notes, '')) > 1000
  then
    raise exception 'appointment_text_too_long' using errcode = 'P0001';
  end if;

  if p_requested_date is null or p_requested_date < current_date then
    raise exception 'appointment_date_unavailable' using errcode = 'P0001';
  end if;

  if p_requested_time is null
    or p_requested_time < time '09:00'
    or p_requested_time > time '19:00'
    or extract(minute from p_requested_time) <> 0
    or extract(second from p_requested_time) <> 0
    or mod(extract(hour from p_requested_time)::integer - 9, 2) <> 0
  then
    raise exception 'invalid_appointment_time' using errcode = 'P0001';
  end if;

  select slot.id
  into v_slot_id
  from public.appointment_availability_slots as slot
  join public.appointment_availability_days as day
    on day.id = slot.day_id
  where day.work_date = p_requested_date
    and day.is_visible = true
    and day.status <> 'closed'
    and slot.slot_time = p_requested_time
    and slot.is_available = true
    and not exists (
      select 1
      from public.appointment_requests as existing_request
      where existing_request.requested_date = p_requested_date
        and existing_request.requested_time = p_requested_time
        and existing_request.status = 'confirmed'
    )
  for update of slot;

  if v_slot_id is null then
    raise exception 'appointment_slot_unavailable' using errcode = 'P0001';
  end if;

  insert into public.appointment_requests (
    customer_name,
    customer_phone,
    customer_email,
    service_type,
    requested_date,
    requested_time,
    channel,
    status,
    message,
    customer_note,
    notes
  )
  values (
    trim(p_customer_name),
    trim(p_customer_phone),
    nullif(trim(coalesce(p_customer_email, '')), ''),
    trim(p_service_type),
    p_requested_date,
    p_requested_time,
    'system',
    'new',
    nullif(trim(coalesce(p_message, '')), ''),
    nullif(trim(coalesce(p_notes, '')), ''),
    nullif(trim(coalesce(p_notes, '')), '')
  )
  returning id into v_request_id;

  return v_request_id;
end;
$$;

drop policy if exists "Customers can create appointment requests"
on public.appointment_requests;

revoke insert on public.appointment_requests from anon, authenticated;

revoke all on function public.create_appointment_request(
  text,
  text,
  text,
  date,
  time without time zone,
  text,
  text,
  text
) from public;

grant execute on function public.create_appointment_request(
  text,
  text,
  text,
  date,
  time without time zone,
  text,
  text,
  text
) to anon, authenticated;

notify pgrst, 'reload schema';
