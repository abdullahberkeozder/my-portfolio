create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('customer', 'tradesperson', 'moderator', 'admin')),
  granted_at timestamptz not null default now(),
  granted_by uuid references auth.users(id),
  primary key (user_id, role)
);
create index user_roles_role_user_idx on public.user_roles (role, user_id);

create table public.tradesperson_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (length(trim(display_name)) between 2 and 120),
  bio text not null check (length(trim(bio)) between 20 and 2000),
  city text not null default 'Ankara' check (city = 'Ankara'),
  application_status text not null default 'draft' check (application_status in ('draft','submitted','under_review','needs_changes','approved','rejected','reassessment_required','suspended')),
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id),
  review_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index tradesperson_profiles_review_queue_idx on public.tradesperson_profiles (application_status, submitted_at)
where application_status in ('submitted','under_review','reassessment_required');

create table public.tradesperson_services (
  tradesperson_id uuid not null references public.tradesperson_profiles(user_id) on delete cascade,
  service_id text not null check (service_id ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  created_at timestamptz not null default now(),
  primary key (tradesperson_id, service_id)
);

create table public.tradesperson_service_areas (
  id uuid primary key default gen_random_uuid(),
  tradesperson_id uuid not null references public.tradesperson_profiles(user_id) on delete cascade,
  district text not null check (length(trim(district)) between 2 and 80),
  neighborhood text,
  created_at timestamptz not null default now(),
  unique (tradesperson_id, district, neighborhood)
);
create index tradesperson_service_areas_lookup_idx on public.tradesperson_service_areas (district, neighborhood, tradesperson_id);

create table public.tradesperson_documents (
  id uuid primary key default gen_random_uuid(),
  tradesperson_id uuid not null references public.tradesperson_profiles(user_id) on delete cascade,
  kind text not null check (kind in ('professional_certificate','identity','address','reference_evidence')),
  status text not null default 'pending' check (status in ('pending','verified','rejected','expired')),
  storage_path text not null unique,
  original_name text not null,
  content_type text not null check (content_type in ('application/pdf','image/jpeg','image/png','image/webp')),
  byte_size bigint not null check (byte_size > 0 and byte_size <= 20971520),
  expires_at date,
  verified_at timestamptz,
  verified_by uuid references auth.users(id),
  review_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status = 'verified') = (verified_at is not null and verified_by is not null))
);
create index tradesperson_documents_owner_idx on public.tradesperson_documents (tradesperson_id, status);
create index tradesperson_documents_expiry_idx on public.tradesperson_documents (expires_at, tradesperson_id)
where status = 'verified' and expires_at is not null;

create table public.tradesperson_references (
  id uuid primary key default gen_random_uuid(),
  tradesperson_id uuid not null references public.tradesperson_profiles(user_id) on delete cascade,
  reference_name text not null check (length(trim(reference_name)) between 2 and 120),
  relationship text not null check (length(trim(relationship)) between 2 and 120),
  phone text,
  note text,
  status text not null default 'pending' check (status in ('pending','verified','rejected')),
  verified_at timestamptz,
  verified_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index tradesperson_references_owner_idx on public.tradesperson_references (tradesperson_id, status);

create table public.admin_audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid not null references auth.users(id),
  action text not null,
  entity_type text not null,
  entity_id text not null,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);
create index admin_audit_log_actor_created_idx on public.admin_audit_log (actor_id, created_at desc);
create index admin_audit_log_entity_created_idx on public.admin_audit_log (entity_type, entity_id, created_at desc);

create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.service_requests(id) on delete cascade,
  tradesperson_id uuid not null references public.tradesperson_profiles(user_id) on delete cascade,
  status text not null default 'submitted' check (status in ('draft','submitted','accepted','rejected','withdrawn','expired')),
  labor_amount_kurus bigint not null check (labor_amount_kurus >= 0),
  material_amount_kurus bigint not null check (material_amount_kurus >= 0),
  estimated_duration_minutes integer not null check (estimated_duration_minutes > 0),
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (request_id, tradesperson_id, version)
);
create index quotes_tradesperson_created_idx on public.quotes (tradesperson_id, created_at desc);
create index quotes_request_created_idx on public.quotes (request_id, created_at desc);

create or replace function private.is_admin()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = (select auth.uid()) and role in ('admin','moderator')
  );
$$;
revoke execute on function private.is_admin() from public, anon, authenticated;

create or replace function private.is_quote_eligible()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1
    from public.tradesperson_profiles profile
    where profile.user_id = (select auth.uid())
      and profile.application_status = 'approved'
      and exists (
        select 1 from public.tradesperson_documents document
        where document.tradesperson_id = profile.user_id
          and document.kind = 'professional_certificate'
          and document.status = 'verified'
          and (document.expires_at is null or document.expires_at >= current_date)
      )
  );
