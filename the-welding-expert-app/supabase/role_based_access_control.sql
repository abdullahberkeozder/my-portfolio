-- Multi-user team roles and owner-controlled account lifecycle.
-- Run this migration once in the Supabase SQL Editor for the welding project.

alter table public.admin_profiles
  add column if not exists status text,
  add column if not exists approved_by uuid,
  add column if not exists approved_at timestamptz,
  add column if not exists last_login_at timestamptz;

update public.admin_profiles
set status = case
  when role = 'pending' then 'pending'
  when is_active = false then 'suspended'
  else 'active'
end
where status is null;

alter table public.admin_profiles
  drop constraint if exists admin_profiles_role_check,
  drop constraint if exists admin_profiles_status_check;

update public.admin_profiles
set role = 'operator'
where role = 'pending';

alter table public.admin_profiles
  alter column role set default 'operator',
  alter column status set default 'pending',
  alter column status set not null;

alter table public.admin_profiles
  add constraint admin_profiles_role_check
    check (role in ('owner', 'admin', 'operator', 'technician')),
  add constraint admin_profiles_status_check
    check (status in ('pending', 'active', 'suspended', 'rejected'));

alter table public.admin_profiles
  drop constraint if exists admin_profiles_approved_by_fkey;

alter table public.admin_profiles
  add constraint admin_profiles_approved_by_fkey
    foreign key (approved_by) references public.admin_profiles(user_id)
    on delete set null;

-- Keep this compatibility column synchronized until every older client is gone.
update public.admin_profiles
set is_active = (status = 'active');

create or replace function public.sync_admin_profile_status()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.is_active = (new.status = 'active');
  return new;
end;
$$;

drop trigger if exists sync_admin_profile_status
on public.admin_profiles;

create trigger sync_admin_profile_status
before insert or update of status on public.admin_profiles
for each row execute function public.sync_admin_profile_status();

alter table public.appointment_requests
  add column if not exists assigned_to uuid
    references public.admin_profiles(user_id) on delete set null;

create index if not exists admin_profiles_status_idx
  on public.admin_profiles(status);

create index if not exists appointment_requests_assigned_to_idx
  on public.appointment_requests(assigned_to);

create or replace function public.has_admin_role(allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_profiles profile
    where profile.user_id = auth.uid()
      and profile.status = 'active'
      and profile.role = any(allowed_roles)
  );
$$;

-- Compatibility helper used by older policies and clients.
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
      and profile.status = 'active'
      and profile.role in ('owner', 'admin', 'operator')
  );
$$;

create or replace function public.handle_new_admin_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.admin_profiles (
    user_id,
    full_name,
    email,
    role,
    status,
    is_active
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email,
    'operator',
    'pending',
    false
  )
  on conflict (user_id) do update
  set
    email = excluded.email,
    full_name = coalesce(public.admin_profiles.full_name, excluded.full_name);

  return new;
end;
$$;

-- Replace this placeholder before running the bootstrap in a new environment.
update public.admin_profiles
set
  role = 'owner',
  status = 'active',
  approved_at = coalesce(approved_at, now())
where lower(email) = lower('owner@example.com');

