-- P2/P3 hardening: keep customer and tradesperson mutations behind validated,
-- transactional RPCs. Tables remain readable through RLS but are not writable
-- by browser Data API calls.

create or replace function private.request_service_model(p_service_id text)
returns text
language sql immutable security invoker set search_path = ''
as $$
  select case p_service_id
    when 'mobilya-kurulumu' then 'package' when 'tv-duvar-montaji' then 'package'
    when 'kornis-perde-montaji' then 'package' when 'raf-tablo-montaji' then 'package'
    when 'avize-montaji' then 'package' when 'elektrik-arizasi' then 'inspection'
    when 'priz-anahtar' then 'package' when 'sigorta-pano' then 'inspection'
    when 'elektrik-hatti' then 'quote' when 'su-kacagi' then 'inspection'
    when 'musluk-degisimi' then 'package' when 'gider-acma' then 'package'
    when 'klozet-rezervuar' then 'quote' when 'tesisat-onarim' then 'quote'
    when 'tek-oda-boya' then 'quote' when 'duvar-alci' then 'quote'
    when 'fayans-onarimi' then 'quote' when 'silikon-yenileme' then 'package'
    when 'bahce-kapisi' then 'inspection' when 'korkuluk' then 'inspection'
    when 'metal-kapi-mentese' then 'quote' when 'ozel-demir-imalati' then 'inspection'
    when 'ev-temizligi' then 'package' when 'detayli-temizlik' then 'quote'
    when 'tadilat-sonrasi-temizlik' then 'quote' when 'cam-temizligi' then 'package'
    else null
  end
$$;

create or replace function private.request_answers_valid(p_service_id text, p_answers jsonb, p_complete boolean)
returns boolean
language plpgsql immutable security invoker set search_path = ''
as $$
declare
  expected_keys text[] := array['scope','timing'];
  allowed boolean;
begin
  if jsonb_typeof(p_answers) <> 'object' then return false; end if;

  case p_service_id
    when 'tv-duvar-montaji' then
      expected_keys := array['tv-size','wall-type','bracket'];
      allowed := coalesce(p_answers->>'tv-size' = any(array['32–49 inç','50–64 inç','65–75 inç','75 inç üzeri']),true)
        and coalesce(p_answers->>'wall-type' = any(array['Beton / tuğla','Alçıpan','Taş / mermer','Bilmiyorum']),true)
        and coalesce(p_answers->>'bracket' = any(array['Evet, hazır','Usta getirsin','Hangisinin uygun olduğunu bilmiyorum']),true);
    when 'elektrik-arizasi' then
      expected_keys := array['symptom','started','power'];
      allowed := coalesce(p_answers->>'symptom' = any(array['Evin tamamında elektrik yok','Belirli odada elektrik yok','Sigorta sürekli atıyor','Yanık kokusu / kıvılcım var']),true)
        and coalesce(p_answers->>'started' = any(array['Şimdi / bugün','Son birkaç gün içinde','Bir süredir devam ediyor','Bilmiyorum']),true)
        and coalesce(p_answers->>'power' = any(array['Evet','Hayır','Nasıl kapatacağımı bilmiyorum']),true);
    when 'su-kacagi' then
      expected_keys := array['sign','active','valve'];
      allowed := coalesce(p_answers->>'sign' = any(array['Duvar / tavan ıslak','Zeminde su birikiyor','Sayaç dönmeye devam ediyor','Alt kata su sızıyor']),true)
        and coalesce(p_answers->>'active' = any(array['Evet, aktif akıyor','Nem / damlama var','Hayır, ara sıra oluyor','Bilmiyorum']),true)
        and coalesce(p_answers->>'valve' = any(array['Evet','Hayır','Yerini bilmiyorum']),true);
    when 'tek-oda-boya' then
      expected_keys := array['room-size','surface','paint'];
      allowed := coalesce(p_answers->>'room-size' = any(array['10 m² altı','10–20 m²','20–30 m²','30 m² üzeri']),true)
        and coalesce(p_answers->>'surface' = any(array['Hayır, yüzey düzgün','Küçük delik / çatlak var','Nem / kabarma var','Bilmiyorum']),true)
        and coalesce(p_answers->>'paint' = any(array['Ben sağlayacağım','Usta getirsin','Tekliflerde iki seçenek de olsun']),true);
    when 'bahce-kapisi' then
      expected_keys := array['problem','material','access'];
      allowed := coalesce(p_answers->>'problem' = any(array['Menteşe kırık / kopuk','Kapı sarktı, kapanmıyor','Kilit bölgesi hasarlı','Metal bölüm kırık / çürük']),true)
        and coalesce(p_answers->>'material' = any(array['Demir / çelik','Alüminyum','Karışık malzeme','Bilmiyorum']),true)
        and coalesce(p_answers->>'access' = any(array['Bahçeden kolay erişim','Apartman / site izni gerekli','Trafik veya park engeli olabilir']),true);
    when 'ev-temizligi' then
      expected_keys := array['home-size','frequency','supplies'];
      allowed := coalesce(p_answers->>'home-size' = any(array['1+0 / 1+1','2+1','3+1','4+1 veya daha büyük']),true)
        and coalesce(p_answers->>'frequency' = any(array['Tek seferlik','Haftalık','İki haftada bir','Aylık']),true)
        and coalesce(p_answers->>'supplies' = any(array['Evet, evde var','Hizmet veren getirsin','Birlikte belirleyelim']),true);
    else
      allowed := coalesce(p_answers->>'scope' = any(array['Yeni kurulum','Onarım / değişim','Kontrol ve değerlendirme','Bilmiyorum']),true)
        and coalesce(p_answers->>'timing' = any(array['Mümkün olan en kısa sürede','Bu hafta','Önümüzdeki iki hafta','Tarih konusunda esneğim']),true);
  end case;

  if exists (select 1 from jsonb_object_keys(p_answers) key where not (key = any(expected_keys))) then return false; end if;
  if not allowed then return false; end if;
  return not p_complete or (select bool_and(p_answers ? key) from unnest(expected_keys) key);
