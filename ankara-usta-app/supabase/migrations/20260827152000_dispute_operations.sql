alter table public.dispute_cases drop constraint dispute_cases_status_check;
update public.dispute_cases set status=case status
  when 'open' then 'opened' when 'under_review' then 'investigation'
  when 'resolved' then 'closed' else status end;
alter table public.dispute_cases add constraint dispute_cases_status_check check(status in (
  'opened','triage','awaiting_evidence','counterparty_response','investigation',
  'resolution_proposed','notified','appealed','closed','dismissed'
));
alter table public.dispute_cases
  add column assigned_to uuid references auth.users(id),
  add column evidence_due_at timestamptz,
  add column appeal_due_at timestamptz,
  add column sla_due_at timestamptz not null default (now()+interval '24 hours'),
  add column last_transition_at timestamptz not null default now(),
  add column closed_at timestamptz;
drop index dispute_one_active_per_job_idx;
create unique index dispute_one_active_per_job_idx on public.dispute_cases(job_id)
where status not in ('closed','dismissed');
create index dispute_operations_sla_idx on public.dispute_cases(sla_due_at,status)
where status not in ('closed','dismissed');

create table public.dispute_events(
  id uuid primary key default gen_random_uuid(),
  dispute_id uuid not null references public.dispute_cases(id) on delete restrict,
  event_type text not null check(event_type~'^[a-z0-9_]+$'),
  actor_id uuid references auth.users(id) on delete restrict,
  actor_role text not null check(actor_role in ('customer','tradesperson','moderator','admin','system')),
  from_status text,
  to_status text,
  reason text check(reason is null or length(trim(reason)) between 5 and 2000),
  payload jsonb not null default '{}'::jsonb check(jsonb_typeof(payload)='object'),
  created_at timestamptz not null default now(),
  check((actor_role='system' and actor_id is null) or (actor_role<>'system' and actor_id is not null))
);
create index dispute_events_timeline_idx on public.dispute_events(dispute_id,created_at,id);

create table public.dispute_evidence(
  id uuid primary key default gen_random_uuid(),
  dispute_id uuid not null references public.dispute_cases(id) on delete restrict,
  submitted_by uuid not null references auth.users(id) on delete restrict,
  kind text not null check(kind in ('photo','video','document','message_export','invoice','other')),
  description text not null check(length(trim(description)) between 5 and 1000),
  storage_path text not null unique check(length(storage_path) between 10 and 500 and storage_path!~'(^/|\.\.)'),
  content_type text not null check(content_type in ('image/jpeg','image/png','image/webp','video/mp4','application/pdf','text/plain')),
  byte_size bigint not null check(byte_size between 1 and 26214400),
  submitted_at timestamptz not null default now()
);
create index dispute_evidence_case_idx on public.dispute_evidence(dispute_id,submitted_at);

create table public.dispute_statements(
  id uuid primary key default gen_random_uuid(),
  dispute_id uuid not null references public.dispute_cases(id) on delete restrict,
  submitted_by uuid not null references auth.users(id) on delete restrict,
  statement text not null check(length(trim(statement)) between 20 and 6000),
  created_at timestamptz not null default now()
);
create index dispute_statements_case_idx on public.dispute_statements(dispute_id,created_at);

create table public.dispute_internal_notes(
  id uuid primary key default gen_random_uuid(),
  dispute_id uuid not null references public.dispute_cases(id) on delete restrict,
  author_id uuid not null references auth.users(id) on delete restrict,
  note text not null check(length(trim(note)) between 5 and 4000),
  created_at timestamptz not null default now()
);
create index dispute_internal_notes_case_idx on public.dispute_internal_notes(dispute_id,created_at);

create table public.dispute_decisions(
  id uuid primary key default gen_random_uuid(),
  dispute_id uuid not null references public.dispute_cases(id) on delete restrict,
  decision_type text not null check(decision_type in ('resolution_proposed','notified','appeal_decision','closed','dismissed')),
  customer_explanation text not null check(length(trim(customer_explanation)) between 10 and 4000),
  tradesperson_explanation text not null check(length(trim(tradesperson_explanation)) between 10 and 4000),
  actor_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);
create index dispute_decisions_case_idx on public.dispute_decisions(dispute_id,created_at);

create table public.dispute_appeals(
  id uuid primary key default gen_random_uuid(),
  dispute_id uuid not null references public.dispute_cases(id) on delete restrict,
  appealed_by uuid not null references auth.users(id) on delete restrict,
  reason text not null check(length(trim(reason)) between 20 and 4000),
  created_at timestamptz not null default now()
);
create unique index dispute_one_appeal_per_party_idx on public.dispute_appeals(dispute_id,appealed_by);