$$;
revoke execute on function private.is_quote_eligible() from public, anon, authenticated;

create or replace function public.has_current_professional_verification(provider_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.tradesperson_documents
    where tradesperson_id = provider_id
      and kind = 'professional_certificate'
      and status = 'verified'
      and (expires_at is null or expires_at >= current_date)
  );
$$;
revoke execute on function public.has_current_professional_verification(uuid) from public;
grant execute on function public.has_current_professional_verification(uuid) to anon, authenticated;

create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.user_profiles (user_id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)))
  on conflict (user_id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'customer') on conflict do nothing;
  return new;
end;
$$;
revoke execute on function private.handle_new_user() from public, anon, authenticated;

create trigger auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

insert into public.user_profiles (user_id, display_name)
select id, coalesce(raw_user_meta_data ->> 'display_name', split_part(email, '@', 1)) from auth.users
on conflict (user_id) do nothing;
insert into public.user_roles (user_id, role)
select id, 'customer' from auth.users on conflict do nothing;

create or replace function private.validate_tradesperson_application_transition()
returns trigger language plpgsql set search_path = ''
as $$
declare
  allowed boolean;
begin
  if new.user_id <> old.user_id then raise exception 'Tradesperson identity cannot be changed'; end if;
  if new.application_status = old.application_status then return new; end if;
  if not private.is_admin() then
    if (old.application_status, new.application_status) not in (('draft','submitted'),('needs_changes','submitted'),('rejected','submitted')) then
      raise exception 'Only an administrator can perform this application transition';
    end if;
  end if;
  allowed := (old.application_status, new.application_status) in (
    ('draft','submitted'),('submitted','under_review'),('under_review','needs_changes'),
    ('under_review','approved'),('under_review','rejected'),('needs_changes','submitted'),
    ('needs_changes','rejected'),('approved','reassessment_required'),('approved','suspended'),
    ('rejected','submitted'),('reassessment_required','under_review'),
    ('reassessment_required','suspended'),('suspended','under_review')
  );
  if not allowed then raise exception 'Invalid tradesperson application transition: % -> %', old.application_status, new.application_status; end if;
  return new;
end;
$$;
create trigger tradesperson_application_transition
before update on public.tradesperson_profiles
for each row execute function private.validate_tradesperson_application_transition();

create or replace function private.audit_admin_change()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare entity_key text;
begin
  if not private.is_admin() then return coalesce(new, old); end if;
  entity_key := coalesce(to_jsonb(new) ->> 'id', to_jsonb(new) ->> 'user_id', to_jsonb(old) ->> 'id', to_jsonb(old) ->> 'user_id');
  insert into public.admin_audit_log (actor_id, action, entity_type, entity_id, before_data, after_data)
  values ((select auth.uid()), tg_op, tg_table_name, entity_key, case when tg_op <> 'INSERT' then to_jsonb(old) end, case when tg_op <> 'DELETE' then to_jsonb(new) end);
  return coalesce(new, old);
end;
$$;
revoke execute on function private.audit_admin_change() from public, anon, authenticated;

create trigger audit_tradesperson_profile after update on public.tradesperson_profiles for each row execute function private.audit_admin_change();
create trigger audit_tradesperson_document after update on public.tradesperson_documents for each row execute function private.audit_admin_change();
create trigger audit_tradesperson_reference after update on public.tradesperson_references for each row execute function private.audit_admin_change();

create view public.tradesperson_directory with (security_invoker = true) as
select user_id, display_name, bio, city,
  public.has_current_professional_verification(user_id) as verification_badge
from public.tradesperson_profiles
where application_status = 'approved';

alter table public.user_profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.tradesperson_profiles enable row level security;
alter table public.tradesperson_services enable row level security;
alter table public.tradesperson_service_areas enable row level security;
alter table public.tradesperson_documents enable row level security;
alter table public.tradesperson_references enable row level security;
alter table public.admin_audit_log enable row level security;
alter table public.quotes enable row level security;

create policy "users read own profile" on public.user_profiles for select to authenticated using ((select auth.uid()) = user_id or (select private.is_admin()));
create policy "users update own profile" on public.user_profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users read own roles" on public.user_roles for select to authenticated using ((select auth.uid()) = user_id or (select private.is_admin()));

create policy "approved profiles are public" on public.tradesperson_profiles for select to anon using (application_status = 'approved');
create policy "users and admins read tradesperson profiles" on public.tradesperson_profiles for select to authenticated using ((select auth.uid()) = user_id or application_status = 'approved' or (select private.is_admin()));
create policy "users create own draft tradesperson profile" on public.tradesperson_profiles for insert to authenticated with check ((select auth.uid()) = user_id and application_status = 'draft');
create policy "users or admins update tradesperson profiles" on public.tradesperson_profiles for update to authenticated using ((select auth.uid()) = user_id or (select private.is_admin())) with check ((select auth.uid()) = user_id or (select private.is_admin()));

