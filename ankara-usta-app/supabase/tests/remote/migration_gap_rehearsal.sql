-- Local-only schema assertion after replaying the production baseline and pending migrations.
do $check$
declare
  migration_count integer;
begin
  select count(*) into migration_count from supabase_migrations.schema_migrations;
  if migration_count <> 32 then
    raise exception 'Expected 32 applied migrations, got %', migration_count;
  end if;

  if to_regprocedure('private.public_professional_verification(uuid)') is null then
    raise exception 'Private professional verification is missing';
  end if;
  if to_regprocedure('public.list_public_verified_professionals(text,text,integer,integer)') is null then
    raise exception 'Public professional directory is missing';
  end if;
  if to_regprocedure('public.list_public_professional_completed_job_counts(uuid[])') is null then
    raise exception 'Completed-job milestone RPC is missing';
  end if;
  if not has_function_privilege('anon', 'public.list_public_professional_completed_job_counts(uuid[])', 'EXECUTE') then
    raise exception 'Anonymous milestone access is missing';
  end if;
  if has_function_privilege('public', 'public.list_public_professional_completed_job_counts(uuid[])', 'EXECUTE') then
    raise exception 'Milestone RPC granted to PUBLIC';
  end if;
  if exists (
    select 1 from public.list_public_professional_completed_job_counts(
      array_fill('00000000-0000-0000-0000-000000000001'::uuid, array[51])
    )
  ) then
    raise exception 'Milestone RPC accepted more than 50 IDs';
  end if;
end;
$check$;

select 'migration gap rehearsal passed' as result;
