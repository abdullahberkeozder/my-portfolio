-- Reuse auth.users, user_profiles, user_roles and tradesperson_profiles.
-- Intent is onboarding data, NEVER an authorization role or professional approval.
create table public.account_registration_intents (
  user_id uuid primary key references auth.users(id) on delete cascade,
  intent text not null check(intent in ('customer','tradesperson')),
  created_at timestamptz not null default now()
);
alter table public.account_registration_intents enable row level security;
revoke all on public.account_registration_intents from public,anon,authenticated;
grant select on public.account_registration_intents to authenticated;
create policy "read own registration intent" on public.account_registration_intents
  for select to authenticated using(user_id=(select auth.uid()));

create function private.record_registration_intent() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  insert into public.account_registration_intents(user_id,intent)
  values(new.id,case when new.raw_user_meta_data->>'registration_intent'='tradesperson' then 'tradesperson' else 'customer' end)
  on conflict(user_id) do nothing;
  return new;
end $$;
revoke all on function private.record_registration_intent() from public,anon,authenticated;
create trigger auth_record_registration_intent after insert on auth.users
  for each row execute function private.record_registration_intent();
-- No historical intent is inferred from current roles. Existing accounts remain unchanged.
-- Existing auth_user_created creates the customer role and user profile.
-- Existing professional application RPCs create the real professional profile;
-- their status/document checks still control quoting. No password duplication.
