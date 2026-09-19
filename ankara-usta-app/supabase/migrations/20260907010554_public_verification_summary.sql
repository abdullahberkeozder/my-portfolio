-- Public badge projection, deliberately separate from internal eligibility helpers.
-- No auth.uid() requirement: visitors may inspect approved public profiles.
-- Only a boolean is disclosed; missing/non-public profiles always return false.
create or replace function private.public_professional_verification(provider_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.tradesperson_profiles p
    where p.user_id = provider_id and p.application_status = 'approved'
      and exists (
        select 1 from public.tradesperson_documents d
        where d.tradesperson_id = p.user_id
          and d.kind = 'professional_certificate' and d.status = 'verified'
          and (d.expires_at is null or d.expires_at >= current_date)
      )
  );
$$;
revoke all on function private.public_professional_verification(uuid) from public;
grant execute on function private.public_professional_verification(uuid) to anon, authenticated;

create or replace function public.get_public_professional_verification(provider_id uuid)
returns boolean language sql stable security invoker set search_path = ''
begin atomic
  select private.public_professional_verification(provider_id);
end;
revoke all on function public.get_public_professional_verification(uuid) from public;
grant execute on function public.get_public_professional_verification(uuid) to anon, authenticated;

-- No document/table grants, no changes to request authorization or internal RPC ACLs.
notify pgrst, 'reload schema';
