create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.service_requests(id) on delete restrict,
  accepted_quote_id uuid not null unique references public.quotes(id) on delete restrict,
  customer_id uuid not null references auth.users(id) on delete restrict,
  tradesperson_id uuid not null references public.tradesperson_profiles(user_id) on delete restrict,
  status text not null default 'scheduled' check (status in ('scheduled','inspection_scheduled','in_progress','awaiting_customer_approval','completed','disputed','cancelled')),
  scheduled_for timestamptz,
  warranty_ends_at timestamptz,
  next_event_sequence bigint not null default 0 check (next_event_sequence >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (customer_id <> tradesperson_id)
);

create index jobs_customer_updated_idx on public.jobs (customer_id, updated_at desc);
create index jobs_tradesperson_updated_idx on public.jobs (tradesperson_id, updated_at desc);
create index jobs_active_status_idx on public.jobs (status, updated_at desc)
where status not in ('completed','cancelled');

create table public.job_events (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  sequence bigint not null check (sequence > 0),
  event_type text not null check (event_type ~ '^[a-z0-9_]+$'),
  actor_id uuid references auth.users(id),
  actor_role text not null check (actor_role in ('customer','tradesperson','admin','system')),
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  created_at timestamptz not null default now(),
  unique (job_id, sequence),
  check ((actor_role = 'system' and actor_id is null) or (actor_role <> 'system' and actor_id is not null))
);
create index job_events_timeline_idx on public.job_events (job_id, sequence);

create table public.job_messages (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  event_id uuid not null unique references public.job_events(id) on delete restrict,
  sender_id uuid not null references auth.users(id) on delete restrict,
  body text not null check (length(trim(body)) between 1 and 4000),
  idempotency_key uuid not null,
  created_at timestamptz not null default now(),
  unique (job_id, sender_id, idempotency_key)
);
create index job_messages_room_idx on public.job_messages (job_id, created_at, id);
create index job_messages_sender_idx on public.job_messages (sender_id, created_at desc);

create table public.inspection_appointments (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  proposed_by uuid not null references auth.users(id) on delete restrict,
  scheduled_for timestamptz not null check (scheduled_for > created_at),
  note text check (note is null or length(note) <= 1000),
  status text not null default 'proposed' check (status in ('proposed','confirmed','cancelled','completed')),
  confirmed_by uuid references auth.users(id),
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status in ('confirmed','completed')) = (confirmed_by is not null and confirmed_at is not null))
);
create unique index inspection_one_active_per_job_idx on public.inspection_appointments (job_id)
where status in ('proposed','confirmed');
create index inspection_job_created_idx on public.inspection_appointments (job_id, created_at desc);

create table public.scope_changes (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  proposed_by uuid not null references auth.users(id) on delete restrict,
  description text not null check (length(trim(description)) between 10 and 2000),
  labor_delta_kurus bigint not null default 0,
  material_delta_kurus bigint not null default 0,
  duration_delta_minutes integer not null default 0,
  included_scope text[] not null default '{}'::text[] check (cardinality(included_scope) <= 20),
  excluded_scope text[] not null default '{}'::text[] check (cardinality(excluded_scope) <= 20),
  customer_approved_at timestamptz,
  tradesperson_approved_at timestamptz,
  status text not null default 'pending' check (status in ('pending','approved','rejected','cancelled')),
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (labor_delta_kurus <> 0 or material_delta_kurus <> 0 or duration_delta_minutes <> 0 or cardinality(included_scope) > 0 or cardinality(excluded_scope) > 0),
  check ((status = 'approved') = (customer_approved_at is not null and tradesperson_approved_at is not null))
);
create unique index scope_changes_one_pending_per_job_idx on public.scope_changes (job_id)
where status = 'pending';
create index scope_changes_job_created_idx on public.scope_changes (job_id, created_at desc);

