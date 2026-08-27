begin;

create temporary table phase65_context (
  customer_id uuid not null,
  tradesperson_id uuid not null,
  request_id uuid not null default gen_random_uuid(),
  run_id uuid not null default gen_random_uuid(),
  quote_id uuid not null default gen_random_uuid(),
  job_id uuid not null default gen_random_uuid(),
  scope_change_id uuid,
  scope_event_id uuid,
  notification_id bigint,
  notification_status text,
  notification_attempts integer,
  notification_error text,
  notification_next_attempt_at timestamptz
) on commit drop;
grant select,update on phase65_context to authenticated,service_role;

insert into phase65_context(customer_id,tradesperson_id)
select customer.id,tradesperson.id
from lateral(select id from auth.users order by created_at,id limit 1) customer
cross join lateral(
  select id from auth.users
  where id<>customer.id
    and not exists(select 1 from public.tradesperson_profiles profile where profile.user_id=auth.users.id)
  order by created_at,id limit 1
) tradesperson;

do $$begin
  if not exists(select 1 from phase65_context) then
    raise exception 'Two distinct Auth users are required for Phase 6.5';
  end if;
end$$;

insert into public.tradesperson_profiles(user_id,display_name,bio,application_status,submitted_at)
select tradesperson_id,'Faz 6.5 Test Ustası','Doğrulama ve sertleştirme testlerine ait geçici profil.','suspended',now()
from phase65_context;
insert into public.tradesperson_documents(
  tradesperson_id,kind,status,storage_path,original_name,content_type,byte_size,verified_at,verified_by
)
select tradesperson_id,'professional_certificate','verified',tradesperson_id||'/phase65-certificate.pdf',
  'phase65-certificate.pdf','application/pdf',256,now(),customer_id
from phase65_context;

insert into public.service_requests(
  id,customer_id,service_id,delivery_model,status,answers,district,neighborhood,
  preferred_timing,idempotency_key,submitted_at
)
select request_id,customer_id,'avize-montaji','quote','matching','{"fixture":"phase65"}',
  'Çankaya','Kızılay','Bu hafta',gen_random_uuid(),now()
from phase65_context;
insert into public.request_media(request_id,customer_id,storage_path,content_type,byte_size)
select request_id,customer_id,customer_id||'/'||request_id||'/phase65.webp','image/webp',128
from phase65_context;
insert into storage.objects(id,bucket_id,name,owner_id)
select gen_random_uuid(),'request-media',customer_id||'/'||request_id||'/phase65.webp',customer_id
from phase65_context;
insert into public.matching_runs(id,request_id,supply_state,eligible_count,recommended_action)
select run_id,request_id,'limited_supply',1,'phase65 fixture' from phase65_context;
insert into public.request_matches(run_id,request_id,tradesperson_id,score,score_components,reasons)
select run_id,request_id,tradesperson_id,91,'{"verification":30}'::jsonb,'["Phase 6.5 eşleşmesi"]'::jsonb
from phase65_context;

-- Cross-user document, media metadata, and Storage object isolation.
select set_config('request.jwt.claim.role','authenticated',true);
select set_config('request.jwt.claim.sub',(select customer_id::text from phase65_context),true);
set local role authenticated;
do $$begin
  if exists(select 1 from public.tradesperson_documents where tradesperson_id=(select tradesperson_id from phase65_context)) then
    raise exception 'Customer can read another user''s tradesperson document';
  end if;
end$$;

reset role;
select set_config('request.jwt.claim.sub',(select tradesperson_id::text from phase65_context),true);
set local role authenticated;
do $$begin
  if exists(select 1 from public.request_media where request_id=(select request_id from phase65_context)) then
    raise exception 'Tradesperson can read customer request-media metadata';
  end if;
  if exists(select 1 from storage.objects where bucket_id='request-media' and name like '%/phase65.webp') then
    raise exception 'Tradesperson can read customer request-media object';
  end if;
  begin
    perform public.create_quote_version((select request_id from phase65_context),10000,1000,60,30,array['Montaj'],array[]::text[],'Reddedilmesi gereken teklif');
    raise exception 'Unapproved tradesperson created a quote';
  exception when others then
    if sqlerrm='Unapproved tradesperson created a quote' then raise; end if;
  end;
end$$;

-- Move the fixture provider through the real administrator state machine.
reset role;
insert into public.user_roles(user_id,role)
select customer_id,'admin' from phase65_context on conflict do nothing;
select set_config('request.jwt.claim.sub',(select customer_id::text from phase65_context),true);
set local role authenticated;
update public.tradesperson_profiles set application_status='under_review' where user_id=(select tradesperson_id from phase65_context);
update public.tradesperson_profiles set application_status='approved',reviewed_at=now(),reviewed_by=(select customer_id from phase65_context)
where user_id=(select tradesperson_id from phase65_context);

reset role;
insert into public.quotes(
  id,request_id,tradesperson_id,status,labor_amount_kurus,material_amount_kurus,
  estimated_duration_minutes,version,warranty_days,included_scope,accepted_at,accepted_by
)
select quote_id,request_id,tradesperson_id,'accepted',10000,1000,60,1,30,array['Montaj'],now(),customer_id
from phase65_context;
insert into public.jobs(id,request_id,accepted_quote_id,customer_id,tradesperson_id,status)
select job_id,request_id,quote_id,customer_id,tradesperson_id,'in_progress' from phase65_context;

