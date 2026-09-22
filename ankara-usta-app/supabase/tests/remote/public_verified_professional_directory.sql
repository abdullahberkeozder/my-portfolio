-- Transactional fixture for the public professional trust boundary.
-- Requires the isolated orkestra-e2e personas and rolls every mutation back.
begin;

create temporary table public_directory_context (
  current_professional_id uuid not null,
  expired_professional_id uuid not null
) on commit drop;

grant select on public_directory_context to anon;

insert into public_directory_context(current_professional_id,expired_professional_id)
select current_user.id,expired_user.id
from auth.users current_user
cross join auth.users expired_user
where current_user.email='u3-tradesperson@orkestra.example'
  and expired_user.email='u3-second-tradesperson@orkestra.example';

do $$
begin
  if not exists(select 1 from public_directory_context) then
    raise exception 'Two professional Auth fixtures are required';
  end if;
  if to_regprocedure('public.list_public_verified_professionals(text,text,integer,integer)') is null then
    raise exception 'Public verified professional directory RPC is missing';
  end if;
  if not has_function_privilege('anon','public.list_public_verified_professionals(text,text,integer,integer)','EXECUTE') then
    raise exception 'Anonymous directory access is missing';
  end if;
end
$$;

update public.tradesperson_profiles
set application_status='approved'
where user_id in (
  select current_professional_id from public_directory_context
  union all
  select expired_professional_id from public_directory_context
);

delete from public.tradesperson_documents
where kind='professional_certificate'
  and tradesperson_id in (
    select current_professional_id from public_directory_context
    union all
    select expired_professional_id from public_directory_context
  );

insert into public.tradesperson_documents(
  tradesperson_id,kind,status,storage_path,original_name,content_type,byte_size,
  verified_at,verified_by,expires_at
)
select current_professional_id,'professional_certificate','verified',
  current_professional_id||'/directory-current.pdf','directory-current.pdf',
  'application/pdf',128,now(),current_professional_id,current_date+interval '30 days'
from public_directory_context
union all
select expired_professional_id,'professional_certificate','verified',
  expired_professional_id||'/directory-expired.pdf','directory-expired.pdf',
  'application/pdf',128,now(),expired_professional_id,current_date-interval '1 day'
from public_directory_context;

insert into public.tradesperson_services(tradesperson_id,service_id)
select current_professional_id,'musluk-degisimi' from public_directory_context
union all
select expired_professional_id,'musluk-degisimi' from public_directory_context
on conflict do nothing;

insert into public.tradesperson_service_areas(tradesperson_id,district,neighborhood)
select current_professional_id,'Çankaya','Kızılay' from public_directory_context
union all
select expired_professional_id,'Çankaya','Kızılay' from public_directory_context
on conflict do nothing;

set local role anon;

do $$
begin
  if (
    select count(*)
    from public.list_public_verified_professionals('musluk-degisimi','Çankaya',0,50) directory
    where directory.user_id=(select current_professional_id from public_directory_context)
  )<>1 then
    raise exception 'Current verified professional is missing from the public directory';
  end if;

  if exists (
    select 1
    from public.list_public_verified_professionals('musluk-degisimi','Çankaya',0,50) directory
    where directory.user_id=(select expired_professional_id from public_directory_context)
  ) then
    raise exception 'Expired professional leaked into the public directory';
  end if;
end
$$;

reset role;
delete from public.tradesperson_documents
where kind='professional_certificate'
  and tradesperson_id=(select current_professional_id from public_directory_context);
set local role anon;

do $$
begin
  if exists (
    select 1
    from public.list_public_verified_professionals('musluk-degisimi','Çankaya',0,50) directory
    where directory.user_id=(select current_professional_id from public_directory_context)
  ) then
    raise exception 'Professional without current evidence leaked into the public directory';
  end if;
end
$$;

reset role;
rollback;

select 'public verified professional directory checks passed' as result;
