alter table public.tradesperson_references
  add column review_note text;

alter table public.admin_audit_log
  alter column actor_id drop not null,
  add column actor_type text not null default 'user'
    check (actor_type in ('user', 'system')),
  add constraint admin_audit_log_actor_consistency
    check (
      (actor_type = 'user' and actor_id is not null)
      or (actor_type = 'system' and actor_id is null)
    );

create or replace function private.assign_tradesperson_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_roles (user_id, role)
  values (new.user_id, 'tradesperson')
  on conflict (user_id, role) do nothing;
  return new;
end;
$$;

revoke execute on function private.assign_tradesperson_role()
from public, anon, authenticated, service_role;

create trigger tradesperson_profile_assign_role
after insert on public.tradesperson_profiles
for each row execute function private.assign_tradesperson_role();

insert into public.user_roles (user_id, role)
select user_id, 'tradesperson'
from public.tradesperson_profiles
on conflict (user_id, role) do nothing;

create or replace function private.validate_tradesperson_application_transition()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  allowed boolean;
  expiry_job boolean := current_setting('app.tradesperson_expiry_job', true) = 'on';
begin
  if new.user_id <> old.user_id then
    raise exception 'Tradesperson identity cannot be changed';
  end if;
  if new.application_status = old.application_status then
    return new;
  end if;

  if expiry_job then
    if (old.application_status, new.application_status) <> ('approved', 'reassessment_required') then
      raise exception 'Expiry job attempted an invalid application transition';
    end if;
  elsif not private.is_admin() then
    if (old.application_status, new.application_status) not in (
      ('draft', 'submitted'),
      ('needs_changes', 'submitted'),
      ('rejected', 'submitted')
    ) then
      raise exception 'Only an administrator can perform this application transition';
    end if;
  end if;

  allowed := (old.application_status, new.application_status) in (
    ('draft', 'submitted'),
    ('submitted', 'under_review'),
    ('under_review', 'needs_changes'),
    ('under_review', 'approved'),
    ('under_review', 'rejected'),
    ('needs_changes', 'submitted'),
    ('needs_changes', 'rejected'),
    ('approved', 'reassessment_required'),
    ('approved', 'suspended'),
    ('rejected', 'submitted'),
    ('reassessment_required', 'under_review'),
    ('reassessment_required', 'suspended'),
    ('suspended', 'under_review')
  );
  if not allowed then
    raise exception 'Invalid tradesperson application transition: % -> %', old.application_status, new.application_status;
  end if;
  return new;
end;
$$;

create or replace function private.process_tradesperson_document_expiry()
returns table (expired_document_count integer, reassessment_profile_count integer)
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform set_config('app.tradesperson_expiry_job', 'on', true);

  with expired as (
    update public.tradesperson_documents
    set status = 'expired',
        verified_at = null,
        verified_by = null,
        review_note = 'Belgenin son kullanma tarihi geçti.',
        updated_at = now()
    where status = 'verified'
      and expires_at < current_date
    returning id, tradesperson_id, kind, expires_at
  ), audited as (
    insert into public.admin_audit_log (
      actor_id, actor_type, action, entity_type, entity_id, after_data
    )
    select null,
           'system',
           'DOCUMENT_EXPIRED',
           'tradesperson_documents',
           id::text,
           jsonb_build_object(
             'tradesperson_id', tradesperson_id,
             'kind', kind,
             'expires_at', expires_at,
             'status', 'expired'
           )
    from expired
    returning 1
  )
  select count(*)::integer into expired_document_count from audited;

  with reassessed as (
    update public.tradesperson_profiles profile
    set application_status = 'reassessment_required',
        review_note = 'Geçerli mesleki belge bulunmadığı için yeniden değerlendirme gerekiyor.',
        reviewed_at = now(),
        reviewed_by = null,
        updated_at = now()
    where profile.application_status = 'approved'
      and not exists (
        select 1
        from public.tradesperson_documents document
        where document.tradesperson_id = profile.user_id
          and document.kind = 'professional_certificate'
          and document.status = 'verified'
          and (document.expires_at is null or document.expires_at >= current_date)
      )
    returning profile.user_id
  ), audited as (
    insert into public.admin_audit_log (
      actor_id, actor_type, action, entity_type, entity_id, after_data
    )
    select null,
           'system',
           'APPLICATION_REASSESSMENT_REQUIRED',
           'tradesperson_profiles',
           user_id::text,
           jsonb_build_object('application_status', 'reassessment_required')
    from reassessed
    returning 1
  )
  select count(*)::integer into reassessment_profile_count from audited;

  return next;
end;
$$;

revoke execute on function private.process_tradesperson_document_expiry()
from public, anon, authenticated, service_role;

create extension if not exists pg_cron with schema pg_catalog;

select cron.schedule(
  'tradesperson-document-expiry',
  '15 0 * * *',
  $job$select private.process_tradesperson_document_expiry();$job$
);
