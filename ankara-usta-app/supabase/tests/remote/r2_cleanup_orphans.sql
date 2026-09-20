begin;
create temporary table r2_orphan_requests(id uuid primary key) on commit drop;
insert into r2_orphan_requests(id)
select distinct quote.request_id from public.quotes quote
where quote.note='R2 isolated concurrency gate'
on conflict do nothing;
insert into r2_orphan_requests(id)
select request.id from public.service_requests request
join auth.users customer on customer.id=request.customer_id
where customer.email='u3-customer@orkestra.example'
  and request.neighborhood='R2-CONCURRENCY'
on conflict do nothing;
create temporary table r2_orphan_jobs on commit drop as
select id from public.jobs where request_id in(select id from r2_orphan_requests);

set local session_replication_role = replica;
delete from public.job_events where job_id in(select id from r2_orphan_jobs);
delete from public.job_messages where job_id in(select id from r2_orphan_jobs);
delete from public.inspection_appointments where job_id in(select id from r2_orphan_jobs);
delete from public.scope_changes where job_id in(select id from r2_orphan_jobs);
delete from public.job_addresses where job_id in(select id from r2_orphan_jobs);
delete from public.work_log_entries where job_id in(select id from r2_orphan_jobs);
delete from public.job_acceptances where job_id in(select id from r2_orphan_jobs);
delete from public.reviews where job_id in(select id from r2_orphan_jobs);
delete from public.workmanship_certificates where job_id in(select id from r2_orphan_jobs);
delete from public.dispute_cases where job_id in(select id from r2_orphan_jobs);
delete from public.jobs where id in(select id from r2_orphan_jobs);
delete from public.quote_revision_requests where quote_id in(
  select id from public.quotes where request_id in(select id from r2_orphan_requests)
);
delete from public.quotes where request_id in(select id from r2_orphan_requests);
set local session_replication_role = origin;
-- Repair children left by the first interrupted cleanup, then let normal
-- cascade constraints handle all complete request rows.
delete from public.request_matches where request_id in(select id from r2_orphan_requests);
delete from public.matching_runs where request_id in(select id from r2_orphan_requests);
delete from public.service_requests where id in(select id from r2_orphan_requests);

commit;
select 'R2 orphan concurrency fixtures cleaned' as result;