create or replace function public.manage_team_member(
  p_user_id uuid,
  p_role text,
  p_status text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_target_role text;
  v_target_status text;
  v_active_owner_count integer;
begin
  if not public.has_admin_role(array['owner']) then
    raise exception 'owner_access_required' using errcode = 'P0001';
  end if;

  if p_role not in ('owner', 'admin', 'operator', 'technician')
    or p_status not in ('pending', 'active', 'suspended', 'rejected')
  then
    raise exception 'invalid_team_member_role_or_status' using errcode = 'P0001';
  end if;

  select role, status
  into v_target_role, v_target_status
  from public.admin_profiles
  where user_id = p_user_id
  for update;

  if not found then
    raise exception 'team_member_not_found' using errcode = 'P0001';
  end if;

  if p_user_id = auth.uid()
    and (p_role <> 'owner' or p_status <> 'active')
  then
    raise exception 'owner_cannot_remove_own_access' using errcode = 'P0001';
  end if;

  if v_target_role = 'owner'
    and v_target_status = 'active'
    and (p_role <> 'owner' or p_status <> 'active')
  then
    select count(*)
    into v_active_owner_count
    from public.admin_profiles
    where role = 'owner'
      and status = 'active';

    if v_active_owner_count <= 1 then
      raise exception 'last_active_owner_required' using errcode = 'P0001';
    end if;
  end if;

  update public.admin_profiles
  set
    role = p_role,
    status = p_status,
    approved_by = case
      when p_status = 'active' and v_target_status <> 'active' then auth.uid()
      else approved_by
    end,
    approved_at = case
      when p_status = 'active' and v_target_status <> 'active' then now()
      else approved_at
    end
  where user_id = p_user_id;
end;
$$;

alter table public.admin_profiles enable row level security;

revoke update, delete on public.admin_profiles from authenticated;
grant select on public.admin_profiles to authenticated;

revoke all on function public.manage_team_member(uuid, text, text) from public;
grant execute on function public.manage_team_member(uuid, text, text)
  to authenticated;
revoke all on function public.has_admin_role(text[]) from public;
grant execute on function public.has_admin_role(text[]) to authenticated;

drop policy if exists "Users can view own admin profile"
on public.admin_profiles;
drop policy if exists "Admins can manage admin profiles"
on public.admin_profiles;
drop policy if exists "Owners can view team profiles"
on public.admin_profiles;

create policy "Users can view own admin profile"
on public.admin_profiles
for select
to authenticated
using (
  user_id = auth.uid()
  or public.has_admin_role(array['owner'])
);

drop policy if exists "Admins can manage availability days"
on public.appointment_availability_days;
drop policy if exists "Operations can manage availability days"
on public.appointment_availability_days;

create policy "Operations can manage availability days"
on public.appointment_availability_days
for all
to authenticated
using (public.has_admin_role(array['owner', 'admin', 'operator']))
with check (public.has_admin_role(array['owner', 'admin', 'operator']));

drop policy if exists "Admins can manage availability slots"
on public.appointment_availability_slots;
drop policy if exists "Operations can manage availability slots"
on public.appointment_availability_slots;

create policy "Operations can manage availability slots"
on public.appointment_availability_slots
for all
to authenticated
using (public.has_admin_role(array['owner', 'admin', 'operator']))
with check (public.has_admin_role(array['owner', 'admin', 'operator']));

drop policy if exists "Admins can read appointment requests"
on public.appointment_requests;
drop policy if exists "Admins can update appointment requests"
on public.appointment_requests;
drop policy if exists "Admins can delete appointment requests"
on public.appointment_requests;
drop policy if exists "Team can read permitted appointment requests"
on public.appointment_requests;
drop policy if exists "Operations can update appointment requests"
on public.appointment_requests;
drop policy if exists "Managers can delete appointment requests"
on public.appointment_requests;

create policy "Team can read permitted appointment requests"
on public.appointment_requests
for select
to authenticated
using (
  public.has_admin_role(array['owner', 'admin', 'operator'])
  or (
    public.has_admin_role(array['technician'])
    and assigned_to = auth.uid()
  )
);

create policy "Operations can update appointment requests"
on public.appointment_requests
for update
to authenticated
using (public.has_admin_role(array['owner', 'admin', 'operator']))
with check (public.has_admin_role(array['owner', 'admin', 'operator']));

create policy "Managers can delete appointment requests"
on public.appointment_requests
for delete
to authenticated
using (public.has_admin_role(array['owner', 'admin']));

notify pgrst, 'reload schema';

-- Verification query:
-- select user_id, full_name, email, role, status, approved_at
-- from public.admin_profiles
-- order by created_at;
