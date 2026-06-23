create table if not exists public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  full_name text,
  email text,
  role text not null default 'pending',
  is_active boolean not null default true,
  constraint admin_profiles_role_check
    check (role in ('pending', 'admin'))
);

alter table public.admin_profiles
  add column if not exists email text;

create index if not exists admin_profiles_role_idx
  on public.admin_profiles(role);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_admin(check_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_profiles profile
    where profile.user_id = check_user_id
      and profile.role = 'admin'
      and profile.is_active = true
  );
$$;

create or replace function public.handle_new_admin_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.admin_profiles (user_id, full_name, email, role, is_active)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email,
    'pending',
    true
  )
  on conflict (user_id) do update
  set
    email = excluded.email,
    full_name = coalesce(public.admin_profiles.full_name, excluded.full_name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_create_admin_profile
on auth.users;

create trigger on_auth_user_created_create_admin_profile
after insert on auth.users
for each row execute function public.handle_new_admin_user();

drop trigger if exists set_admin_profiles_updated_at
on public.admin_profiles;

create trigger set_admin_profiles_updated_at
before update on public.admin_profiles
for each row execute function public.set_updated_at();

insert into public.admin_profiles (user_id, full_name, email, role, is_active)
select
  users.id,
  coalesce(users.raw_user_meta_data ->> 'full_name', split_part(users.email, '@', 1)),
  users.email,
  'pending',
  true
from auth.users as users
on conflict (user_id) do update
set
  email = excluded.email,
  full_name = coalesce(public.admin_profiles.full_name, excluded.full_name);

alter table public.admin_profiles enable row level security;

grant select, update, delete on public.admin_profiles to authenticated;
grant execute on function public.is_admin(uuid) to anon, authenticated;

drop policy if exists "Users can view own admin profile"
on public.admin_profiles;

create policy "Users can view own admin profile"
on public.admin_profiles
for select
to authenticated
using (user_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "Admins can manage admin profiles"
on public.admin_profiles;

create policy "Admins can manage admin profiles"
on public.admin_profiles
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- Ilk veya yeni admini onaylamak icin email adresini degistirip calistirin:
-- update public.admin_profiles
-- set role = 'admin', is_active = true
-- where user_id = (
--   select id from auth.users where email = 'admin@example.com'
-- );