create table public.tradesperson_sanctions(
  id uuid primary key default gen_random_uuid(),
  dispute_id uuid not null references public.dispute_cases(id) on delete restrict,
  tradesperson_id uuid not null references public.tradesperson_profiles(user_id) on delete restrict,
  sanction_type text not null check(sanction_type in ('warning','temporary_suspension','permanent_suspension')),
  reason text not null check(length(trim(reason)) between 10 and 2000),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  actor_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  check((sanction_type='temporary_suspension' and ends_at>starts_at) or (sanction_type<>'temporary_suspension' and ends_at is null))
);
create index tradesperson_sanctions_provider_idx on public.tradesperson_sanctions(tradesperson_id,created_at desc);

create or replace function private.is_dispute_participant(p_dispute_id uuid)
returns boolean language sql stable security definer set search_path=''
as $$select exists(
  select 1 from public.dispute_cases dispute join public.jobs job on job.id=dispute.job_id
  where dispute.id=p_dispute_id and (select auth.uid()) in(job.customer_id,job.tradesperson_id)
)$$;
revoke all on function private.is_dispute_participant(uuid) from public,anon,authenticated,service_role;
grant execute on function private.is_dispute_participant(uuid) to authenticated;

create or replace function private.dispute_actor_role(p_dispute_id uuid,p_actor uuid)
returns text language sql stable security definer set search_path=''
as $$select case
  when exists(select 1 from public.user_roles where user_id=p_actor and role='admin') then 'admin'
  when exists(select 1 from public.user_roles where user_id=p_actor and role='moderator') then 'moderator'
  when job.customer_id=p_actor then 'customer'
  when job.tradesperson_id=p_actor then 'tradesperson'
end from public.dispute_cases dispute join public.jobs job on job.id=dispute.job_id where dispute.id=p_dispute_id$$;
revoke all on function private.dispute_actor_role(uuid,uuid) from public,anon,authenticated,service_role;

create or replace function private.prevent_dispute_record_mutation()
returns trigger language plpgsql set search_path='' as $$begin raise exception 'Dispute history is append-only';end$$;
revoke all on function private.prevent_dispute_record_mutation() from public,anon,authenticated,service_role;
create trigger dispute_events_immutable before update or delete on public.dispute_events for each row execute function private.prevent_dispute_record_mutation();
create trigger dispute_evidence_immutable before update or delete on public.dispute_evidence for each row execute function private.prevent_dispute_record_mutation();
create trigger dispute_statements_immutable before update or delete on public.dispute_statements for each row execute function private.prevent_dispute_record_mutation();
create trigger dispute_internal_notes_immutable before update or delete on public.dispute_internal_notes for each row execute function private.prevent_dispute_record_mutation();
create trigger dispute_decisions_immutable before update or delete on public.dispute_decisions for each row execute function private.prevent_dispute_record_mutation();
create trigger dispute_appeals_immutable before update or delete on public.dispute_appeals for each row execute function private.prevent_dispute_record_mutation();
create trigger tradesperson_sanctions_immutable before update or delete on public.tradesperson_sanctions for each row execute function private.prevent_dispute_record_mutation();

create or replace function private.audit_dispute_evidence_insert()
returns trigger language plpgsql security definer set search_path=''
as $$begin
  insert into public.dispute_events(dispute_id,event_type,actor_id,actor_role,payload)
  values(new.dispute_id,'evidence_added',new.submitted_by,private.dispute_actor_role(new.dispute_id,new.submitted_by),jsonb_build_object('evidence_id',new.id,'kind',new.kind));
  return new;
end$$;
revoke all on function private.audit_dispute_evidence_insert() from public,anon,authenticated,service_role;
create trigger dispute_evidence_audit after insert on public.dispute_evidence for each row execute function private.audit_dispute_evidence_insert();

create or replace function public.open_job_dispute(p_job_id uuid,p_category text,p_description text)
returns public.dispute_cases language plpgsql security definer set search_path=''
as $$declare actor uuid:=(select auth.uid());job_row public.jobs%rowtype;created public.dispute_cases%rowtype;actor_role text;
begin
  select * into job_row from public.jobs where id=p_job_id;
  if actor is null or actor not in(job_row.customer_id,job_row.tradesperson_id) then raise exception 'Only job participants may open a dispute';end if;
  if p_category not in('quality','scope','payment','conduct','damage','other') or length(trim(p_description)) not between 20 and 4000 then raise exception 'Dispute input is invalid';end if;
  actor_role:=case when actor=job_row.customer_id then 'customer' else 'tradesperson' end;
  insert into public.dispute_cases(job_id,opened_by,category,description,status,sla_due_at)
  values(p_job_id,actor,p_category,trim(p_description),'opened',now()+interval '24 hours') returning * into created;
  insert into public.dispute_events(dispute_id,event_type,actor_id,actor_role,to_status,reason)
  values(created.id,'dispute_opened',actor,actor_role,'opened',trim(p_description));
  perform private.append_job_event(p_job_id,'dispute_opened',actor,actor_role,jsonb_build_object('dispute_id',created.id));
  return created;
