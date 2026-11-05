-- Only an aggregate is public. Individual jobs and customer data remain private.
create or replace function public.list_public_professional_completed_job_counts(p_professional_ids uuid[])
returns table(user_id uuid, completed_jobs bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select profile.user_id, count(job.id)::bigint as completed_jobs
  from public.tradesperson_profiles as profile
  left join public.jobs as job
    on job.tradesperson_id = profile.user_id and job.status = 'completed'
  where profile.user_id = any(p_professional_ids)
    and cardinality(p_professional_ids) between 1 and 50
    and private.public_professional_verification(profile.user_id)
  group by profile.user_id;
$$;

revoke all on function public.list_public_professional_completed_job_counts(uuid[]) from public, anon, authenticated;
grant execute on function public.list_public_professional_completed_job_counts(uuid[]) to anon, authenticated;

comment on function public.list_public_professional_completed_job_counts(uuid[])
  is 'Verified professional completed-job aggregates only; no customer or job detail.';

notify pgrst, 'reload schema';
