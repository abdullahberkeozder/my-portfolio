begin;
create temporary table r2_realtime_requests on commit drop as
select distinct request_id as id from public.quotes
where note like 'E2E aktif iş %' or note like 'Canlı teklif %';
create temporary table r2_realtime_jobs on commit drop as
select id from public.jobs where request_id in(select id from r2_realtime_requests);

set local session_replication_role = replica;
delete from public.job_events where job_id in(select id from r2_realtime_jobs);
delete from public.job_messages where job_id in(select id from r2_realtime_jobs);
delete from public.inspection_appointments where job_id in(select id from r2_realtime_jobs);
delete from public.scope_changes where job_id in(select id from r2_realtime_jobs);
delete from public.job_addresses where job_id in(select id from r2_realtime_jobs);
delete from public.work_log_entries where job_id in(select id from r2_realtime_jobs);
delete from public.job_acceptances where job_id in(select id from r2_realtime_jobs);
delete from public.reviews where job_id in(select id from r2_realtime_jobs);
delete from public.workmanship_certificates where job_id in(select id from r2_realtime_jobs);
delete from public.dispute_cases where job_id in(select id from r2_realtime_jobs);
delete from public.jobs where id in(select id from r2_realtime_jobs);
delete from public.quote_revision_requests where quote_id in(
  select id from public.quotes where request_id in(select id from r2_realtime_requests)
);
delete from public.quotes where request_id in(select id from r2_realtime_requests);
set local session_replication_role = origin;
delete from public.request_matches where request_id in(select id from r2_realtime_requests);
delete from public.matching_runs where request_id in(select id from r2_realtime_requests);
delete from public.service_requests where id in(select id from r2_realtime_requests);
commit;
select 'R2 Realtime fixtures cleaned' as result;
