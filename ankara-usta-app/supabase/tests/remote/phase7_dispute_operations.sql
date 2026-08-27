begin;
create temporary table phase7_context(
  customer_id uuid not null,tradesperson_id uuid not null,request_id uuid default gen_random_uuid(),
  quote_id uuid default gen_random_uuid(),job_id uuid default gen_random_uuid(),dispute_id uuid
) on commit drop;
grant select,update on phase7_context to authenticated;
insert into phase7_context(customer_id,tradesperson_id)
select customer.id,tradesperson.id from lateral(select id from auth.users order by created_at,id limit 1) customer
cross join lateral(select id from auth.users where id<>customer.id and not exists(select 1 from public.tradesperson_profiles profile where profile.user_id=auth.users.id) order by created_at,id limit 1) tradesperson;
do $$begin if not exists(select 1 from phase7_context) then raise exception 'Two Auth users are required for Phase 7';end if;end$$;

insert into public.tradesperson_profiles(user_id,display_name,bio,application_status,submitted_at,reviewed_at)
select tradesperson_id,'Faz 7 Test Ustası','Uyuşmazlık operasyonu entegrasyon testi profili.','approved',now(),now() from phase7_context;
insert into public.service_requests(id,customer_id,service_id,delivery_model,status,answers,district,neighborhood,preferred_timing,idempotency_key,submitted_at)
select request_id,customer_id,'avize-montaji','quote','provider_selected','{"fixture":"phase7"}','Çankaya','Kızılay','Bu hafta',gen_random_uuid(),now() from phase7_context;
insert into public.quotes(id,request_id,tradesperson_id,status,labor_amount_kurus,material_amount_kurus,estimated_duration_minutes,version,warranty_days,included_scope,accepted_at,accepted_by)
select quote_id,request_id,tradesperson_id,'accepted',10000,1000,60,1,30,array['Faz 7 kapsamı'],now(),customer_id from phase7_context;
insert into public.jobs(id,request_id,accepted_quote_id,customer_id,tradesperson_id,status)
select job_id,request_id,quote_id,customer_id,tradesperson_id,'completed' from phase7_context;

select set_config('request.jwt.claim.role','authenticated',true);
select set_config('request.jwt.claim.sub',(select customer_id::text from phase7_context),true);
set local role authenticated;
update phase7_context set dispute_id=(select id from public.open_job_dispute((select job_id from phase7_context),'quality','Tamamlanan işte kabul edilen kapsamla uyuşmayan hasar bulundu.'));
insert into public.dispute_evidence(dispute_id,submitted_by,kind,description,storage_path,content_type,byte_size)
select dispute_id,customer_id,'photo','Müşterinin iş sonrası hasar fotoğrafı',dispute_id||'/'||customer_id||'/customer.webp','image/webp',128 from phase7_context;

reset role;
select set_config('request.jwt.claim.sub',(select tradesperson_id::text from phase7_context),true);
set local role authenticated;
do $$begin if not exists(select 1 from public.dispute_evidence where dispute_id=(select dispute_id from phase7_context)) then raise exception 'Counterparty cannot read dispute evidence';end if;end$$;
insert into public.dispute_evidence(dispute_id,submitted_by,kind,description,storage_path,content_type,byte_size)
select dispute_id,tradesperson_id,'invoice','Ustanın kullanılan malzeme faturası',dispute_id||'/'||tradesperson_id||'/provider.pdf','application/pdf',256 from phase7_context;
select public.add_dispute_statement((select dispute_id from phase7_context),'Uygulama sırasında kullanılan malzeme ve yapılan işlem sırası açıklanmıştır.');

reset role;
insert into public.user_roles(user_id,role) select customer_id,'admin' from phase7_context on conflict do nothing;
select set_config('request.jwt.claim.sub',(select customer_id::text from phase7_context),true);
set local role authenticated;
select public.admin_transition_dispute((select dispute_id from phase7_context),'triage','Dosya kapsamı ve katılımcılar doğrulandı.',null,null,null);
do $$begin
  begin perform public.admin_transition_dispute((select dispute_id from phase7_context),'awaiting_evidence','Geçersiz geçmiş teslim süresi deneniyor.',now()-interval '1 hour',null,null);raise exception 'Past evidence deadline accepted';
  exception when others then if sqlerrm='Past evidence deadline accepted' then raise;end if;end;
