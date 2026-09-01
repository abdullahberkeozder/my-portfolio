create table public.work_log_entries (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete restrict,
  kind text not null check (kind in ('before','progress','material','after')),
  caption text check (caption is null or length(caption) <= 500),
  storage_path text not null check (length(storage_path) between 3 and 500 and storage_path !~ '(^/|\.\.)'),
  customer_publication_consent boolean not null default false,
  moderation_status text not null default 'pending' check (moderation_status in ('pending','approved','rejected','hidden')),
  created_at timestamptz not null default now(),
  unique (job_id, storage_path)
);
create index work_log_job_created_idx on public.work_log_entries(job_id,created_at);
create index work_log_public_idx on public.work_log_entries(job_id,created_at) where customer_publication_consent and moderation_status='approved';

create table public.job_acceptances (
  job_id uuid primary key references public.jobs(id) on delete restrict,
  customer_id uuid not null references auth.users(id) on delete restrict,
  accepted_at timestamptz not null default now(),
  note text check (note is null or length(note) <= 1000)
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null unique references public.jobs(id) on delete restrict,
  customer_id uuid not null references auth.users(id) on delete restrict,
  tradesperson_id uuid not null references public.tradesperson_profiles(user_id) on delete restrict,
  rating smallint not null check (rating between 1 and 5),
  comment text check (comment is null or length(trim(comment)) between 10 and 2000),
  moderation_status text not null default 'pending' check (moderation_status in ('pending','approved','rejected','hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (customer_id <> tradesperson_id)
);
create index reviews_tradesperson_public_idx on public.reviews(tradesperson_id,created_at desc) where moderation_status='approved';

create sequence public.workmanship_certificate_number_seq;
create table public.workmanship_certificates (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null unique references public.jobs(id) on delete restrict,
  certificate_number text not null unique,
  scope_snapshot jsonb not null check (jsonb_typeof(scope_snapshot)='object'),
  issued_at timestamptz not null default now(),
  warranty_ends_at timestamptz
);

create table public.dispute_cases (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete restrict,
  opened_by uuid not null references auth.users(id) on delete restrict,
  category text not null check (category in ('quality','scope','payment','conduct','damage','other')),
  description text not null check (length(trim(description)) between 20 and 4000),
  status text not null default 'open' check (status in ('open','under_review','awaiting_evidence','resolved','dismissed')),
  resolution text check (resolution is null or length(trim(resolution)) between 10 and 4000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index dispute_one_active_per_job_idx on public.dispute_cases(job_id) where status in ('open','under_review','awaiting_evidence');

create table public.moderation_decisions (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('work_log_entry','review','dispute','tradesperson')),
  entity_id uuid not null,
  action text not null check (action in ('approve','reject','hide','restore','warn','suspend')),
  actor_id uuid not null references auth.users(id) on delete restrict,
  reason text not null check (length(trim(reason)) between 10 and 2000),
  created_at timestamptz not null default now()
);
create index moderation_entity_timeline_idx on public.moderation_decisions(entity_type,entity_id,created_at desc);

create or replace function private.issue_workmanship_certificate()
returns trigger language plpgsql security definer set search_path=''
as $$
begin
  if new.status='completed' and old.status is distinct from 'completed' then
    insert into public.job_acceptances(job_id,customer_id) values(new.id,new.customer_id) on conflict do nothing;
    insert into public.workmanship_certificates(job_id,certificate_number,scope_snapshot,warranty_ends_at)
    select new.id,'AU-'||to_char(now(),'YYYY')||'-'||lpad(nextval('public.workmanship_certificate_number_seq')::text,8,'0'),
      jsonb_build_object('quote_id',q.id,'labor_amount_kurus',q.labor_amount_kurus,'material_amount_kurus',q.material_amount_kurus,'included_scope',q.included_scope,'excluded_scope',q.excluded_scope,'warranty_days',q.warranty_days),new.warranty_ends_at
    from public.quotes q where q.id=new.accepted_quote_id on conflict(job_id) do nothing;
  end if;
  return new;
end;$$;
revoke execute on function private.issue_workmanship_certificate() from public,anon,authenticated,service_role;
create trigger jobs_issue_certificate after update of status on public.jobs for each row execute function private.issue_workmanship_certificate();

create or replace function public.create_job_review(p_job_id uuid,p_rating integer,p_comment text default null)
returns public.reviews language plpgsql security definer set search_path=''
as $$
declare actor uuid:=(select auth.uid());job_row public.jobs%rowtype;review_row public.reviews%rowtype;
begin
  select * into job_row from public.jobs where id=p_job_id for update;
  if actor is null or job_row.id is null or actor<>job_row.customer_id or job_row.status<>'completed' then raise exception 'Only the customer may review a completed job'; end if;
  if p_rating not between 1 and 5 or (p_comment is not null and length(trim(p_comment)) not between 10 and 2000) then raise exception 'Review is invalid'; end if;
  insert into public.reviews(job_id,customer_id,tradesperson_id,rating,comment)
  values(p_job_id,actor,job_row.tradesperson_id,p_rating,nullif(trim(p_comment),'')) returning * into review_row;
  perform private.append_job_event(p_job_id,'review_created',actor,'customer',jsonb_build_object('review_id',review_row.id));
  return review_row;
end;$$;
revoke execute on function public.create_job_review(uuid,integer,text) from public,anon;
grant execute on function public.create_job_review(uuid,integer,text) to authenticated;

create or replace function public.moderate_entity(p_entity_type text,p_entity_id uuid,p_action text,p_reason text)
returns public.moderation_decisions language plpgsql security definer set search_path=''
as $$
declare actor uuid:=(select auth.uid());decision public.moderation_decisions%rowtype;new_status text;
begin
  if actor is null or not private.is_admin() then raise exception 'Administrator permission required'; end if;
  if length(trim(p_reason)) not between 10 and 2000 then raise exception 'A moderation reason is required'; end if;
  new_status:=case p_action when 'approve' then 'approved' when 'reject' then 'rejected' when 'hide' then 'hidden' when 'restore' then 'approved' else null end;
  if p_entity_type='work_log_entry' and new_status is not null then update public.work_log_entries set moderation_status=new_status where id=p_entity_id;
  elsif p_entity_type='review' and new_status is not null then update public.reviews set moderation_status=new_status,updated_at=now() where id=p_entity_id;
  elsif p_entity_type not in ('dispute','tradesperson') then raise exception 'Unsupported moderation target'; end if;
  if not found and p_entity_type in ('work_log_entry','review') then raise exception 'Moderation target not found'; end if;
  insert into public.moderation_decisions(entity_type,entity_id,action,actor_id,reason) values(p_entity_type,p_entity_id,p_action,actor,trim(p_reason)) returning * into decision;
  insert into public.admin_audit_log(actor_id,action,entity_type,entity_id,after_data) values(actor,'moderation_'||p_action,p_entity_type,p_entity_id,jsonb_build_object('reason',trim(p_reason),'decision_id',decision.id));
  return decision;
end;$$;
revoke execute on function public.moderate_entity(text,uuid,text,text) from public,anon;
grant execute on function public.moderate_entity(text,uuid,text,text) to authenticated;

create or replace function private.prevent_moderation_decision_mutation()
returns trigger language plpgsql set search_path='' as $$ begin raise exception 'Moderation decisions are append-only'; end;$$;
revoke execute on function private.prevent_moderation_decision_mutation() from public,anon,authenticated,service_role;
create trigger moderation_decisions_immutable before update or delete on public.moderation_decisions for each row execute function private.prevent_moderation_decision_mutation();

create table public.district_trust_metrics (
  district text not null,
  tradesperson_id uuid not null references public.tradesperson_profiles(user_id) on delete cascade,
  completed_jobs bigint not null check (completed_jobs>=5),
  average_rating numeric(3,2) not null check (average_rating between 1 and 5),
  updated_at timestamptz not null default now(),
  primary key(district,tradesperson_id)
);
create or replace function private.refresh_district_trust_metrics()
returns trigger language plpgsql security definer set search_path=''
as $$
begin
  delete from public.district_trust_metrics;
  insert into public.district_trust_metrics(district,tradesperson_id,completed_jobs,average_rating)
  select sr.district,j.tradesperson_id,count(*)::bigint,round(avg(rv.rating)::numeric,2)
  from public.reviews rv join public.jobs j on j.id=rv.job_id join public.service_requests sr on sr.id=j.request_id
  where rv.moderation_status='approved' group by sr.district,j.tradesperson_id having count(*)>=5;
  return coalesce(new,old);
end;$$;
revoke execute on function private.refresh_district_trust_metrics() from public,anon,authenticated,service_role;
create trigger reviews_refresh_trust_metrics after insert or update or delete on public.reviews for each statement execute function private.refresh_district_trust_metrics();

alter table public.work_log_entries enable row level security;
alter table public.job_acceptances enable row level security;
alter table public.reviews enable row level security;
alter table public.workmanship_certificates enable row level security;
alter table public.dispute_cases enable row level security;
alter table public.moderation_decisions enable row level security;
alter table public.district_trust_metrics enable row level security;

create policy "participants read work log" on public.work_log_entries for select to authenticated using (customer_publication_consent and moderation_status='approved' or exists(select 1 from public.jobs j where j.id=job_id and ((select auth.uid()) in (j.customer_id,j.tradesperson_id) or (select private.is_admin()))));
create policy "public reads approved work media" on public.work_log_entries for select to anon using (customer_publication_consent and moderation_status='approved');
create policy "participants add work log" on public.work_log_entries for insert to authenticated with check (author_id=(select auth.uid()) and exists(select 1 from public.jobs j where j.id=job_id and (select auth.uid()) in (j.customer_id,j.tradesperson_id) and j.status not in ('cancelled')));
create policy "participants read acceptance" on public.job_acceptances for select to authenticated using (exists(select 1 from public.jobs j where j.id=job_id and ((select auth.uid()) in (j.customer_id,j.tradesperson_id) or (select private.is_admin()))));
create policy "public reads approved reviews" on public.reviews for select to anon using (moderation_status='approved');
create policy "participants read reviews" on public.reviews for select to authenticated using (moderation_status='approved' or (select auth.uid()) in (customer_id,tradesperson_id) or (select private.is_admin()));
create policy "participants read certificates" on public.workmanship_certificates for select to authenticated using (exists(select 1 from public.jobs j where j.id=job_id and ((select auth.uid()) in (j.customer_id,j.tradesperson_id) or (select private.is_admin()))));
create policy "participants read disputes" on public.dispute_cases for select to authenticated using (exists(select 1 from public.jobs j where j.id=job_id and ((select auth.uid()) in (j.customer_id,j.tradesperson_id) or (select private.is_admin()))));
create policy "participants open disputes" on public.dispute_cases for insert to authenticated with check (opened_by=(select auth.uid()) and exists(select 1 from public.jobs j where j.id=job_id and (select auth.uid()) in (j.customer_id,j.tradesperson_id)));
create policy "admins read moderation decisions" on public.moderation_decisions for select to authenticated using ((select private.is_admin()));
create policy "everyone reads thresholded trust metrics" on public.district_trust_metrics for select to anon,authenticated using (true);

grant select,insert on public.work_log_entries to authenticated;
grant select on public.work_log_entries,public.reviews to anon;
grant select on public.job_acceptances,public.reviews,public.workmanship_certificates,public.dispute_cases,public.moderation_decisions to authenticated;
grant insert on public.dispute_cases to authenticated;
grant select on public.district_trust_metrics to anon,authenticated;
