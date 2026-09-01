begin;

create temporary table rls_test_context (
  customer_id uuid not null,
  tradesperson_id uuid not null,
  request_id uuid not null default gen_random_uuid(),
  run_id uuid not null default gen_random_uuid(),
  quote_id uuid not null default gen_random_uuid(),
  job_id uuid not null default gen_random_uuid()
) on commit drop;

grant select on rls_test_context to authenticated;

insert into rls_test_context (customer_id,tradesperson_id)
select customer.id,tradesperson.id
from lateral (
  select id from auth.users order by created_at,id limit 1
) customer
cross join lateral (
  select id from auth.users
  where id<>customer.id
    and not exists (select 1 from public.tradesperson_profiles profile where profile.user_id=auth.users.id)
  order by created_at,id limit 1
) tradesperson;

do $$
begin
  if not exists (select 1 from rls_test_context) then
    raise exception 'Two distinct Auth users are required for the remote RLS integration test';
  end if;
end
$$;

insert into public.tradesperson_profiles(user_id,display_name,bio,application_status,submitted_at,reviewed_at)
select tradesperson_id,'RLS Test Ustası','Geçici uzak RLS entegrasyon testi profili.','approved',now(),now()
from rls_test_context;

insert into public.tradesperson_documents(
  tradesperson_id,kind,status,storage_path,original_name,content_type,byte_size,
  verified_at,verified_by
)
select tradesperson_id,'professional_certificate','verified',
  tradesperson_id||'/rls-test-certificate.pdf','rls-test-certificate.pdf',
  'application/pdf',128,now(),tradesperson_id
from rls_test_context;

select set_config('request.jwt.claim.sub',(select customer_id::text from rls_test_context),true);
select set_config('request.jwt.claim.role','authenticated',true);
set local role authenticated;

insert into public.service_requests(
  id,customer_id,service_id,delivery_model,status,answers,district,neighborhood,
  preferred_timing,idempotency_key,submitted_at
)
select request_id,customer_id,'avize-montaji','quote','draft',
  '{"fixture":"two-user-rls"}'::jsonb,'Çankaya','Kızılay','Bu hafta',gen_random_uuid(),now()
from rls_test_context;

update public.service_requests
set status='submitted'
where id=(select request_id from rls_test_context);

do $$
begin
  if (select count(*) from public.service_requests where id=(select request_id from rls_test_context))<>1 then
    raise exception 'Customer cannot read their own request';
  end if;
end
$$;

reset role;
select set_config('request.jwt.claim.sub',(select tradesperson_id::text from rls_test_context),true);
set local role authenticated;

do $$
begin
  if (select count(*) from public.service_requests where id=(select request_id from rls_test_context))<>0 then
    raise exception 'Unmatched tradesperson can read another customer request';
  end if;
end
$$;

reset role;
insert into public.matching_runs(id,request_id,supply_state,eligible_count,recommended_action)
select run_id,request_id,'limited_supply',1,'RLS integration fixture' from rls_test_context;
insert into public.request_matches(run_id,request_id,tradesperson_id,score,score_components,reasons)
select run_id,request_id,tradesperson_id,90,'{"fixture":90}'::jsonb,'["RLS fixture"]'::jsonb
from rls_test_context;

select set_config('request.jwt.claim.sub',(select tradesperson_id::text from rls_test_context),true);
set local role authenticated;
do $$
begin
  if (select count(*) from public.service_requests where id=(select request_id from rls_test_context))<>1 then
    raise exception 'Matched tradesperson cannot read request scope';
  end if;
end
$$;

reset role;
insert into public.quotes(
  id,request_id,tradesperson_id,status,labor_amount_kurus,material_amount_kurus,
  estimated_duration_minutes,version,warranty_days,included_scope
)
select quote_id,request_id,tradesperson_id,'submitted',10000,2000,60,1,30,array['RLS fixture']
from rls_test_context;
insert into public.jobs(id,request_id,accepted_quote_id,customer_id,tradesperson_id,status)
select job_id,request_id,quote_id,customer_id,tradesperson_id,'scheduled'
from rls_test_context;

select set_config('request.jwt.claim.sub',(select customer_id::text from rls_test_context),true);
set local role authenticated;
select public.send_job_message(
  (select job_id from rls_test_context),'Müşteri mesajı',gen_random_uuid()
);

reset role;
select set_config('request.jwt.claim.sub',(select tradesperson_id::text from rls_test_context),true);
set local role authenticated;
select public.send_job_message(
  (select job_id from rls_test_context),'Usta mesajı',gen_random_uuid()
);

do $$
declare
  sequences bigint[];
begin
  select array_agg(event.sequence order by event.sequence) into sequences
  from public.job_messages message
  join public.job_events event on event.id=message.event_id
  where message.job_id=(select job_id from rls_test_context);
  if sequences<>array[1,2]::bigint[] then
    raise exception 'Message event sequence is not deterministic: %',sequences;
  end if;
end
$$;

reset role;
rollback;

select 'two-user RLS and ordered messaging checks passed' as result;
