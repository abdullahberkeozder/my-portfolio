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
  customer_note text,
  admin_note text,
  -- Deprecated compatibility column. New code uses customer_note/admin_note.
  notes text,
  constraint appointment_requests_channel_check
    check (channel in ('system', 'whatsapp', 'email')),
  constraint appointment_requests_status_check
    check (status in ('new', 'contacted', 'confirmed', 'cancelled', 'completed'))
);

alter table public.appointment_requests
  add column if not exists customer_note text;

alter table public.appointment_requests
  add column if not exists admin_note text;

-- Preserve existing data while separating notes where their origin can be
-- inferred from the customer-facing message snapshot.
update public.appointment_requests
set
  customer_note = case
    when customer_note is not null then customer_note
    when notes is not null
      and position(lower(trim(notes)) in lower(coalesce(message, ''))) > 0
      then notes
    else null
  end,
  admin_note = case
    when admin_note is not null then admin_note
    when notes is not null
      and position(lower(trim(notes)) in lower(coalesce(message, ''))) = 0
      then notes
    else null
  end
where notes is not null
  and (customer_note is null or admin_note is null);

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

create or replace function public.create_appointment_request(
  p_customer_name text,
  p_customer_phone text,
  p_service_type text,
  p_requested_date date,
  p_requested_time time without time zone,
  p_customer_email text default null,
  p_message text default null,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_slot_id uuid;
  v_request_id uuid;
begin
  if char_length(trim(coalesce(p_customer_name, ''))) not between 2 and 120
    or char_length(trim(coalesce(p_customer_phone, ''))) not between 6 and 30
    or char_length(trim(coalesce(p_service_type, ''))) not between 2 and 120
  then
    raise exception 'invalid_customer_details' using errcode = 'P0001';
  end if;

  if p_customer_email is not null
    and char_length(trim(p_customer_email)) > 254
  then
    raise exception 'invalid_customer_email' using errcode = 'P0001';
  end if;

  if char_length(coalesce(p_message, '')) > 2000
    or char_length(coalesce(p_notes, '')) > 1000
  then
    raise exception 'appointment_text_too_long' using errcode = 'P0001';
  end if;

  if p_requested_date is null or p_requested_date < current_date then
    raise exception 'appointment_date_unavailable' using errcode = 'P0001';
  end if;

  if p_requested_time is null
    or p_requested_time < time '09:00'
    or p_requested_time > time '19:00'
    or extract(minute from p_requested_time) <> 0
    or extract(second from p_requested_time) <> 0
    or mod(extract(hour from p_requested_time)::integer - 9, 2) <> 0
  then
    raise exception 'invalid_appointment_time' using errcode = 'P0001';
  end if;

  select slot.id
  into v_slot_id
  from public.appointment_availability_slots as slot
  join public.appointment_availability_days as day
    on day.id = slot.day_id
  where day.work_date = p_requested_date
    and day.is_visible = true
    and day.status <> 'closed'
    and slot.slot_time = p_requested_time
    and slot.is_available = true
    and not exists (
      select 1
      from public.appointment_requests as existing_request
      where existing_request.requested_date = p_requested_date
        and existing_request.requested_time = p_requested_time
        and existing_request.status = 'confirmed'
    )
  for update of slot;

  if v_slot_id is null then
    raise exception 'appointment_slot_unavailable' using errcode = 'P0001';
  end if;

  insert into public.appointment_requests (
    customer_name,
    customer_phone,
    customer_email,
    service_type,
    requested_date,
    requested_time,
    channel,
    status,
    message,
    customer_note,
    notes
  )
  values (
    trim(p_customer_name),
    trim(p_customer_phone),
    nullif(trim(coalesce(p_customer_email, '')), ''),
    trim(p_service_type),
    p_requested_date,
    p_requested_time,
    'system',
    'new',
    nullif(trim(coalesce(p_message, '')), ''),
    nullif(trim(coalesce(p_notes, '')), ''),
    nullif(trim(coalesce(p_notes, '')), '')
  )
  returning id into v_request_id;

  return v_request_id;
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

create or replace function public.handle_appointment_status_slot_sync()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_slot_id uuid;
begin
  -- 1. Randevu onaylandığında (UPDATE): Slotu kapat
  if TG_OP = 'UPDATE' 
     and new.status = 'confirmed' 
     and old.status is distinct from 'confirmed'
  then
    select slot.id
    into v_slot_id
    from public.appointment_availability_slots as slot
    join public.appointment_availability_days as day
      on day.id = slot.day_id
    where day.work_date = new.requested_date
      and day.is_visible = true
      and day.status <> 'closed'
      and slot.slot_time = new.requested_time
      and slot.is_available = true
      and not exists (
        select 1
        from public.appointment_requests as existing_request
        where existing_request.id <> new.id
          and existing_request.requested_date = new.requested_date
          and existing_request.requested_time = new.requested_time
          and existing_request.status = 'confirmed'
      )
    for update of slot;

    if v_slot_id is null then
      raise exception 'appointment_slot_unavailable' using errcode = 'P0001';
    end if;

    update public.appointment_availability_slots
    set is_available = false
    where id = v_slot_id;
  end if;

  -- 2. Randevu onaylı durumdan başka duruma (iptal, yeni vb.) geçtiğinde (UPDATE): Slotu geri aç
  if TG_OP = 'UPDATE'
     and old.status = 'confirmed'
     and new.status in ('cancelled', 'new', 'contacted')
  then
    update public.appointment_availability_slots as slot
    set is_available = true
    from public.appointment_availability_days as day
    where day.id = slot.day_id
      and day.work_date = old.requested_date
      and slot.slot_time = old.requested_time;
  end if;

  -- 3. Onaylı randevu silindiğinde (DELETE): Slotu geri aç
  if TG_OP = 'DELETE'
     and old.status = 'confirmed'
  then
    update public.appointment_availability_slots as slot
    set is_available = true
    from public.appointment_availability_days as day
    where day.id = slot.day_id
      and day.work_date = old.requested_date
      and slot.slot_time = old.requested_time;
  end if;

  if TG_OP = 'DELETE' then
    return old;
  else
    return new;
  end if;
end;
$$;

create or replace function public.protect_customer_note()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.customer_note is distinct from old.customer_note then
    raise exception 'customer_note_immutable' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

create or replace function public.sync_legacy_admin_note()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.notes is distinct from old.notes then
    new.admin_note = new.notes;
  end if;

  return new;
end;
$$;

create or replace function public.handle_new_admin_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.admin_profiles (user_id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email,
    'pending'
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

drop trigger if exists protect_appointment_customer_note
on public.appointment_requests;

create trigger protect_appointment_customer_note
before update of customer_note on public.appointment_requests
for each row execute function public.protect_customer_note();

drop trigger if exists sync_legacy_appointment_admin_note
on public.appointment_requests;

create trigger sync_legacy_appointment_admin_note
before update of notes on public.appointment_requests
for each row execute function public.sync_legacy_admin_note();

drop trigger if exists close_slot_on_appointment_confirmation
on public.appointment_requests;

drop trigger if exists sync_appointment_status_with_slot
on public.appointment_requests;

create trigger sync_appointment_status_with_slot
before update of status or delete on public.appointment_requests
for each row execute function public.handle_appointment_status_slot_sync();

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

alter table public.appointment_availability_days enable row level security;
alter table public.appointment_availability_slots enable row level security;
alter table public.appointment_requests enable row level security;
alter table public.admin_profiles enable row level security;

grant select on public.appointment_availability_days to anon, authenticated;
grant select on public.appointment_availability_slots to anon, authenticated;
revoke insert on public.appointment_requests from anon, authenticated;
grant select, update, delete on public.appointment_requests to authenticated;
grant insert, update, delete on public.appointment_availability_days to authenticated;
grant insert, update, delete on public.appointment_availability_slots to authenticated;
grant select, update, delete on public.admin_profiles to authenticated;
revoke all on function public.create_appointment_request(
  text,
  text,
  text,
  date,
  time without time zone,
  text,
  text,
  text
) from public;
grant execute on function public.create_appointment_request(
  text,
  text,
  text,
  date,
  time without time zone,
  text,
  text,
  text
) to anon, authenticated;
grant execute on function public.is_admin(uuid) to anon, authenticated;
revoke all on function public.handle_appointment_status_slot_sync()
from public;

revoke all on function public.protect_customer_note()
from public;

revoke all on function public.sync_legacy_admin_note()
from public;

notify pgrst, 'reload schema';

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
  'Ortalama iş süresi iki saattir. 09:00 - 21:00 arasında randevu alınabilir.'
from generate_series(
  current_date,
  current_date + interval '180 days',
  interval '1 day'
) as generated_days(day_value)
on conflict (work_date) do nothing;

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