-- A real customer proposal remains pending until the provider approves it.
select set_config('request.jwt.claim.sub',(select customer_id::text from phase65_context),true);
set local role authenticated;
update phase65_context set scope_change_id=(
  select id from public.propose_scope_change(
    (select job_id from phase65_context),'Duvar içi kablo kanalı kapsamı eklensin.',2500,0,20,array['Kablo kanalı'],array[]::text[]
  )
);
do $$begin
  if not exists(select 1 from public.scope_changes where id=(select scope_change_id from phase65_context) and status='pending' and customer_approved_at is not null and tradesperson_approved_at is null) then
    raise exception 'Customer scope proposal did not remain pending for provider approval';
  end if;
end$$;

reset role;
select set_config('request.jwt.claim.sub',(select tradesperson_id::text from phase65_context),true);
set local role authenticated;
select public.respond_scope_change((select scope_change_id from phase65_context),true);
update phase65_context set scope_event_id=(
  select id from public.job_events
  where job_id=(select job_id from phase65_context) and event_type='scope_change_approved'
  order by sequence desc limit 1
);
do $$begin
  if not exists(select 1 from public.scope_changes where id=(select scope_change_id from phase65_context) and status='approved' and customer_approved_at is not null and tradesperson_approved_at is not null) then
    raise exception 'Two-party scope approval did not complete';
  end if;
end$$;

-- Worker failure advances retry state without reverting the accepted scope change.
reset role;
set local role service_role;
update phase65_context set notification_id=(
  select claimed.id
  from public.claim_notification_batch('phase65-worker',100) claimed
  where claimed.event_id=(select scope_event_id from phase65_context)
  order by claimed.id limit 1
);
with result as (
  select * from public.mark_notification_result((select notification_id from phase65_context),false,'phase65 simulated delivery failure')
)
update phase65_context set
  notification_status=result.status,
  notification_attempts=result.attempts,
  notification_error=result.last_error,
  notification_next_attempt_at=result.next_attempt_at
from result;
do $$begin
  if not exists(select 1 from phase65_context where notification_id is not null and notification_status='retrying' and notification_attempts=1 and notification_error='phase65 simulated delivery failure' and notification_next_attempt_at>now()) then
    raise exception 'Notification retry state was not persisted';
  end if;
end$$;
reset role;
do $$begin
  if not exists(select 1 from public.scope_changes where id=(select scope_change_id from phase65_context) and status='approved') then
    raise exception 'Notification failure reverted the domain operation';
  end if;
end$$;

-- Trust metrics must remain private at four approved reviews and appear at five.
create temporary table phase65_metric_fixture(
  ordinal integer primary key,
  request_id uuid not null default gen_random_uuid(),
  quote_id uuid not null default gen_random_uuid(),
  job_id uuid not null default gen_random_uuid()
) on commit drop;
insert into phase65_metric_fixture(ordinal) select generate_series(1,5);
insert into public.service_requests(id,customer_id,service_id,delivery_model,status,answers,district,neighborhood,preferred_timing,idempotency_key,submitted_at)
select fixture.request_id,context.customer_id,'avize-montaji','quote','provider_selected',jsonb_build_object('metric',fixture.ordinal),'Etimesgut','Eryaman','Bu hafta',gen_random_uuid(),now()
from phase65_metric_fixture fixture cross join phase65_context context;
insert into public.quotes(id,request_id,tradesperson_id,status,labor_amount_kurus,material_amount_kurus,estimated_duration_minutes,version,warranty_days,included_scope,accepted_at,accepted_by)
select fixture.quote_id,fixture.request_id,context.tradesperson_id,'accepted',10000,0,60,1,30,array['Metrik kapsamı'],now(),context.customer_id
from phase65_metric_fixture fixture cross join phase65_context context;
insert into public.jobs(id,request_id,accepted_quote_id,customer_id,tradesperson_id,status)
select fixture.job_id,fixture.request_id,fixture.quote_id,context.customer_id,context.tradesperson_id,'completed'
from phase65_metric_fixture fixture cross join phase65_context context;
insert into public.reviews(job_id,customer_id,tradesperson_id,rating,comment,moderation_status)
select fixture.job_id,context.customer_id,context.tradesperson_id,5,'Faz 6.5 doğrulanmış iş değerlendirmesi.','approved'
from phase65_metric_fixture fixture cross join phase65_context context where fixture.ordinal<=4;
do $$begin
  if exists(select 1 from public.district_trust_metrics where district='Etimesgut' and tradesperson_id=(select tradesperson_id from phase65_context)) then
    raise exception 'Trust metric leaked below the five-review threshold';
  end if;
end$$;
insert into public.reviews(job_id,customer_id,tradesperson_id,rating,comment,moderation_status)
select fixture.job_id,context.customer_id,context.tradesperson_id,4,'Beşinci doğrulanmış iş değerlendirmesi.','approved'
from phase65_metric_fixture fixture cross join phase65_context context where fixture.ordinal=5;
do $$begin
  if not exists(select 1 from public.district_trust_metrics where district='Etimesgut' and tradesperson_id=(select tradesperson_id from phase65_context) and completed_jobs=5 and average_rating=4.80) then
    raise exception 'Trust metric was not published correctly at five reviews';
  end if;
end$$;

reset role;
rollback;
select 'Phase 6.5 RLS, eligibility, scope, retry, and trust checks passed' as result;