end$$;
revoke execute on function public.open_job_dispute(uuid,text,text) from public,anon;
grant execute on function public.open_job_dispute(uuid,text,text) to authenticated;

create or replace function public.add_dispute_statement(p_dispute_id uuid,p_statement text)
returns public.dispute_statements language plpgsql security definer set search_path=''
as $$declare actor uuid:=(select auth.uid());created public.dispute_statements%rowtype;actor_role text;
begin
  if actor is null or not private.is_dispute_participant(p_dispute_id) or length(trim(p_statement)) not between 20 and 6000 then raise exception 'Statement is not allowed';end if;
  actor_role:=private.dispute_actor_role(p_dispute_id,actor);
  insert into public.dispute_statements(dispute_id,submitted_by,statement) values(p_dispute_id,actor,trim(p_statement)) returning * into created;
  insert into public.dispute_events(dispute_id,event_type,actor_id,actor_role,payload) values(p_dispute_id,'party_statement_added',actor,actor_role,jsonb_build_object('statement_id',created.id));
  return created;
end$$;
revoke execute on function public.add_dispute_statement(uuid,text) from public,anon;
grant execute on function public.add_dispute_statement(uuid,text) to authenticated;

create or replace function public.submit_dispute_appeal(p_dispute_id uuid,p_reason text)
returns public.dispute_appeals language plpgsql security definer set search_path=''
as $$declare actor uuid:=(select auth.uid());dispute public.dispute_cases%rowtype;created public.dispute_appeals%rowtype;actor_role text;
begin
  select * into dispute from public.dispute_cases where id=p_dispute_id for update;
  if actor is null or not private.is_dispute_participant(p_dispute_id) or dispute.status not in('notified','dismissed') or (dispute.appeal_due_at is not null and dispute.appeal_due_at<now()) or length(trim(p_reason)) not between 20 and 4000 then raise exception 'Appeal is not allowed';end if;
  actor_role:=private.dispute_actor_role(p_dispute_id,actor);
  insert into public.dispute_appeals(dispute_id,appealed_by,reason) values(p_dispute_id,actor,trim(p_reason)) returning * into created;
  update public.dispute_cases set status='appealed',last_transition_at=now(),sla_due_at=now()+interval '48 hours',updated_at=now() where id=p_dispute_id;
  insert into public.dispute_events(dispute_id,event_type,actor_id,actor_role,from_status,to_status,reason) values(p_dispute_id,'appeal_submitted',actor,actor_role,dispute.status,'appealed',trim(p_reason));
  return created;
end$$;
revoke execute on function public.submit_dispute_appeal(uuid,text) from public,anon;
grant execute on function public.submit_dispute_appeal(uuid,text) to authenticated;

