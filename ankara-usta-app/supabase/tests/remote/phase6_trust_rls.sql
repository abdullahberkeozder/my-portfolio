begin;

create temporary table phase6_context(customer_id uuid,tradesperson_id uuid,request_id uuid default gen_random_uuid(),quote_id uuid default gen_random_uuid(),job_id uuid default gen_random_uuid(),review_id uuid,media_id uuid) on commit drop;
grant select,update on phase6_context to authenticated;
grant select on phase6_context to anon;
insert into phase6_context(customer_id,tradesperson_id)
select c.id,t.id from lateral(select id from auth.users order by created_at,id limit 1)c
cross join lateral(select id from auth.users where id<>c.id and not exists(select 1 from public.tradesperson_profiles p where p.user_id=auth.users.id) order by created_at,id limit 1)t;
do $$begin if not exists(select 1 from phase6_context) then raise exception 'Two Auth users are required';end if;end$$;

insert into public.tradesperson_profiles(user_id,display_name,bio,application_status,submitted_at,reviewed_at)
select tradesperson_id,'Faz 6 Test Ustası','Güven ve moderasyon uzak entegrasyon profili.','approved',now(),now() from phase6_context;
insert into public.service_requests(id,customer_id,service_id,delivery_model,status,answers,district,neighborhood,preferred_timing,idempotency_key,submitted_at)
select request_id,customer_id,'avize-montaji','quote','provider_selected','{"fixture":"phase6"}','Çankaya','Kızılay','Bu hafta',gen_random_uuid(),now() from phase6_context;
insert into public.quotes(id,request_id,tradesperson_id,status,labor_amount_kurus,material_amount_kurus,estimated_duration_minutes,version,warranty_days,included_scope,accepted_at,accepted_by)
select quote_id,request_id,tradesperson_id,'accepted',10000,2000,60,1,30,array['Faz 6 kapsamı'],now(),customer_id from phase6_context;
insert into public.jobs(id,request_id,accepted_quote_id,customer_id,tradesperson_id,status)
select job_id,request_id,quote_id,customer_id,tradesperson_id,'awaiting_customer_approval' from phase6_context;

select set_config('request.jwt.claim.sub',(select tradesperson_id::text from phase6_context),true);
select set_config('request.jwt.claim.role','authenticated',true);
set local role authenticated;
do $$begin
  begin perform public.create_job_review((select job_id from phase6_context),5,'Bu değerlendirme reddedilmelidir.');raise exception 'Tradesperson created a review';
  exception when others then if sqlerrm='Tradesperson created a review' then raise;end if;end;
end$$;

reset role;
select set_config('request.jwt.claim.sub',(select customer_id::text from phase6_context),true);
set local role authenticated;
select public.transition_job((select job_id from phase6_context),'completed');
update phase6_context set review_id=(select id from public.create_job_review((select job_id from phase6_context),5,'İş kabul edilen kapsamla eksiksiz tamamlandı.'));
insert into public.work_log_entries(job_id,author_id,kind,caption,storage_path,customer_publication_consent)
select job_id,customer_id,'after','Tamamlanan iş',job_id||'/after.webp',true from phase6_context;

reset role;
update phase6_context set media_id=(select id from public.work_log_entries where job_id=(select job_id from phase6_context));
set local role anon;
do $$begin
  if exists(select 1 from public.reviews where id=(select review_id from phase6_context)) then raise exception 'Pending review leaked publicly';end if;
  if exists(select 1 from public.work_log_entries where id=(select media_id from phase6_context)) then raise exception 'Pending media leaked publicly';end if;
end$$;

reset role;
insert into public.user_roles(user_id,role) select customer_id,'admin' from phase6_context on conflict do nothing;
select set_config('request.jwt.claim.sub',(select customer_id::text from phase6_context),true);
set local role authenticated;
select public.moderate_entity('review',(select review_id from phase6_context),'approve','Tamamlanan platform işiyle bağlantısı doğrulandı.');
select public.moderate_entity('work_log_entry',(select media_id from phase6_context),'approve','Müşteri yayın izni ve içerik uygunluğu doğrulandı.');
do $$begin
  if not exists(select 1 from public.moderation_decisions where entity_id=(select review_id from phase6_context) and actor_id=(select customer_id from phase6_context) and length(reason)>=10) then raise exception 'Moderation audit fields missing';end if;
  begin update public.moderation_decisions set reason='Değiştirilemez' where entity_id=(select review_id from phase6_context);raise exception 'Moderation decision was mutable';
  exception when others then if sqlerrm='Moderation decision was mutable' then raise;end if;end;
end$$;

reset role;
set local role anon;
do $$begin
  if not exists(select 1 from public.reviews where id=(select review_id from phase6_context)) then raise exception 'Approved review is not public';end if;
  if not exists(select 1 from public.work_log_entries where id=(select media_id from phase6_context)) then raise exception 'Consented approved media is not public';end if;
end$$;

reset role;
do $$begin
  if not exists(select 1 from public.workmanship_certificates where job_id=(select job_id from phase6_context)) then raise exception 'Completion did not issue certificate';end if;
end$$;
rollback;
select 'phase 6 trust and moderation checks passed' result;
