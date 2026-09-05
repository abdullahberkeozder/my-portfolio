create or replace function private.refresh_district_trust_metrics()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  affected_job_id uuid := coalesce(new.job_id, old.job_id);
  affected_district text;
  affected_tradesperson_id uuid;
begin
  select request.district, job.tradesperson_id
    into affected_district, affected_tradesperson_id
  from public.jobs job
  join public.service_requests request on request.id = job.request_id
  where job.id = affected_job_id;

  if affected_district is null or affected_tradesperson_id is null then
    return coalesce(new, old);
  end if;

  delete from public.district_trust_metrics metric
  where metric.district = affected_district
    and metric.tradesperson_id = affected_tradesperson_id;

  insert into public.district_trust_metrics (
    district,
    tradesperson_id,
    completed_jobs,
    average_rating
  )
  select
    request.district,
    job.tradesperson_id,
    count(*)::bigint,
    round(avg(review.rating)::numeric, 2)
  from public.reviews review
  join public.jobs job on job.id = review.job_id
  join public.service_requests request on request.id = job.request_id
  where review.moderation_status = 'approved'
    and request.district = affected_district
    and job.tradesperson_id = affected_tradesperson_id
  group by request.district, job.tradesperson_id
  having count(*) >= 5;

  return coalesce(new, old);
end;
$$;

revoke execute on function private.refresh_district_trust_metrics()
from public, anon, authenticated, service_role;

drop trigger if exists reviews_refresh_trust_metrics on public.reviews;
create trigger reviews_refresh_trust_metrics
after insert or update or delete on public.reviews
for each row execute function private.refresh_district_trust_metrics();
