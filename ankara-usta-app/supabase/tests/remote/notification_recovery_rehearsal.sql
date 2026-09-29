-- Run only via run-notification-rehearsal.mjs against the allowlisted E2E project.
-- No provider/worker is started. All fixture writes roll back, even on failure.
begin;
set local lock_timeout = '3s';
set local statement_timeout = '30s';
-- Keep the queue stable briefly; never rewrite unrelated ready rows.
lock table public.notification_outbox in share row exclusive mode;

do $$
declare
  fixture_id constant bigint := -9220922001;
  fixture_event uuid;
  fixture_recipient uuid;
  item public.notification_outbox%rowtype;
  claim_count integer;
  delay_seconds integer;
  recovery_command text;
  rejected boolean := false;
  before_others jsonb;
  after_others jsonb;
  owned_snapshot jsonb;
begin
  if exists(select 1 from public.notification_outbox where id=fixture_id or next_attempt_at='-infinity'::timestamptz) then
    raise exception 'Fixture ID or priority sentinel already in use';
  end if;
  if has_function_privilege('anon','public.claim_email_notification_batch(text,integer)','execute')
    or has_function_privilege('authenticated','public.mark_notification_result(bigint,text,integer,boolean,text)','execute')
    or has_function_privilege('anon','public.mark_notification_result(bigint,text,integer,boolean,text)','execute') then
    raise exception 'Worker RPC permissions are too broad';
  end if;
  if not has_function_privilege('service_role','public.claim_email_notification_batch(text,integer)','execute')
    or not has_function_privilege('service_role','public.mark_notification_result(bigint,text,integer,boolean,text)','execute') then
    raise exception 'Service role RPC access missing';
  end if;
  if to_regprocedure('public.mark_notification_result(bigint,boolean,text)') is not null then
    raise exception 'Unfenced legacy RPC still exists';
  end if;
  select jsonb_agg(to_jsonb(n) order by n.id) into before_others from public.notification_outbox n;
  select e.id,u.id into fixture_event,fixture_recipient
  from public.job_events e cross join auth.users u
  where u.email in ('u3-customer@orkestra.example','u3-second-customer@orkestra.example')
    and not exists(select 1 from public.notification_outbox n where n.event_id=e.id and n.recipient_id=u.id and n.channel='email')
  limit 1;
  if fixture_event is null then raise exception 'Existing E2E event/recipient pair required'; end if;

  insert into public.notification_outbox(id,event_id,recipient_id,channel,payload,next_attempt_at)
  overriding system value
  values(fixture_id,fixture_event,fixture_recipient,'email','{"rehearsal":"notification-recovery"}','-infinity');

  -- Real claim RPC, limit=1 and earliest sentinel ensure only our fixture is claimed.
  select count(*) into claim_count from public.claim_email_notification_batch('rehearsal-a',1) where id=fixture_id;
  if claim_count<>1 then raise exception 'Initial claim failed'; end if;
  select * into item from public.notification_outbox where id=fixture_id;
  if item.attempts<>1 or item.status<>'processing' or item.worker_id<>'rehearsal-a' then raise exception 'Initial lease invalid'; end if;

  -- Failure backoff at every retry, then dead-letter on the eighth failure.
  for attempt in 1..8 loop
    if attempt>1 then
      update public.notification_outbox set next_attempt_at='-infinity' where id=fixture_id;
      select count(*) into claim_count from public.claim_email_notification_batch('rehearsal-a',1) where id=fixture_id;
      if claim_count<>1 then raise exception 'Retry claim failed at %',attempt; end if;
    end if;
    select * into item from public.mark_notification_result(fixture_id,'rehearsal-a',attempt,false,'synthetic provider failure');
    if item.attempts<>attempt or item.worker_id is not null or item.sent_at is not null then raise exception 'Failure fields invalid'; end if;
    if attempt<8 then
      delay_seconds := least(3600,30*power(2,attempt-1))::integer;
      if item.status<>'retrying' or item.next_attempt_at<>now()+delay_seconds*interval '1 second' then raise exception 'Retry schedule invalid at %',attempt; end if;
    elsif item.status<>'dead' then raise exception 'Eighth failure did not dead-letter';
    end if;
  end loop;

  -- mark-result refuses a terminal row (no accidental acknowledgement).
  begin
    perform public.mark_notification_result(fixture_id,'rehearsal-a',8,true,null);
  exception when raise_exception then
    if sqlerrm='Notification lease is no longer owned' then rejected:=true; else raise; end if;
  end;
  if not rejected then raise exception 'Terminal notification accepted a result'; end if;

  -- Simulate process crash without a result; the next worker takes a >5m lease.
  update public.notification_outbox set status='processing',attempts=2,worker_id='crashed-worker',
    updated_at=now()-interval '6 minutes',next_attempt_at='-infinity' where id=fixture_id;
  select count(*) into claim_count from public.claim_email_notification_batch('rehearsal-b',1) where id=fixture_id;
  select * into item from public.notification_outbox where id=fixture_id;
  if claim_count<>1 or item.attempts<>3 or item.worker_id<>'rehearsal-b' or item.updated_at<>now() then raise exception 'Expired lease takeover failed'; end if;
  owned_snapshot := to_jsonb(item);
  -- Both late success and late failure must leave the new owner's row intact.
  for outcome in 0..1 loop
    rejected := false;
    begin
      perform public.mark_notification_result(fixture_id,'crashed-worker',2,outcome=1,'late result');
    exception when raise_exception then
      if sqlerrm='Notification lease is no longer owned' then rejected:=true; else raise; end if;
    end;
    if not rejected then raise exception 'Old worker overwrote reclaimed lease'; end if;
  end loop;
  -- Correct owner with an old generation must also fail (same worker reclaim).
  rejected := false;
  begin
    perform public.mark_notification_result(fixture_id,'rehearsal-b',2,true,null);
  exception when raise_exception then
    if sqlerrm='Notification lease is no longer owned' then rejected:=true; else raise; end if;
  end;
  if not rejected then raise exception 'Old generation accepted'; end if;
  rejected := false;
  begin
    perform public.mark_notification_result(fixture_id,'crashed-worker',3,false,'wrong owner');
  exception when raise_exception then
    if sqlerrm='Notification lease is no longer owned' then rejected:=true; else raise; end if;
  end;
  if not rejected then raise exception 'Wrong owner accepted'; end if;
  if (select to_jsonb(n) from public.notification_outbox n where id=fixture_id) is distinct from owned_snapshot then
    raise exception 'Rejected result mutated current lease';
  end if;
  select * into item from public.mark_notification_result(fixture_id,'rehearsal-b',3,true,null);
  if item.status<>'sent' or item.sent_at is null or item.last_error is not null or item.worker_id is not null then raise exception 'Recovered success invalid'; end if;

  -- Execute the deployed cron command with an extra fixture-ID predicate.
  -- This verifies recovery SQL, not the scheduler actually waking up.
  select command into strict recovery_command from cron.job
    where jobname='notification-outbox-recovery' and active and schedule='*/10 * * * *';
  if recovery_command not like '%interval ''15 minutes''%' or recovery_command !~ ';\s*$' then
    raise exception 'Unexpected cron contract; review before rehearsal';
  end if;
  recovery_command := regexp_replace(recovery_command,';\s*$',' and id = '||fixture_id||';');
  for attempt in 7..8 loop
    update public.notification_outbox set status='processing',attempts=attempt,worker_id='crashed-worker',
      updated_at=now()-interval '16 minutes',sent_at=null,last_error=null where id=fixture_id;
    execute recovery_command;
    select * into item from public.notification_outbox where id=fixture_id;
    if item.status<>(case when attempt=8 then 'dead' else 'retrying' end)
      or item.worker_id is not null or item.last_error<>'Worker lease expired' then raise exception 'Cron recovery failed at %',attempt; end if;
  end loop;
  select jsonb_agg(to_jsonb(n) order by n.id) into after_others
    from public.notification_outbox n where id<>fixture_id;
  if before_others is distinct from after_others then raise exception 'Unrelated queue rows changed'; end if;
end
$$;
rollback;
