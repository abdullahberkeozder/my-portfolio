-- Sprint 5: append-only customer action history, public data minimization,
-- and provider-independent notification outbox.
-- Run after welding_appointments_schema.sql/customer_self_service_requests.sql.

create table if not exists public.appointment_customer_actions (
  id uuid primary key default gen_random_uuid(),
  appointment_request_id uuid not null references public.appointment_requests(id) on delete cascade,
  action_type text not null,
  action_note text,
  requested_date date,
  requested_time time without time zone,
  cancellation_reason text,
  customer_feedback text,
  created_at timestamptz not null default now(),
  constraint appointment_customer_actions_type_check
    check (action_type in ('cancel_requested', 'change_requested'))
);

create index if not exists appointment_customer_actions_request_idx
  on public.appointment_customer_actions(appointment_request_id, created_at desc);

create index if not exists appointment_customer_actions_reason_idx
  on public.appointment_customer_actions(cancellation_reason, created_at desc)
  where action_type = 'cancel_requested';

alter table public.appointment_customer_actions enable row level security;

-- Preserve the latest projected action as the first history entry during migration.
insert into public.appointment_customer_actions (
  appointment_request_id,
  action_type,
  action_note,
  requested_date,
  requested_time,
  cancellation_reason,
  customer_feedback,
  created_at
)
select
  request.id,
  request.customer_action,
  request.customer_action_note,
  request.customer_requested_date,
  request.customer_requested_time,
  request.cancellation_reason,
  request.customer_feedback,
  coalesce(request.customer_action_at, request.updated_at, request.created_at)
from public.appointment_requests as request
where request.customer_action is not null
  and not exists (
    select 1
    from public.appointment_customer_actions as action
    where action.appointment_request_id = request.id
      and action.action_type = request.customer_action
      and action.created_at = coalesce(request.customer_action_at, request.updated_at, request.created_at)
  );

create table if not exists public.notification_outbox (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  aggregate_type text not null,
  aggregate_id uuid not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  attempts integer not null default 0,
  available_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  processed_at timestamptz,
  constraint notification_outbox_status_check
    check (status in ('pending', 'processing', 'sent', 'failed'))
);

create index if not exists notification_outbox_pending_idx
  on public.notification_outbox(status, available_at, created_at)
  where status in ('pending', 'failed');

alter table public.notification_outbox enable row level security;

-- Recreate because PostgreSQL cannot change an existing table return shape in place.
drop function if exists public.get_public_appointment_request(uuid);

create function public.get_public_appointment_request(
  p_public_token uuid
)
returns table (
  service_type text,
  requested_date date,
  requested_time time without time zone,
  status text,
  created_at timestamptz,
  updated_at timestamptz,
  customer_action text,
  customer_action_note text,
  customer_requested_date date,
  customer_requested_time time without time zone,
  cancellation_reason text,
  customer_feedback text,
  customer_action_at timestamptz,
  customer_action_count bigint,
  previous_same_action_at timestamptz
)
language sql
security definer
set search_path = public, pg_temp
as $$
  select
    request.service_type,
    request.requested_date,
    request.requested_time,
    request.status,
    request.created_at,
    request.updated_at,
    request.customer_action,
    request.customer_action_note,
    request.customer_requested_date,
    request.customer_requested_time,
    request.cancellation_reason,
    request.customer_feedback,
    request.customer_action_at,
    coalesce(action_summary.action_count, 0),
    action_summary.previous_same_action_at
  from public.appointment_requests as request
  left join lateral (
    select
      count(*) filter (where action.action_type = request.customer_action) as action_count,
      max(action.created_at) filter (
        where action.action_type = request.customer_action
          and action.created_at < request.customer_action_at
      ) as previous_same_action_at
    from public.appointment_customer_actions as action
    where action.appointment_request_id = request.id
  ) as action_summary on true
  where request.public_token = p_public_token
    and request.archived_at is null;
$$;

drop function if exists public.submit_appointment_customer_action(
  uuid,
  text,
  text,
  date,
  time without time zone,
  text,
  text
);

create function public.submit_appointment_customer_action(
  p_public_token uuid,
  p_customer_action text,
  p_customer_action_note text default null,
  p_customer_requested_date date default null,
  p_customer_requested_time time without time zone default null,
  p_cancellation_reason text default null,
  p_customer_feedback text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_request public.appointment_requests%rowtype;
  v_action_id uuid;
  v_submitted_at timestamptz;
  v_previous_count integer;
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

  if p_customer_action = 'cancel_requested'
    and char_length(trim(coalesce(p_cancellation_reason, ''))) < 2
  then
    raise exception 'cancellation_reason_required' using errcode = 'P0001';
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

  select request.*
  into v_request
  from public.appointment_requests as request
  where request.public_token = p_public_token
    and request.archived_at is null
    and request.status in ('new', 'contacted', 'confirmed')
  for update;

  if not found then
    raise exception 'appointment_request_not_found' using errcode = 'P0001';
  end if;

  select count(*)
  into v_previous_count
  from public.appointment_customer_actions as action
  where action.appointment_request_id = v_request.id
    and action.action_type = p_customer_action;

  insert into public.appointment_customer_actions (
    appointment_request_id,
    action_type,
    action_note,
    requested_date,
    requested_time,
    cancellation_reason,
    customer_feedback
  ) values (
    v_request.id,
    p_customer_action,
    nullif(trim(coalesce(p_customer_action_note, '')), ''),
    case when p_customer_action = 'change_requested' then p_customer_requested_date end,
    case when p_customer_action = 'change_requested' then p_customer_requested_time end,
    case when p_customer_action = 'cancel_requested' then nullif(trim(coalesce(p_cancellation_reason, '')), '') end,
    nullif(trim(coalesce(p_customer_feedback, '')), '')
  )
  returning id, created_at into v_action_id, v_submitted_at;

  update public.appointment_requests
  set
    customer_action = p_customer_action,
    customer_action_note = nullif(trim(coalesce(p_customer_action_note, '')), ''),
    customer_requested_date = case when p_customer_action = 'change_requested' then p_customer_requested_date end,
    customer_requested_time = case when p_customer_action = 'change_requested' then p_customer_requested_time end,
    cancellation_reason = case when p_customer_action = 'cancel_requested' then nullif(trim(coalesce(p_cancellation_reason, '')), '') end,
    customer_feedback = nullif(trim(coalesce(p_customer_feedback, '')), ''),
    customer_action_at = v_submitted_at
  where id = v_request.id;

  insert into public.notification_outbox (
    event_type,
    aggregate_type,
    aggregate_id,
    payload
  ) values (
    'appointment.customer_action_submitted',
    'appointment_request',
    v_request.id,
    jsonb_build_object(
      'action_id', v_action_id,
      'action_type', p_customer_action,
      'submitted_at', v_submitted_at
    )
  );

  return jsonb_build_object(
    'submitted', true,
    'action', p_customer_action,
    'submitted_at', v_submitted_at,
    'action_count', v_previous_count + 1,
    'is_repeat', v_previous_count > 0
  );
end;
$$;

revoke all on table public.appointment_customer_actions from anon, authenticated;
revoke all on table public.notification_outbox from anon, authenticated;
revoke all on function public.get_public_appointment_request(uuid) from public;
grant execute on function public.get_public_appointment_request(uuid) to anon, authenticated;
revoke all on function public.submit_appointment_customer_action(
  uuid, text, text, date, time without time zone, text, text
) from public;
grant execute on function public.submit_appointment_customer_action(
  uuid, text, text, date, time without time zone, text, text
) to anon, authenticated;

notify pgrst, 'reload schema';