end;
$$;

create or replace function private.upsert_request_draft(
  p_idempotency_key uuid, p_service_id text, p_delivery_model text, p_answers jsonb,
  p_district text default null, p_neighborhood text default null, p_preferred_timing text default null
)
returns public.service_requests
language plpgsql security definer set search_path = ''
as $$
declare actor uuid := (select auth.uid()); request_row public.service_requests%rowtype;
begin
  if actor is null then raise exception 'Authentication required'; end if;
  if private.request_service_model(p_service_id) is distinct from p_delivery_model
    or not private.request_answers_valid(p_service_id,p_answers,false) then
    raise exception 'Draft fields are invalid';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(actor::text||p_idempotency_key::text,0));
  select * into request_row from public.service_requests
    where customer_id=actor and idempotency_key=p_idempotency_key for update;
  if found then
    if request_row.service_id<>p_service_id or request_row.delivery_model<>p_delivery_model then
      raise exception 'Idempotency key belongs to another request';
    end if;
    if request_row.status<>'draft' then return request_row; end if;
    update public.service_requests set answers=p_answers,district=nullif(trim(p_district),''),
      neighborhood=nullif(trim(p_neighborhood),''),preferred_timing=nullif(trim(p_preferred_timing),'')
      where id=request_row.id returning * into request_row;
    return request_row;
  end if;
  insert into public.service_requests(customer_id,service_id,delivery_model,status,answers,district,neighborhood,preferred_timing,idempotency_key)
  values(actor,p_service_id,p_delivery_model,'draft',p_answers,nullif(trim(p_district),''),nullif(trim(p_neighborhood),''),nullif(trim(p_preferred_timing),''),p_idempotency_key)
  returning * into request_row;
  return request_row;
end;
$$;

create or replace function private.submit_request(p_request_id uuid, p_idempotency_key uuid)
returns public.service_requests
language plpgsql security definer set search_path = ''
as $$
declare actor uuid := (select auth.uid()); request_row public.service_requests%rowtype;
begin
  if actor is null then raise exception 'Authentication required'; end if;
  select * into request_row from public.service_requests where id=p_request_id and customer_id=actor for update;
  if not found then raise exception 'Request not found'; end if;
  if request_row.idempotency_key<>p_idempotency_key then raise exception 'Idempotency key mismatch'; end if;
  if request_row.status in ('submitted','matching','quotes_received','provider_selected') then return request_row; end if;
  if request_row.status<>'draft' then raise exception 'Request cannot be submitted'; end if;
  if private.request_service_model(request_row.service_id) is distinct from request_row.delivery_model
    or not private.request_answers_valid(request_row.service_id,request_row.answers,true)
    or nullif(trim(request_row.district),'') is null
    or nullif(trim(request_row.neighborhood),'') is null
    or nullif(trim(request_row.preferred_timing),'') is null then
    raise exception 'Request is incomplete';
  end if;
  update public.service_requests set status='submitted',submitted_at=now()
    where id=request_row.id returning * into request_row;
  return request_row;
end;
$$;

create or replace function public.submit_request(p_request_id uuid,p_idempotency_key uuid)
returns public.service_requests language sql security invoker set search_path=''
as $$ select private.submit_request(p_request_id,p_idempotency_key) $$;

revoke execute on function public.submit_request(uuid,uuid) from public,anon;
grant execute on function public.submit_request(uuid,uuid) to authenticated;
revoke all on function private.submit_request(uuid,uuid) from public,anon;
grant execute on function private.submit_request(uuid,uuid) to authenticated;

drop policy if exists "customers create own requests" on public.service_requests;
drop policy if exists "customers update own draft requests" on public.service_requests;
revoke insert,update,delete on public.service_requests from authenticated;
grant select on public.service_requests to authenticated;

