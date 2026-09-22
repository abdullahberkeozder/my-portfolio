-- Public directory projection. The caller never receives document rows or
-- internal moderation state; only professionals whose public verification
-- contract is currently true are returned.
create or replace function public.list_public_verified_professionals(
  p_service_id text default null,
  p_district text default null,
  p_offset integer default 0,
  p_limit integer default 12
)
returns table (
  user_id uuid,
  display_name text,
  bio text,
  city text,
  total_count bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    profile.user_id,
    profile.display_name,
    profile.bio,
    profile.city,
    count(*) over () as total_count
  from public.tradesperson_profiles profile
  where private.public_professional_verification(profile.user_id)
    and (
      nullif(btrim(p_service_id), '') is null
      or exists (
        select 1
        from public.tradesperson_services service
        where service.tradesperson_id = profile.user_id
          and service.service_id = p_service_id
      )
    )
    and (
      nullif(btrim(p_district), '') is null
      or exists (
        select 1
        from public.tradesperson_service_areas area
        where area.tradesperson_id = profile.user_id
          and area.district = p_district
      )
    )
  order by lower(profile.display_name), profile.user_id
  offset greatest(coalesce(p_offset, 0), 0)
  limit least(greatest(coalesce(p_limit, 12), 1), 50);
$$;

revoke all on function public.list_public_verified_professionals(text,text,integer,integer)
  from public, anon, authenticated;
grant execute on function public.list_public_verified_professionals(text,text,integer,integer)
  to anon, authenticated;

comment on function public.list_public_verified_professionals(text,text,integer,integer)
  is 'Returns paginated public-safe profile fields only for currently verified professionals.';

notify pgrst, 'reload schema';