create policy "services visible with profile" on public.tradesperson_services for select to anon using (exists (select 1 from public.tradesperson_profiles profile where profile.user_id = tradesperson_id and profile.application_status = 'approved'));
create policy "users and admins read tradesperson services" on public.tradesperson_services for select to authenticated using ((select auth.uid()) = tradesperson_id or (select private.is_admin()) or exists (select 1 from public.tradesperson_profiles profile where profile.user_id = tradesperson_id and profile.application_status = 'approved'));
create policy "users manage own services" on public.tradesperson_services for all to authenticated
using ((select auth.uid()) = tradesperson_id and exists (select 1 from public.tradesperson_profiles profile where profile.user_id = tradesperson_id and profile.application_status in ('draft','needs_changes','rejected')))
with check ((select auth.uid()) = tradesperson_id and exists (select 1 from public.tradesperson_profiles profile where profile.user_id = tradesperson_id and profile.application_status in ('draft','needs_changes','rejected')));

create policy "areas visible with profile" on public.tradesperson_service_areas for select to anon using (exists (select 1 from public.tradesperson_profiles profile where profile.user_id = tradesperson_id and profile.application_status = 'approved'));
create policy "users and admins read service areas" on public.tradesperson_service_areas for select to authenticated using ((select auth.uid()) = tradesperson_id or (select private.is_admin()) or exists (select 1 from public.tradesperson_profiles profile where profile.user_id = tradesperson_id and profile.application_status = 'approved'));
create policy "users manage own service areas" on public.tradesperson_service_areas for all to authenticated
using ((select auth.uid()) = tradesperson_id and exists (select 1 from public.tradesperson_profiles profile where profile.user_id = tradesperson_id and profile.application_status in ('draft','needs_changes','rejected')))
with check ((select auth.uid()) = tradesperson_id and exists (select 1 from public.tradesperson_profiles profile where profile.user_id = tradesperson_id and profile.application_status in ('draft','needs_changes','rejected')));

create policy "users and admins read documents" on public.tradesperson_documents for select to authenticated using ((select auth.uid()) = tradesperson_id or (select private.is_admin()));
create policy "users upload own pending documents" on public.tradesperson_documents for insert to authenticated with check ((select auth.uid()) = tradesperson_id and status = 'pending');
create policy "admins review documents" on public.tradesperson_documents for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "users and admins read references" on public.tradesperson_references for select to authenticated using ((select auth.uid()) = tradesperson_id or (select private.is_admin()));
create policy "users create own pending references" on public.tradesperson_references for insert to authenticated with check ((select auth.uid()) = tradesperson_id and status = 'pending');
create policy "admins review references" on public.tradesperson_references for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "admins read audit log" on public.admin_audit_log for select to authenticated using ((select private.is_admin()));
create policy "eligible tradespeople create quotes" on public.quotes for insert to authenticated with check ((select auth.uid()) = tradesperson_id and (select private.is_quote_eligible()));
create policy "tradespeople read own quotes" on public.quotes for select to authenticated using ((select auth.uid()) = tradesperson_id);

grant select, update on public.user_profiles to authenticated;
grant select on public.user_roles to authenticated;
grant select on public.tradesperson_profiles, public.tradesperson_services, public.tradesperson_service_areas, public.tradesperson_directory to anon;
grant select, insert, update on public.tradesperson_profiles to authenticated;
grant select, insert, update, delete on public.tradesperson_services, public.tradesperson_service_areas to authenticated;
grant select, insert, update on public.tradesperson_documents, public.tradesperson_references to authenticated;
grant select on public.admin_audit_log to authenticated;
grant select, insert on public.quotes to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('tradesperson-verification','tradesperson-verification',false,20971520,array['application/pdf','image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

create policy "tradespeople upload own verification files" on storage.objects for insert to authenticated
with check (bucket_id = 'tradesperson-verification' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "tradespeople and admins read verification files" on storage.objects for select to authenticated
using (bucket_id = 'tradesperson-verification' and ((storage.foldername(name))[1] = (select auth.uid())::text or (select private.is_admin())));
create policy "tradespeople delete own pending verification files" on storage.objects for delete to authenticated
using (bucket_id = 'tradesperson-verification' and (storage.foldername(name))[1] = (select auth.uid())::text and exists (select 1 from public.tradesperson_documents document where document.storage_path = name and document.tradesperson_id = (select auth.uid()) and document.status = 'pending'));