end$$;
select public.admin_transition_dispute((select dispute_id from phase7_context),'awaiting_evidence','Her iki taraftan tamamlayıcı kanıt istendi.',now()+interval '48 hours',null,null);
select public.admin_transition_dispute((select dispute_id from phase7_context),'investigation','Teslim edilen kanıtlar incelemeye alındı.',null,null,null);
select public.admin_transition_dispute((select dispute_id from phase7_context),'resolution_proposed','Kapsam ve hasar kayıtları karşılaştırıldı.',null,'Hasarlı bölümün yeniden yapılması önerildi.','Belirtilen bölüm için ücretsiz düzeltme yapmanız önerildi.');
select public.admin_transition_dispute((select dispute_id from phase7_context),'notified','Çözüm önerisi iki tarafa ayrı metinlerle bildirildi.',null,'Hasarlı bölümün ücretsiz düzeltileceği tarafınıza bildirildi.','Ücretsiz düzeltme randevusu oluşturmanız gerektiği bildirildi.');
select public.add_dispute_internal_note((select dispute_id from phase7_context),'Telefon görüşmesi özeti ve operasyon değerlendirmesi.');
select public.apply_tradesperson_sanction((select dispute_id from phase7_context),'temporary_suspension','Düzeltme tamamlanana kadar geçici askı uygulandı.',now()+interval '7 days');
do $$begin
  if not exists(select 1 from public.admin_audit_log where entity_type='dispute' and entity_id=(select dispute_id::text from phase7_context) and actor_id=(select customer_id from phase7_context)) then raise exception 'Dispute transition audit is missing';end if;
  if not exists(select 1 from public.tradesperson_profiles where user_id=(select tradesperson_id from phase7_context) and application_status='suspended') then raise exception 'Suspension did not affect provider eligibility';end if;
end$$;

reset role;
select set_config('request.jwt.claim.sub',(select tradesperson_id::text from phase7_context),true);
set local role authenticated;
do $$begin
  if exists(select 1 from public.dispute_internal_notes where dispute_id=(select dispute_id from phase7_context)) then raise exception 'Internal note leaked to provider';end if;
  if not exists(select 1 from public.get_dispute_decisions((select dispute_id from phase7_context)) where tradesperson_explanation is not null and customer_explanation is null) then raise exception 'Provider-specific decision projection is incorrect';end if;
  begin perform 1 from public.dispute_decisions where dispute_id=(select dispute_id from phase7_context);raise exception 'Provider read raw party explanations';
  exception when insufficient_privilege then null;when others then if sqlerrm='Provider read raw party explanations' then raise;end if;end;
end$$;
select public.submit_dispute_appeal((select dispute_id from phase7_context),'Kararda değerlendirilen fotoğraf iş tesliminden sonraki başka bir müdahaleyi göstermektedir.');
do $$begin if not exists(select 1 from public.dispute_cases where id=(select dispute_id from phase7_context) and status='appealed') then raise exception 'Appeal did not reopen the workflow';end if;end$$;

reset role;
select set_config('request.jwt.claim.sub',(select customer_id::text from phase7_context),true);
set local role authenticated;
select public.admin_transition_dispute((select dispute_id from phase7_context),'closed','İtiraz ve ek kanıtlar incelenerek nihai karar verildi.',null,'Düzeltme kararı ek kanıtlarla birlikte kesinleştirildi.','İtiraz incelendi; düzeltme yükümlülüğü kesinleştirildi.');
do $$begin
  begin update public.dispute_decisions set customer_explanation='Değiştirilemez karar' where dispute_id=(select dispute_id from phase7_context);raise exception 'Decision history was mutable';
  exception when others then if sqlerrm='Decision history was mutable' then raise;end if;end;
  if not exists(select 1 from public.dispute_cases where id=(select dispute_id from phase7_context) and status='closed' and closed_at is not null) then raise exception 'Dispute did not close';end if;
end$$;
reset role;
rollback;
select 'Phase 7 dispute operations, RLS, SLA, sanction, appeal, and immutable audit checks passed' result;
