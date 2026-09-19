-- Keep the evidence lookup private even when authenticated has USAGE on the
-- private schema for other application functions. The public entry point is a
-- deliberately narrow boolean projection with a fixed search path.
revoke all on function private.public_professional_verification(uuid)
  from public, anon, authenticated;

create or replace function public.get_public_professional_verification(provider_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
begin atomic
  select private.public_professional_verification(provider_id);
end;

revoke all on function public.get_public_professional_verification(uuid)
  from public, anon, authenticated;
grant execute on function public.get_public_professional_verification(uuid)
  to anon, authenticated;

notify pgrst, 'reload schema';
