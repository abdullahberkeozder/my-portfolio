-- Sprint 1: customer self-service tracking, cancellation/change requests,
-- cancellation reasons, and customer feedback.

alter table public.appointment_requests
  add column if not exists public_token uuid not null default gen_random_uuid();

alter table public.appointment_requests
  add column if not exists customer_action text;

alter table public.appointment_requests
  add column if not exists customer_action_note text;

alter table public.appointment_requests
  add column if not exists customer_requested_date date;

alter table public.appointment_requests
  add column if not exists customer_requested_time time without time zone;

alter table public.appointment_requests
  add column if not exists cancellation_reason text;

alter table public.appointment_requests
  add column if not exists customer_feedback text;

alter table public.appointment_requests
  add column if not exists customer_action_at timestamp with time zone;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'appointment_requests_public_token_key'
  ) then
    alter table public.appointment_requests
      add constraint appointment_requests_public_token_key unique (public_token);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'appointment_requests_customer_action_check'
  ) then
    alter table public.appointment_requests
      add constraint appointment_requests_customer_action_check
      check (customer_action is null or customer_action in ('cancel_requested', 'change_requested'));
  end if;
end $$;

create index if not exists appointment_requests_public_token_idx
  on public.appointment_requests(public_token);

create index if not exists appointment_requests_customer_action_idx
  on public.appointment_requests(customer_action, customer_action_at desc);

drop function if exists public.create_appointment_request(
  text,
  text,
  text,
  date,
  time without time zone,
  text,
  text,
  text
);

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
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_slot_id uuid;
  v_request_id uuid;
  v_public_token uuid;
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
        and existing_request.archived_at is null
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
  returning id, public_token into v_request_id, v_public_token;

  return jsonb_build_object(
    'id', v_request_id,
    'public_token', v_public_token
  );
end;
$$;

create or replace function public.get_public_appointment_request(
  p_public_token uuid
)
returns table (
  id uuid,
  public_token uuid,
  customer_name text,
  service_type text,
  requested_date date,
  requested_time time without time zone,
  status text,
  customer_action text,
  customer_action_note text,
  customer_requested_date date,
  customer_requested_time time without time zone,
  cancellation_reason text,
  customer_feedback text,
  customer_action_at timestamp with time zone
)
language sql
security definer
set search_path = public
as $$
  select
    request.id,
    request.public_token,
    request.customer_name,
    request.service_type,
    request.requested_date,
    request.requested_time,
    request.status,
    request.customer_action,
    request.customer_action_note,
    request.customer_requested_date,
    request.customer_requested_time,
    request.cancellation_reason,
    request.customer_feedback,
    request.customer_action_at
  from public.appointment_requests as request
  where request.public_token = p_public_token
    and request.archived_at is null;
$$;

create or replace function public.submit_appointment_customer_action(
  p_public_token uuid,
  p_customer_action text,
  p_customer_action_note text default null,
  p_customer_requested_date date default null,
  p_customer_requested_time time without time zone default null,
  p_cancellation_reason text default null,
  p_customer_feedback text default null
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if p_customer_action not in ('cancel_requested', 'change_requested') then
    raise exception 'invalid_customer_action' using errcode = 'P0001';
  end if;

  if char_length(coalesce(p_customer_action_note, '')) > 1000
    or char_length(coalesce(p_cancellation_reason, '')) > 160
    or char_length(coalesce(p_customer_feedback, '')) > 1000
  then
    raise exception 'customer_action_text_too_long' using errcode = 'P0001';
  end if;

  if p_customer_action = 'change_requested' then
    if p_customer_requested_date is null
      or p_customer_requested_date < current_date
      or p_customer_requested_time is null
      or p_customer_requested_time < time '09:00'
      or p_customer_requested_time > time '19:00'
      or extract(minute from p_customer_requested_time) <> 0
      or extract(second from p_customer_requested_time) <> 0
      or mod(extract(hour from p_customer_requested_time)::integer - 9, 2) <> 0
    then
      raise exception 'invalid_requested_change_slot' using errcode = 'P0001';
    end if;
  end if;

  update public.appointment_requests
  set
    customer_action = p_customer_action,
    customer_action_note = nullif(trim(coalesce(p_customer_action_note, '')), ''),
    customer_requested_date = case
      when p_customer_action = 'change_requested' then p_customer_requested_date
      else null
    end,
    customer_requested_time = case
      when p_customer_action = 'change_requested' then p_customer_requested_time
      else null
    end,
    cancellation_reason = case
      when p_customer_action = 'cancel_requested' then nullif(trim(coalesce(p_cancellation_reason, '')), '')
      else nullif(trim(coalesce(p_cancellation_reason, '')), '')
    end,
    customer_feedback = nullif(trim(coalesce(p_customer_feedback, '')), ''),
    customer_action_at = now()
  where public_token = p_public_token
    and archived_at is null
    and status in ('new', 'contacted', 'confirmed');

  if not found then
    raise exception 'appointment_request_not_found' using errcode = 'P0001';
  end if;

  return true;
end;
$$;

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

revoke all on function public.get_public_appointment_request(uuid) from public;
grant execute on function public.get_public_appointment_request(uuid) to anon, authenticated;

revoke all on function public.submit_appointment_customer_action(
  uuid,
  text,
  text,
  date,
  time without time zone,
  text,
  text
) from public;
grant execute on function public.submit_appointment_customer_action(
  uuid,
  text,
  text,
  date,
  time without time zone,
  text,
  text
) to anon, authenticated;

notify pgrst, 'reload schema';
