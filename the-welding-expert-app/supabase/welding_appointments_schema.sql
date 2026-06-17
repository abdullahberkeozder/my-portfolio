create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.appointment_availability_days (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  work_date date not null unique,
  status text not null default 'available',
  note text,
  is_visible boolean not null default true,
  constraint appointment_availability_days_status_check
    check (status in ('available', 'limited', 'closed'))
);

create table if not exists public.appointment_availability_slots (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  day_id uuid not null references public.appointment_availability_days(id)
    on delete cascade,
  slot_time time not null,
  is_available boolean not null default true,
  note text,
  constraint appointment_availability_slots_unique_time
    unique (day_id, slot_time)
);

create table if not exists public.appointment_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  service_type text not null,
  requested_date date not null,
  requested_time time not null,
  channel text not null default 'system',
  status text not null default 'new',
  message text,
  notes text,
  constraint appointment_requests_channel_check
    check (channel in ('system', 'whatsapp', 'email')),
  constraint appointment_requests_status_check
    check (status in ('new', 'contacted', 'confirmed', 'cancelled', 'completed'))
);

create table if not exists public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  full_name text,
  role text not null default 'pending',
  is_active boolean not null default true,
  constraint admin_profiles_role_check
    check (role in ('pending', 'admin'))
);

create index if not exists appointment_availability_days_work_date_idx
  on public.appointment_availability_days(work_date);

create index if not exists appointment_availability_slots_day_id_idx
  on public.appointment_availability_slots(day_id);

create index if not exists appointment_requests_created_at_idx
  on public.appointment_requests(created_at desc);

create index if not exists appointment_requests_requested_date_idx
  on public.appointment_requests(requested_date);

create index if not exists admin_profiles_role_idx
  on public.admin_profiles(role);

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
  insert into public.admin_profiles (user_id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    'pending'
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_create_admin_profile
on auth.users;

create trigger on_auth_user_created_create_admin_profile
after insert on auth.users
for each row execute function public.handle_new_admin_user();

drop trigger if exists set_appointment_availability_days_updated_at
on public.appointment_availability_days;

create trigger set_appointment_availability_days_updated_at
before update on public.appointment_availability_days
for each row execute function public.set_updated_at();

drop trigger if exists set_appointment_availability_slots_updated_at
on public.appointment_availability_slots;

create trigger set_appointment_availability_slots_updated_at
before update on public.appointment_availability_slots
for each row execute function public.set_updated_at();

drop trigger if exists set_appointment_requests_updated_at
on public.appointment_requests;

create trigger set_appointment_requests_updated_at
before update on public.appointment_requests
for each row execute function public.set_updated_at();

drop trigger if exists set_admin_profiles_updated_at
on public.admin_profiles;

create trigger set_admin_profiles_updated_at
before update on public.admin_profiles
for each row execute function public.set_updated_at();

alter table public.appointment_availability_days enable row level security;
alter table public.appointment_availability_slots enable row level security;
alter table public.appointment_requests enable row level security;
alter table public.admin_profiles enable row level security;

grant select on public.appointment_availability_days to anon, authenticated;
grant select on public.appointment_availability_slots to anon, authenticated;
grant insert on public.appointment_requests to anon, authenticated;
grant select, update, delete on public.appointment_requests to authenticated;
grant insert, update, delete on public.appointment_availability_days to authenticated;
grant insert, update, delete on public.appointment_availability_slots to authenticated;
grant select, update, delete on public.admin_profiles to authenticated;
grant execute on function public.is_admin(uuid) to anon, authenticated;

drop policy if exists "Customers can view visible availability days"
on public.appointment_availability_days;

create policy "Customers can view visible availability days"
on public.appointment_availability_days
for select
to anon, authenticated
using (is_visible = true);

drop policy if exists "Admins can manage availability days"
on public.appointment_availability_days;

create policy "Admins can manage availability days"
on public.appointment_availability_days
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "Customers can view visible availability slots"
on public.appointment_availability_slots;

create policy "Customers can view visible availability slots"
on public.appointment_availability_slots
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.appointment_availability_days d
    where d.id = appointment_availability_slots.day_id
      and d.is_visible = true
  )
);

drop policy if exists "Admins can manage availability slots"
on public.appointment_availability_slots;

create policy "Admins can manage availability slots"
on public.appointment_availability_slots
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "Customers can create appointment requests"
on public.appointment_requests;

create policy "Customers can create appointment requests"
on public.appointment_requests
for insert
to anon, authenticated
with check (
  status = 'new'
  and channel in ('system', 'whatsapp', 'email')
  and length(trim(customer_name)) > 1
  and length(trim(customer_phone)) > 5
);

drop policy if exists "Admins can read appointment requests"
on public.appointment_requests;

create policy "Admins can read appointment requests"
on public.appointment_requests
for select
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists "Admins can update appointment requests"
on public.appointment_requests;

create policy "Admins can update appointment requests"
on public.appointment_requests
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "Admins can delete appointment requests"
on public.appointment_requests;

create policy "Admins can delete appointment requests"
on public.appointment_requests
for delete
to authenticated
using (public.is_admin(auth.uid()));

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

insert into public.appointment_availability_days (work_date, status, note)
select
  day_value::date,
  'available',
  'Ortalama is suresi 2 saat kabul edilir. 09:00 - 21:00 arasi randevu alinabilir.'
from generate_series(
  current_date,
  current_date + interval '180 days',
  interval '1 day'
) as generated_days(day_value)
on conflict (work_date) do update
set
  status = excluded.status,
  note = excluded.note,
  is_visible = true;

insert into public.appointment_availability_slots (day_id, slot_time)
select d.id, make_time(hour_value, 0, 0)
from public.appointment_availability_days d
cross join generate_series(9, 19, 2) as hours(hour_value)
where d.work_date between current_date and current_date + 180
on conflict (day_id, slot_time) do nothing;

-- 2 saatlik blok mantigi:
-- slot_time = '09:00' kaydi musteride '09:00 - 11:00' olarak gorunur.
-- Birden fazla araligi kapatmak icin ilgili slot satirlarini false yapabilirsiniz:
-- update public.appointment_availability_slots
-- set is_available = false
-- where day_id = (
--   select id from public.appointment_availability_days
--   where work_date = current_date + 1
-- )
-- and slot_time in ('09:00', '13:00', '17:00');

-- Ilk veya yeni admini onaylamak icin email adresini degistirip calistirin:
-- update public.admin_profiles
-- set role = 'admin', is_active = true
-- where user_id = (
--   select id from auth.users where email = 'admin@example.com'
-- );
