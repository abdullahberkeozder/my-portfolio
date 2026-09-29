-- Deploy with workers stopped; old clients must fail closed, never bypass fencing.
drop function public.mark_notification_result(bigint, boolean, text);

create function public.mark_notification_result(
  p_id bigint,
  p_worker_id text,
  p_attempt integer,
  p_succeeded boolean,
  p_error text default null
)
returns public.notification_outbox
language plpgsql security definer set search_path = ''
as $$
declare
  row_value public.notification_outbox%rowtype;
begin
  -- The attempt is a fencing generation: both claim RPCs increment it atomically.
  -- No read-then-write window; takeover and acknowledgement serialize on this row.
  update public.notification_outbox set
    status = case when p_succeeded then 'sent' when attempts >= 8 then 'dead' else 'retrying' end,
    next_attempt_at = case when p_succeeded or attempts >= 8 then next_attempt_at
      else now() + least(3600, 30 * power(2, attempts - 1)) * interval '1 second' end,
    last_error = case when p_succeeded then null else left(p_error, 2000) end,
    sent_at = case when p_succeeded then now() else null end,
    worker_id = null,
    updated_at = now()
  where id = p_id and status = 'processing'
    and worker_id = p_worker_id and attempts = p_attempt
    and length(trim(p_worker_id)) between 1 and 120
    and p_attempt between 1 and 8 and p_succeeded is not null
  returning * into row_value;

  if not found then
    raise exception 'Notification lease is no longer owned' using errcode = 'P0001';
  end if;
  return row_value;
end;
$$;

revoke all on function public.mark_notification_result(bigint,text,integer,boolean,text) from public, anon, authenticated;
grant execute on function public.mark_notification_result(bigint,text,integer,boolean,text) to service_role;

comment on function public.mark_notification_result(bigint,text,integer,boolean,text) is
  'Result requires current worker and claimed attempt. Expiry permits takeover; only takeover or recovery invalidates ownership. Never reset attempts on an existing notification.';
