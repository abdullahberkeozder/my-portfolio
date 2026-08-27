delete from public.jobs where request_id in (
  select id from public.service_requests where answers->>'fixture'='phase65-concurrency'
);
delete from public.service_requests where answers->>'fixture'='phase65-concurrency';
delete from public.tradesperson_profiles where display_name='Faz 6.5 Concurrency Ustası';
drop table if exists private.phase65_concurrency_context;

create table private.phase65_concurrency_context (
  customer_id uuid not null,
  tradesperson_id uuid not null,
  draft_id uuid not null default gen_random_uuid(),
  draft_idempotency_key uuid not null default gen_random_uuid(),
  quote_request_id uuid not null default gen_random_uuid(),
  run_id uuid not null default gen_random_uuid(),
  quote_id uuid not null default gen_random_uuid()
);
revoke all on private.phase65_concurrency_context from public,anon,authenticated,service_role;

insert into private.phase65_concurrency_context(customer_id,tradesperson_id)
select customer.id,tradesperson.id
from lateral(select id from auth.users order by created_at,id limit 1) customer
cross join lateral(
  select id from auth.users
  where id<>customer.id
    and not exists(select 1 from public.tradesperson_profiles profile where profile.user_id=auth.users.id)
  order by created_at,id limit 1
) tradesperson;

do $$begin
  if not exists(select 1 from private.phase65_concurrency_context) then
    raise exception 'Two distinct Auth users are required for Phase 6.5 concurrency tests';
  end if;
end$$;

insert into public.tradesperson_profiles(user_id,display_name,bio,application_status,submitted_at,reviewed_at)
select tradesperson_id,'Faz 6.5 Concurrency Ustası','Eşzamanlı kabul testi için geçici doğrulanmış profil.','approved',now(),now()
from private.phase65_concurrency_context;
insert into public.tradesperson_documents(tradesperson_id,kind,status,storage_path,original_name,content_type,byte_size,verified_at,verified_by)
select tradesperson_id,'professional_certificate','verified',tradesperson_id||'/phase65-concurrency.pdf',
  'phase65-concurrency.pdf','application/pdf',256,now(),customer_id
from private.phase65_concurrency_context;
insert into public.service_requests(id,customer_id,service_id,delivery_model,status,answers,district,neighborhood,preferred_timing,idempotency_key,submitted_at)
select quote_request_id,customer_id,'avize-montaji','quote','quotes_received','{"fixture":"phase65-concurrency"}',
  'Çankaya','Kızılay','Bu hafta',gen_random_uuid(),now()
from private.phase65_concurrency_context;
insert into public.matching_runs(id,request_id,supply_state,eligible_count,recommended_action)
select run_id,quote_request_id,'limited_supply',1,'phase65 concurrency fixture'
from private.phase65_concurrency_context;
insert into public.request_matches(run_id,request_id,tradesperson_id,score,score_components,reasons)
select run_id,quote_request_id,tradesperson_id,95,'{"fixture":95}'::jsonb,'["Concurrency fixture"]'::jsonb
from private.phase65_concurrency_context;
insert into public.quotes(id,request_id,tradesperson_id,status,labor_amount_kurus,material_amount_kurus,estimated_duration_minutes,version,warranty_days,included_scope)
select quote_id,quote_request_id,tradesperson_id,'submitted',10000,1000,60,1,30,array['Concurrency fixture']
from private.phase65_concurrency_context;

select 'Phase 6.5 concurrency fixture prepared' as result;