create or replace function private.submit_tradesperson_application(
  p_display_name text,p_bio text,p_service_ids text[],p_districts text[],p_reference jsonb,p_document jsonb
)
returns public.tradesperson_profiles
language plpgsql security definer set search_path=''
as $$
declare actor uuid := (select auth.uid()); profile_row public.tradesperson_profiles%rowtype; path text := p_document->>'storagePath';
begin
  if actor is null then raise exception 'Authentication required'; end if;
  if length(trim(p_display_name)) not between 2 and 120 or length(trim(p_bio)) not between 20 and 2000 then raise exception 'Profile is invalid'; end if;
  if cardinality(p_service_ids) not between 1 and 12 or cardinality(p_service_ids)<>(select count(distinct x) from unnest(p_service_ids)x)
    or exists(select 1 from unnest(p_service_ids)x where private.request_service_model(x) is null) then raise exception 'Services are invalid'; end if;
  if cardinality(p_districts) not between 1 and 9 or cardinality(p_districts)<>(select count(distinct x) from unnest(p_districts)x)
    or not p_districts <@ array['Çankaya','Keçiören','Yenimahalle','Etimesgut','Mamak','Sincan','Altındağ','Gölbaşı','Pursaklar']::text[] then raise exception 'Districts are invalid'; end if;
  if p_document->>'kind' not in ('professional_certificate','identity','address','reference_evidence')
    or p_document->>'contentType' not in ('application/pdf','image/jpeg','image/png','image/webp')
    or (p_document->>'byteSize')::bigint not between 1 and 20971520
    or path not like actor::text||'/%' then raise exception 'Document is invalid'; end if;
  if not exists(select 1 from storage.objects where bucket_id='tradesperson-verification' and name=path and owner_id=actor::text) then raise exception 'Uploaded document not found'; end if;

  select * into profile_row from public.tradesperson_profiles where user_id=actor for update;
  if found and profile_row.application_status not in ('draft','needs_changes','rejected') then raise exception 'Application cannot be edited'; end if;
  insert into public.tradesperson_profiles(user_id,display_name,bio,application_status)
  values(actor,trim(p_display_name),trim(p_bio),'draft')
  on conflict(user_id) do update set display_name=excluded.display_name,bio=excluded.bio,updated_at=now();
  delete from public.tradesperson_services where tradesperson_id=actor;
  insert into public.tradesperson_services(tradesperson_id,service_id) select actor,x from unnest(p_service_ids)x;
  delete from public.tradesperson_service_areas where tradesperson_id=actor;
  insert into public.tradesperson_service_areas(tradesperson_id,district) select actor,x from unnest(p_districts)x;
  delete from public.tradesperson_references where tradesperson_id=actor and status='pending';
  if p_reference is not null then
    insert into public.tradesperson_references(tradesperson_id,reference_name,relationship,phone,note)
    values(actor,trim(p_reference->>'name'),trim(p_reference->>'relationship'),nullif(trim(p_reference->>'phone'),''),nullif(trim(p_reference->>'note'),''));
  end if;
  insert into public.tradesperson_documents(tradesperson_id,kind,storage_path,original_name,content_type,byte_size,expires_at)
  values(actor,p_document->>'kind',path,p_document->>'originalName',p_document->>'contentType',(p_document->>'byteSize')::bigint,nullif(p_document->>'expiresAt','')::date);
  update public.tradesperson_profiles set application_status='submitted',submitted_at=now(),updated_at=now()
    where user_id=actor returning * into profile_row;
  return profile_row;
end;
$$;

create or replace function public.submit_tradesperson_application(
  p_display_name text,p_bio text,p_service_ids text[],p_districts text[],p_reference jsonb,p_document jsonb
)
returns public.tradesperson_profiles language sql security invoker set search_path=''
as $$ select private.submit_tradesperson_application(p_display_name,p_bio,p_service_ids,p_districts,p_reference,p_document) $$;

revoke execute on function public.submit_tradesperson_application(text,text,text[],text[],jsonb,jsonb) from public,anon;
grant execute on function public.submit_tradesperson_application(text,text,text[],text[],jsonb,jsonb) to authenticated;
revoke all on function private.submit_tradesperson_application(text,text,text[],text[],jsonb,jsonb) from public,anon;
grant execute on function private.submit_tradesperson_application(text,text,text[],text[],jsonb,jsonb) to authenticated;

drop policy if exists "users or admins update tradesperson profiles" on public.tradesperson_profiles;
create policy "admins update tradesperson profiles" on public.tradesperson_profiles for update to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));
drop policy if exists "users manage own services" on public.tradesperson_services;
drop policy if exists "users manage own service areas" on public.tradesperson_service_areas;
drop policy if exists "users upload own pending documents" on public.tradesperson_documents;
drop policy if exists "users create own pending references" on public.tradesperson_references;
revoke insert,delete on public.tradesperson_profiles from authenticated;
revoke insert,update,delete on public.tradesperson_services,public.tradesperson_service_areas from authenticated;
revoke insert,delete on public.tradesperson_documents,public.tradesperson_references from authenticated;

drop policy if exists "tradespeople delete own pending verification files" on storage.objects;
create policy "tradespeople delete own unsubmitted verification files" on storage.objects for delete to authenticated
using (bucket_id='tradesperson-verification' and (storage.foldername(name))[1]=(select auth.uid())::text
  and not exists(select 1 from public.tradesperson_documents d where d.storage_path=name));