create or replace function public.admin_transition_dispute(
  p_dispute_id uuid,p_status text,p_reason text,p_evidence_due_at timestamptz default null,
  p_customer_explanation text default null,p_tradesperson_explanation text default null
)
returns public.dispute_cases language plpgsql security definer set search_path=''
as $$declare actor uuid:=(select auth.uid());dispute public.dispute_cases%rowtype;operator_role text;allowed boolean;next_sla timestamptz;old_status text;
begin
  if actor is null or not private.is_admin() or length(trim(p_reason)) not between 10 and 2000 then raise exception 'Operator transition is not allowed';end if;
  select * into dispute from public.dispute_cases where id=p_dispute_id for update;
  allowed:=(dispute.status,p_status) in(
    ('opened','triage'),('opened','dismissed'),('triage','awaiting_evidence'),('triage','counterparty_response'),('triage','investigation'),('triage','dismissed'),
    ('awaiting_evidence','counterparty_response'),('awaiting_evidence','investigation'),('awaiting_evidence','dismissed'),('counterparty_response','investigation'),('counterparty_response','awaiting_evidence'),
    ('investigation','resolution_proposed'),('investigation','awaiting_evidence'),('investigation','dismissed'),('resolution_proposed','notified'),('resolution_proposed','investigation'),
    ('notified','closed'),('appealed','investigation'),('appealed','resolution_proposed'),('appealed','closed'),('dismissed','closed')
  );
  if not allowed then raise exception 'Invalid dispute transition: % -> %',dispute.status,p_status;end if;
  if p_status='awaiting_evidence' and (p_evidence_due_at is null or p_evidence_due_at<=now()) then raise exception 'A future evidence deadline is required';end if;
  if p_status in('resolution_proposed','notified','closed','dismissed') and (coalesce(length(trim(p_customer_explanation)),0)<10 or coalesce(length(trim(p_tradesperson_explanation)),0)<10) then raise exception 'Separate party explanations are required';end if;
  next_sla:=case p_status when 'triage' then now()+interval '4 hours' when 'awaiting_evidence' then p_evidence_due_at when 'counterparty_response' then now()+interval '24 hours' when 'investigation' then now()+interval '48 hours' when 'resolution_proposed' then now()+interval '24 hours' when 'notified' then now()+interval '72 hours' when 'appealed' then now()+interval '48 hours' else now() end;
  old_status:=dispute.status;
  update public.dispute_cases set status=p_status,assigned_to=coalesce(assigned_to,actor),evidence_due_at=case when p_status='awaiting_evidence' then p_evidence_due_at else evidence_due_at end,appeal_due_at=case when p_status='notified' then now()+interval '72 hours' else appeal_due_at end,sla_due_at=next_sla,last_transition_at=now(),closed_at=case when p_status in('closed','dismissed') then now() end,resolution=case when p_status in('closed','dismissed') then p_customer_explanation else resolution end,updated_at=now() where id=p_dispute_id returning * into dispute;
  operator_role:=case when exists(select 1 from public.user_roles where user_id=actor and role='admin') then 'admin' else 'moderator' end;
  insert into public.dispute_events(dispute_id,event_type,actor_id,actor_role,from_status,to_status,reason,payload) values(p_dispute_id,'status_changed',actor,operator_role,old_status,p_status,trim(p_reason),jsonb_build_object('evidence_due_at',p_evidence_due_at));
  if p_status in('resolution_proposed','notified','closed','dismissed') then
    insert into public.dispute_decisions(dispute_id,decision_type,customer_explanation,tradesperson_explanation,actor_id) values(p_dispute_id,p_status,trim(p_customer_explanation),trim(p_tradesperson_explanation),actor);
  end if;
  insert into public.admin_audit_log(actor_id,action,entity_type,entity_id,after_data) values(actor,'dispute_'||p_status,'dispute',p_dispute_id,jsonb_build_object('from_status',old_status,'to_status',p_status,'reason',trim(p_reason)));
  return dispute;
end$$;
revoke execute on function public.admin_transition_dispute(uuid,text,text,timestamptz,text,text) from public,anon;
grant execute on function public.admin_transition_dispute(uuid,text,text,timestamptz,text,text) to authenticated;

create or replace function public.add_dispute_internal_note(p_dispute_id uuid,p_note text)
returns public.dispute_internal_notes language plpgsql security definer set search_path=''
as $$declare actor uuid:=(select auth.uid());created public.dispute_internal_notes%rowtype;
begin
  if actor is null or not private.is_admin() or length(trim(p_note)) not between 5 and 4000 then raise exception 'Internal note is not allowed';end if;
  insert into public.dispute_internal_notes(dispute_id,author_id,note) values(p_dispute_id,actor,trim(p_note)) returning * into created;
  insert into public.admin_audit_log(actor_id,action,entity_type,entity_id,after_data) values(actor,'dispute_internal_note','dispute',p_dispute_id,jsonb_build_object('note_id',created.id));
  return created;
end$$;
revoke execute on function public.add_dispute_internal_note(uuid,text) from public,anon;
grant execute on function public.add_dispute_internal_note(uuid,text) to authenticated;

create or replace function public.apply_tradesperson_sanction(p_dispute_id uuid,p_type text,p_reason text,p_ends_at timestamptz default null)
returns public.tradesperson_sanctions language plpgsql security definer set search_path=''
as $$declare actor uuid:=(select auth.uid());provider uuid;created public.tradesperson_sanctions%rowtype;
begin
  if actor is null or not private.is_admin() or p_type not in('warning','temporary_suspension','permanent_suspension') or length(trim(p_reason)) not between 10 and 2000 or (p_type='temporary_suspension' and (p_ends_at is null or p_ends_at<=now())) or (p_type<>'temporary_suspension' and p_ends_at is not null) then raise exception 'Sanction is not allowed';end if;
  select job.tradesperson_id into provider from public.dispute_cases dispute join public.jobs job on job.id=dispute.job_id where dispute.id=p_dispute_id;
  insert into public.tradesperson_sanctions(dispute_id,tradesperson_id,sanction_type,reason,ends_at,actor_id) values(p_dispute_id,provider,p_type,trim(p_reason),p_ends_at,actor) returning * into created;
  if p_type in('temporary_suspension','permanent_suspension') then update public.tradesperson_profiles set application_status='suspended',reviewed_at=now(),reviewed_by=actor,review_note=trim(p_reason) where user_id=provider and application_status='approved';end if;
  insert into public.admin_audit_log(actor_id,action,entity_type,entity_id,after_data) values(actor,'tradesperson_'||p_type,'tradesperson',provider,jsonb_build_object('dispute_id',p_dispute_id,'sanction_id',created.id,'reason',trim(p_reason)));
  return created;
