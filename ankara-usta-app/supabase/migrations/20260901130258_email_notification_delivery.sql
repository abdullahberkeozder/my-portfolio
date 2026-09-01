create or replace function private.enqueue_job_notifications()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.notification_outbox (event_id,recipient_id,channel,payload)
  select
    new.id,
    participant.recipient,
    delivery.channel,
    jsonb_build_object('job_id',new.job_id,'sequence',new.sequence,'event_type',new.event_type)
  from (
    select customer_id as recipient from public.jobs where id = new.job_id
    union all
    select tradesperson_id from public.jobs where id = new.job_id
  ) participant
  cross join (values ('in_app'::text),('email'::text)) delivery(channel)
  where participant.recipient is distinct from new.actor_id
  on conflict (event_id,recipient_id,channel) do nothing;
  return new;
end;
$$;

revoke execute on function private.enqueue_job_notifications() from public,anon,authenticated,service_role;

create index if not exists notification_outbox_email_ready_idx
on public.notification_outbox (next_attempt_at,id)
where channel='email' and status in ('pending','retrying');

create or replace function public.claim_email_notification_batch(p_worker_id text,p_limit integer default 25)
returns setof public.notification_outbox
language sql security definer set search_path = ''
as $$
  update public.notification_outbox
  set status='processing',attempts=attempts+1,worker_id=p_worker_id,updated_at=now()
  where id in (
    select id from public.notification_outbox
    where channel='email'
      and length(trim(p_worker_id)) between 1 and 120
      and ((status in ('pending','retrying') and next_attempt_at<=now())
        or (status='processing' and updated_at<now()-interval '5 minutes'))
      and attempts<8
    order by next_attempt_at,id
    limit least(greatest(p_limit,1),100)
    for update skip locked
  )
  returning *;
$$;

revoke execute on function public.claim_email_notification_batch(text,integer) from public,anon,authenticated;
grant execute on function public.claim_email_notification_batch(text,integer) to service_role;

comment on function public.claim_email_notification_batch(text,integer) is
  'Claims email-only outbox rows for the server-side ASP.NET Core delivery worker.';