create table public.job_addresses (
  job_id uuid primary key references public.jobs(id) on delete cascade,
  customer_id uuid not null references auth.users(id) on delete restrict,
  address_line text not null check (length(trim(address_line)) between 10 and 300),
  building text,
  apartment text,
  directions text check (directions is null or length(directions) <= 500),
  shared_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index job_addresses_customer_idx on public.job_addresses (customer_id);

create table public.notification_outbox (
  id bigint generated always as identity primary key,
  event_id uuid not null references public.job_events(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  channel text not null default 'in_app' check (channel in ('in_app','email','sms','push')),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  status text not null default 'pending' check (status in ('pending','processing','retrying','sent','dead')),
  attempts integer not null default 0 check (attempts between 0 and 8),
  next_attempt_at timestamptz not null default now(),
  worker_id text,
  last_error text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, recipient_id, channel)
);
create index notification_outbox_ready_idx on public.notification_outbox (next_attempt_at, id)
where status in ('pending','retrying');
create index notification_outbox_stuck_idx on public.notification_outbox (updated_at, id)
where status = 'processing';
create index notification_outbox_recipient_idx on public.notification_outbox (recipient_id, created_at desc);

create or replace function private.append_job_event(
  p_job_id uuid,
  p_event_type text,
  p_actor_id uuid,
  p_actor_role text,
  p_payload jsonb default '{}'::jsonb
)
returns public.job_events
language plpgsql
security definer
set search_path = ''
as $$
declare
  next_sequence bigint;
  created_event public.job_events%rowtype;
begin
  perform set_config('app.job_internal_mutation','on',true);
  update public.jobs
  set next_event_sequence = next_event_sequence + 1,
      updated_at = now()
  where id = p_job_id
  returning next_event_sequence into next_sequence;
  if not found then raise exception 'Job not found'; end if;

  insert into public.job_events (job_id,sequence,event_type,actor_id,actor_role,payload)
  values (p_job_id,next_sequence,p_event_type,p_actor_id,p_actor_role,coalesce(p_payload,'{}'::jsonb))
  returning * into created_event;
  return created_event;
end;
$$;
revoke execute on function private.append_job_event(uuid,text,uuid,text,jsonb)
from public,anon,authenticated,service_role;

create or replace function private.guard_job_mutation()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if current_setting('app.job_internal_mutation',true) <> 'on' then
    raise exception 'Jobs may only be changed through lifecycle operations';
  end if;
  if new.id <> old.id or new.request_id <> old.request_id or new.accepted_quote_id <> old.accepted_quote_id
     or new.customer_id <> old.customer_id or new.tradesperson_id <> old.tradesperson_id then
    raise exception 'Job identity fields are immutable';
  end if;
  return new;
end;
$$;
revoke execute on function private.guard_job_mutation() from public,anon,authenticated,service_role;
create trigger jobs_guard_mutation before update or delete on public.jobs
for each row execute function private.guard_job_mutation();

create or replace function private.enqueue_job_notifications()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.notification_outbox (event_id,recipient_id,payload)
  select new.id,recipient,jsonb_build_object('job_id',new.job_id,'sequence',new.sequence,'event_type',new.event_type)
  from (
    select customer_id as recipient from public.jobs where id = new.job_id
    union all
    select tradesperson_id from public.jobs where id = new.job_id
  ) participants
  where recipient is distinct from new.actor_id
  on conflict (event_id,recipient_id,channel) do nothing;
  return new;
end;
$$;
revoke execute on function private.enqueue_job_notifications() from public,anon,authenticated,service_role;
create trigger job_events_enqueue_notifications after insert on public.job_events
for each row execute function private.enqueue_job_notifications();

create or replace function private.job_actor_role(p_job public.jobs,p_actor uuid)
returns text language sql stable security definer set search_path = ''
as $$
  select case
    when p_job.id is null then null
    when private.is_admin() then 'admin'
    when p_actor = p_job.customer_id then 'customer'
    when p_actor = p_job.tradesperson_id then 'tradesperson'
  end;
$$;
revoke execute on function private.job_actor_role(public.jobs,uuid) from public,anon,authenticated,service_role;

create or replace function public.transition_job(p_job_id uuid,p_status text)
returns public.jobs
language plpgsql security definer set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
  actor_role text;
  job_row public.jobs%rowtype;
  allowed boolean := false;
begin
  if actor is null then raise exception 'Authentication required'; end if;
  select * into job_row from public.jobs where id = p_job_id for update;
  actor_role := private.job_actor_role(job_row,actor);
  if actor_role is null then raise exception 'Job not found'; end if;

  allowed := case (job_row.status || '->' || p_status)
    when 'scheduled->inspection_scheduled' then actor_role = 'admin'
    when 'scheduled->in_progress' then actor_role in ('tradesperson','admin')
    when 'scheduled->cancelled' then actor_role in ('customer','tradesperson','admin')
    when 'inspection_scheduled->scheduled' then actor_role in ('customer','tradesperson','admin')
    when 'inspection_scheduled->in_progress' then actor_role in ('tradesperson','admin')
    when 'inspection_scheduled->cancelled' then actor_role in ('customer','tradesperson','admin')
    when 'in_progress->awaiting_customer_approval' then actor_role in ('tradesperson','admin')
    when 'in_progress->disputed' then actor_role in ('customer','tradesperson','admin')
    when 'in_progress->cancelled' then actor_role = 'admin'
    when 'awaiting_customer_approval->in_progress' then actor_role in ('customer','admin')
    when 'awaiting_customer_approval->completed' then actor_role in ('customer','admin')
    when 'awaiting_customer_approval->disputed' then actor_role in ('customer','tradesperson','admin')
    when 'completed->disputed' then actor_role in ('customer','tradesperson','admin')
    when 'disputed->in_progress' then actor_role = 'admin'
    when 'disputed->awaiting_customer_approval' then actor_role = 'admin'
    when 'disputed->completed' then actor_role = 'admin'
    when 'disputed->cancelled' then actor_role = 'admin'
    else false
  end;
  if not allowed then raise exception 'Invalid or unauthorized job transition: % -> %',job_row.status,p_status; end if;

  perform set_config('app.job_internal_mutation','on',true);
  update public.jobs set status = p_status,updated_at = now(),
    warranty_ends_at = case when p_status = 'completed' then now() + (select warranty_days from public.quotes where id = job_row.accepted_quote_id) * interval '1 day' else warranty_ends_at end
  where id = p_job_id returning * into job_row;
  perform private.append_job_event(p_job_id,'status_changed',actor,actor_role,jsonb_build_object('status',p_status));
  select * into job_row from public.jobs where id = p_job_id;
  return job_row;
end;
$$;
revoke execute on function public.transition_job(uuid,text) from public,anon;
grant execute on function public.transition_job(uuid,text) to authenticated;

create or replace function public.send_job_message(p_job_id uuid,p_body text,p_idempotency_key uuid)
returns public.job_messages
language plpgsql security definer set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
  actor_role text;
  job_row public.jobs%rowtype;
  event_row public.job_events%rowtype;
  message_row public.job_messages%rowtype;
begin
  if actor is null then raise exception 'Authentication required'; end if;
  if length(trim(p_body)) not between 1 and 4000 then raise exception 'Message is invalid'; end if;
  select * into job_row from public.jobs where id = p_job_id for update;
  actor_role := private.job_actor_role(job_row,actor);
  if actor_role is null then raise exception 'Job not found'; end if;
  select * into message_row from public.job_messages where job_id=p_job_id and sender_id=actor and idempotency_key=p_idempotency_key;
  if found then return message_row; end if;
  event_row := private.append_job_event(p_job_id,'message_sent',actor,actor_role,jsonb_build_object('preview',left(trim(p_body),80)));
  insert into public.job_messages(job_id,event_id,sender_id,body,idempotency_key)
  values(p_job_id,event_row.id,actor,trim(p_body),p_idempotency_key) returning * into message_row;
  return message_row;
end;
$$;
revoke execute on function public.send_job_message(uuid,text,uuid) from public,anon;
grant execute on function public.send_job_message(uuid,text,uuid) to authenticated;

create or replace function public.propose_inspection(p_job_id uuid,p_scheduled_for timestamptz,p_note text default null)
returns public.inspection_appointments
language plpgsql security definer set search_path = ''
as $$
declare actor uuid := (select auth.uid());actor_role text;job_row public.jobs%rowtype;appointment public.inspection_appointments%rowtype;
begin
  if actor is null or p_scheduled_for <= now() then raise exception 'Invalid appointment'; end if;
  select * into job_row from public.jobs where id=p_job_id for update;
  actor_role:=private.job_actor_role(job_row,actor);
  if actor_role is null or actor_role not in ('customer','tradesperson','admin') or job_row.status <> 'scheduled' then raise exception 'Inspection cannot be proposed'; end if;
  insert into public.inspection_appointments(job_id,proposed_by,scheduled_for,note)
  values(p_job_id,actor,p_scheduled_for,nullif(trim(p_note),'')) returning * into appointment;
  perform private.append_job_event(p_job_id,'inspection_proposed',actor,actor_role,jsonb_build_object('appointment_id',appointment.id,'scheduled_for',appointment.scheduled_for));
  return appointment;
end;
$$;
revoke execute on function public.propose_inspection(uuid,timestamptz,text) from public,anon;
grant execute on function public.propose_inspection(uuid,timestamptz,text) to authenticated;

create or replace function public.respond_inspection(p_appointment_id uuid,p_accept boolean)
returns public.inspection_appointments
language plpgsql security definer set search_path = ''
as $$
declare actor uuid := (select auth.uid());actor_role text;job_row public.jobs%rowtype;appointment public.inspection_appointments%rowtype;
begin
  select * into appointment from public.inspection_appointments where id=p_appointment_id for update;
  select * into job_row from public.jobs where id=appointment.job_id for update;
  actor_role:=private.job_actor_role(job_row,actor);
  if actor_role is null or (actor=appointment.proposed_by and actor_role<>'admin') or appointment.status<>'proposed' or job_row.status<>'scheduled' then raise exception 'Appointment response is not allowed'; end if;
  update public.inspection_appointments set status=case when p_accept then 'confirmed' else 'cancelled' end,
    confirmed_by=case when p_accept then actor end,confirmed_at=case when p_accept then now() end,updated_at=now()
  where id=p_appointment_id returning * into appointment;
  if p_accept then
    perform set_config('app.job_internal_mutation','on',true);
    update public.jobs set status='inspection_scheduled',scheduled_for=appointment.scheduled_for,updated_at=now() where id=job_row.id;
  end if;
  perform private.append_job_event(job_row.id,case when p_accept then 'inspection_confirmed' else 'inspection_cancelled' end,actor,actor_role,jsonb_build_object('appointment_id',appointment.id,'scheduled_for',appointment.scheduled_for));
  return appointment;
end;
$$;
revoke execute on function public.respond_inspection(uuid,boolean) from public,anon;
grant execute on function public.respond_inspection(uuid,boolean) to authenticated;

create or replace function public.propose_scope_change(
  p_job_id uuid,p_description text,p_labor_delta_kurus bigint,p_material_delta_kurus bigint,
  p_duration_delta_minutes integer,p_included_scope text[],p_excluded_scope text[]
)
returns public.scope_changes
language plpgsql security definer set search_path = ''
as $$
declare actor uuid := (select auth.uid());actor_role text;job_row public.jobs%rowtype;change_row public.scope_changes%rowtype;
begin
  select * into job_row from public.jobs where id=p_job_id for update;
  actor_role:=private.job_actor_role(job_row,actor);
  if actor_role is null or actor_role not in ('customer','tradesperson','admin') or job_row.status in ('completed','cancelled') then raise exception 'Scope change is not allowed'; end if;
  insert into public.scope_changes(job_id,proposed_by,description,labor_delta_kurus,material_delta_kurus,duration_delta_minutes,included_scope,excluded_scope,customer_approved_at,tradesperson_approved_at)
  values(p_job_id,actor,trim(p_description),p_labor_delta_kurus,p_material_delta_kurus,p_duration_delta_minutes,coalesce(p_included_scope,'{}'),coalesce(p_excluded_scope,'{}'),case when actor=job_row.customer_id then now() end,case when actor=job_row.tradesperson_id then now() end)
  returning * into change_row;
  perform private.append_job_event(p_job_id,'scope_change_proposed',actor,actor_role,jsonb_build_object('scope_change_id',change_row.id));
  return change_row;
end;
$$;
revoke execute on function public.propose_scope_change(uuid,text,bigint,bigint,integer,text[],text[]) from public,anon;
grant execute on function public.propose_scope_change(uuid,text,bigint,bigint,integer,text[],text[]) to authenticated;

create or replace function public.respond_scope_change(p_scope_change_id uuid,p_approve boolean)
returns public.scope_changes
language plpgsql security definer set search_path = ''
as $$
declare actor uuid := (select auth.uid());actor_role text;job_row public.jobs%rowtype;change_row public.scope_changes%rowtype;
begin
  select * into change_row from public.scope_changes where id=p_scope_change_id for update;
  select * into job_row from public.jobs where id=change_row.job_id for update;
  actor_role:=private.job_actor_role(job_row,actor);
  if actor_role is null or change_row.status<>'pending' or job_row.status in ('completed','cancelled') or (actor=change_row.proposed_by and actor_role<>'admin') then raise exception 'Scope response is not allowed'; end if;
  if not p_approve then
    update public.scope_changes set status='rejected',decided_at=now(),updated_at=now() where id=p_scope_change_id returning * into change_row;
  else
    update public.scope_changes set
      customer_approved_at=case when actor=job_row.customer_id or actor_role='admin' then now() else customer_approved_at end,
      tradesperson_approved_at=case when actor=job_row.tradesperson_id or actor_role='admin' then now() else tradesperson_approved_at end,
      updated_at=now()
    where id=p_scope_change_id returning * into change_row;
    if change_row.customer_approved_at is not null and change_row.tradesperson_approved_at is not null then
      update public.scope_changes set status='approved',decided_at=now() where id=p_scope_change_id returning * into change_row;
    end if;
  end if;
  perform private.append_job_event(job_row.id,case when change_row.status='approved' then 'scope_change_approved' when change_row.status='rejected' then 'scope_change_rejected' else 'scope_change_partially_approved' end,actor,actor_role,jsonb_build_object('scope_change_id',change_row.id,'status',change_row.status));
  return change_row;
end;
$$;
revoke execute on function public.respond_scope_change(uuid,boolean) from public,anon;
grant execute on function public.respond_scope_change(uuid,boolean) to authenticated;

create or replace function public.save_job_address(p_job_id uuid,p_address_line text,p_building text default null,p_apartment text default null,p_directions text default null)
returns public.job_addresses
language plpgsql security definer set search_path = ''
as $$
declare actor uuid := (select auth.uid());job_row public.jobs%rowtype;address_row public.job_addresses%rowtype;
begin
  select * into job_row from public.jobs where id=p_job_id for update;
  if actor is null or actor<>job_row.customer_id or job_row.status='cancelled' then raise exception 'Address cannot be shared'; end if;
  insert into public.job_addresses(job_id,customer_id,address_line,building,apartment,directions)
  values(p_job_id,actor,trim(p_address_line),nullif(trim(p_building),''),nullif(trim(p_apartment),''),nullif(trim(p_directions),''))
  on conflict(job_id) do update set address_line=excluded.address_line,building=excluded.building,apartment=excluded.apartment,directions=excluded.directions,updated_at=now()
  returning * into address_row;
  perform private.append_job_event(p_job_id,'address_shared',actor,'customer','{}'::jsonb);
  return address_row;
end;
$$;
revoke execute on function public.save_job_address(uuid,text,text,text,text) from public,anon;
grant execute on function public.save_job_address(uuid,text,text,text,text) to authenticated;

create or replace function public.claim_notification_batch(p_worker_id text,p_limit integer default 25)
returns setof public.notification_outbox
language sql security definer set search_path = ''
as $$
  update public.notification_outbox
  set status='processing',attempts=attempts+1,worker_id=p_worker_id,updated_at=now()
  where id in (
    select id from public.notification_outbox
    where ((status in ('pending','retrying') and next_attempt_at<=now()) or (status='processing' and updated_at<now()-interval '5 minutes'))
      and attempts<8
    order by next_attempt_at,id limit least(greatest(p_limit,1),100)
    for update skip locked
  ) returning *;
$$;
revoke execute on function public.claim_notification_batch(text,integer) from public,anon,authenticated;
grant execute on function public.claim_notification_batch(text,integer) to service_role;

create or replace function public.mark_notification_result(p_id bigint,p_succeeded boolean,p_error text default null)
returns public.notification_outbox
language plpgsql security definer set search_path = ''
as $$
declare row_value public.notification_outbox%rowtype;
begin
  update public.notification_outbox set
    status=case when p_succeeded then 'sent' when attempts>=8 then 'dead' else 'retrying' end,
    next_attempt_at=case when p_succeeded or attempts>=8 then next_attempt_at else now() + least(3600,30*power(2,attempts-1)) * interval '1 second' end,
    last_error=case when p_succeeded then null else left(p_error,2000) end,
    sent_at=case when p_succeeded then now() else null end,
    worker_id=null,updated_at=now()
  where id=p_id and status='processing' returning * into row_value;
  if not found then raise exception 'Notification is not processing'; end if;
  return row_value;
end;
$$;
revoke execute on function public.mark_notification_result(bigint,boolean,text) from public,anon,authenticated;
grant execute on function public.mark_notification_result(bigint,boolean,text) to service_role;

select cron.schedule(
  'notification-outbox-recovery',
  '*/10 * * * *',
  $job$
    update public.notification_outbox
    set status=case when attempts>=8 then 'dead' else 'retrying' end,
        next_attempt_at=case when attempts>=8 then next_attempt_at else now() end,
        worker_id=null,
        last_error=coalesce(last_error,'Worker lease expired'),
        updated_at=now()
    where status='processing' and updated_at<now()-interval '15 minutes';
  $job$
);

alter table public.jobs enable row level security;
alter table public.job_events enable row level security;
alter table public.job_messages enable row level security;
alter table public.inspection_appointments enable row level security;
alter table public.scope_changes enable row level security;
alter table public.job_addresses enable row level security;
alter table public.notification_outbox enable row level security;

create policy "participants read jobs" on public.jobs for select to authenticated
using ((select auth.uid()) in (customer_id,tradesperson_id) or (select private.is_admin()));
create policy "participants read timeline" on public.job_events for select to authenticated
using (exists(select 1 from public.jobs job where job.id=job_id and ((select auth.uid()) in (job.customer_id,job.tradesperson_id) or (select private.is_admin()))));
create policy "participants read messages" on public.job_messages for select to authenticated
using (exists(select 1 from public.jobs job where job.id=job_id and ((select auth.uid()) in (job.customer_id,job.tradesperson_id) or (select private.is_admin()))));
create policy "participants read inspections" on public.inspection_appointments for select to authenticated
using (exists(select 1 from public.jobs job where job.id=job_id and ((select auth.uid()) in (job.customer_id,job.tradesperson_id) or (select private.is_admin()))));
create policy "participants read scope changes" on public.scope_changes for select to authenticated
using (exists(select 1 from public.jobs job where job.id=job_id and ((select auth.uid()) in (job.customer_id,job.tradesperson_id) or (select private.is_admin()))));
create policy "address visible after provider selection" on public.job_addresses for select to authenticated
using (exists(select 1 from public.jobs job where job.id=job_id and ((select auth.uid()) in (job.customer_id,job.tradesperson_id) or (select private.is_admin()))));
create policy "recipients read own notifications" on public.notification_outbox for select to authenticated
using ((select auth.uid())=recipient_id);

grant select on public.jobs,public.job_events,public.job_messages,public.inspection_appointments,public.scope_changes,public.job_addresses,public.notification_outbox to authenticated;

insert into public.jobs(request_id,accepted_quote_id,customer_id,tradesperson_id,status,created_at,updated_at)
select quote.request_id,quote.id,request.customer_id,quote.tradesperson_id,'scheduled',coalesce(quote.accepted_at,quote.updated_at),coalesce(quote.accepted_at,quote.updated_at)
from public.quotes quote join public.service_requests request on request.id=quote.request_id
where quote.status='accepted'
on conflict(accepted_quote_id) do nothing;

insert into public.job_events(job_id,sequence,event_type,actor_id,actor_role,payload,created_at)
select job.id,1,'job_created',job.customer_id,'customer',jsonb_build_object('accepted_quote_id',job.accepted_quote_id),job.created_at
from public.jobs job where job.next_event_sequence=0;
select set_config('app.job_internal_mutation','on',true);
update public.jobs set next_event_sequence=1 where next_event_sequence=0;

create or replace function public.accept_quote(p_quote_id uuid)
returns public.quotes
language plpgsql security definer set search_path = ''
as $$
declare actor_id uuid := (select auth.uid());quote_row public.quotes%rowtype;request_row public.service_requests%rowtype;job_row public.jobs%rowtype;
begin
  if actor_id is null then raise exception 'Authentication required'; end if;
  select request.* into request_row from public.service_requests request join public.quotes quote on quote.request_id=request.id where quote.id=p_quote_id for update of request;
  if not found or request_row.customer_id<>actor_id then raise exception 'Quote not found'; end if;
  if request_row.status<>'quotes_received' then raise exception 'A quote has already been accepted or the request is closed'; end if;
  select * into quote_row from public.quotes where id=p_quote_id;
  if quote_row.status<>'submitted' then raise exception 'Quote is not available'; end if;
  if exists(select 1 from public.quotes newer where newer.request_id=quote_row.request_id and newer.tradesperson_id=quote_row.tradesperson_id and newer.version>quote_row.version) then raise exception 'Only the latest quote version can be accepted'; end if;
  perform set_config('app.quote_internal_mutation','on',true);
  update public.quotes set status=case when id=p_quote_id then 'accepted' else 'rejected' end,accepted_at=case when id=p_quote_id then now() end,accepted_by=case when id=p_quote_id then actor_id end,updated_at=now() where request_id=quote_row.request_id and status='submitted';
  perform set_config('app.request_internal_transition','on',true);
  update public.service_requests set status='provider_selected' where id=quote_row.request_id;
  insert into public.jobs(request_id,accepted_quote_id,customer_id,tradesperson_id,status)
  values(quote_row.request_id,quote_row.id,actor_id,quote_row.tradesperson_id,'scheduled') returning * into job_row;
  perform private.append_job_event(job_row.id,'job_created',actor_id,'customer',jsonb_build_object('accepted_quote_id',quote_row.id));
  select * into quote_row from public.quotes where id=p_quote_id;
  return quote_row;
end;
$$;