end$$;
revoke execute on function public.apply_tradesperson_sanction(uuid,text,text,timestamptz) from public,anon;
grant execute on function public.apply_tradesperson_sanction(uuid,text,text,timestamptz) to authenticated;

alter table public.dispute_events enable row level security;
alter table public.dispute_evidence enable row level security;
alter table public.dispute_statements enable row level security;
alter table public.dispute_internal_notes enable row level security;
alter table public.dispute_decisions enable row level security;
alter table public.dispute_appeals enable row level security;
alter table public.tradesperson_sanctions enable row level security;
drop policy "participants open disputes" on public.dispute_cases;
revoke insert on public.dispute_cases from authenticated;
create policy "participants read dispute events" on public.dispute_events for select to authenticated using(private.is_dispute_participant(dispute_id) or private.is_admin());
create policy "participants read dispute evidence" on public.dispute_evidence for select to authenticated using(private.is_dispute_participant(dispute_id) or private.is_admin());
create policy "participants add dispute evidence" on public.dispute_evidence for insert to authenticated with check(submitted_by=(select auth.uid()) and private.is_dispute_participant(dispute_id));
create policy "participants read dispute statements" on public.dispute_statements for select to authenticated using(private.is_dispute_participant(dispute_id) or private.is_admin());
create policy "operators read internal notes" on public.dispute_internal_notes for select to authenticated using(private.is_admin());
create policy "participants read dispute decisions" on public.dispute_decisions for select to authenticated using(private.is_dispute_participant(dispute_id) or private.is_admin());
create policy "participants read dispute appeals" on public.dispute_appeals for select to authenticated using(private.is_dispute_participant(dispute_id) or private.is_admin());
create policy "providers read own sanctions" on public.tradesperson_sanctions for select to authenticated using(tradesperson_id=(select auth.uid()) or private.is_admin());
revoke all on public.dispute_events,public.dispute_evidence,public.dispute_statements,public.dispute_internal_notes,public.dispute_decisions,public.dispute_appeals,public.tradesperson_sanctions from anon;
grant select on public.dispute_events,public.dispute_evidence,public.dispute_statements,public.dispute_appeals,public.tradesperson_sanctions to authenticated;
grant select on public.dispute_internal_notes to authenticated;
grant insert on public.dispute_evidence to authenticated;

create or replace function public.get_dispute_decisions(p_dispute_id uuid)
returns table(id uuid,decision_type text,customer_explanation text,tradesperson_explanation text,created_at timestamptz)
language plpgsql security definer set search_path=''
as $$declare actor uuid:=(select auth.uid());actor_role text;
begin
  actor_role:=private.dispute_actor_role(p_dispute_id,actor);
  if actor is null or actor_role is null then raise exception 'Dispute decisions are not available';end if;
  return query select decision.id,decision.decision_type,
    case when actor_role in('admin','moderator','customer') then decision.customer_explanation end,
    case when actor_role in('admin','moderator','tradesperson') then decision.tradesperson_explanation end,
    decision.created_at
  from public.dispute_decisions decision where decision.dispute_id=p_dispute_id order by decision.created_at;
end$$;
revoke execute on function public.get_dispute_decisions(uuid) from public,anon;
grant execute on function public.get_dispute_decisions(uuid) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values(
  'dispute-evidence','dispute-evidence',false,26214400,array['image/jpeg','image/png','image/webp','video/mp4','application/pdf','text/plain']
) on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
create policy "participants upload dispute evidence" on storage.objects for insert to authenticated with check(
  bucket_id='dispute-evidence' and (storage.foldername(name))[2]=(select auth.uid())::text
  and private.is_dispute_participant(((storage.foldername(name))[1])::uuid)
);
create policy "participants read dispute evidence objects" on storage.objects for select to authenticated using(
  bucket_id='dispute-evidence' and (private.is_dispute_participant(((storage.foldername(name))[1])::uuid) or private.is_admin())
);
