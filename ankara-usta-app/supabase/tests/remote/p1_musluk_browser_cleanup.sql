begin;
create temporary table p1_browser_requests(id uuid primary key) on commit drop;
insert into p1_browser_requests(id)
select distinct request_id from public.quotes where note like 'P1 BROWSER MUSLUK %';
-- Also remove a browser run that stopped after submission but before quote creation.
insert into p1_browser_requests(id)
select request.id
from public.service_requests request
join auth.users customer on customer.id=request.customer_id
where customer.email='u3-customer@orkestra.example'
  and request.service_id='musluk-degisimi'
  and request.routing_mode='open'
  and request.district='Sincan'
  and request.neighborhood='Törekent'
  and request.answers='{"faucet-type":"Mutfak bataryası","part-available":"Evet, yeni bataryayı aldım","shutoff-valve":"Evet, su kesilebiliyor"}'::jsonb
on conflict do nothing;
create temporary table p1_browser_jobs on commit drop as
select id from public.jobs where request_id in(select id from p1_browser_requests);

set local session_replication_role=replica;
delete from public.job_events where job_id in(select id from p1_browser_jobs);
delete from public.job_messages where job_id in(select id from p1_browser_jobs);
delete from public.inspection_appointments where job_id in(select id from p1_browser_jobs);
delete from public.scope_changes where job_id in(select id from p1_browser_jobs);
delete from public.job_addresses where job_id in(select id from p1_browser_jobs);
delete from public.work_log_entries where job_id in(select id from p1_browser_jobs);
delete from public.job_acceptances where job_id in(select id from p1_browser_jobs);
delete from public.reviews where job_id in(select id from p1_browser_jobs);
delete from public.workmanship_certificates where job_id in(select id from p1_browser_jobs);
delete from public.dispute_cases where job_id in(select id from p1_browser_jobs);
delete from public.jobs where id in(select id from p1_browser_jobs);
delete from public.quote_revision_requests where quote_id in(select id from public.quotes where request_id in(select id from p1_browser_requests));
delete from public.quotes where request_id in(select id from p1_browser_requests);
set local session_replication_role=origin;
delete from public.request_conversation_messages where conversation_id in(select id from public.request_conversations where request_id in(select id from p1_browser_requests));
delete from public.request_conversations where request_id in(select id from p1_browser_requests);
delete from public.request_invitation_events where request_id in(select id from p1_browser_requests);
delete from public.request_invitations where request_id in(select id from p1_browser_requests);
delete from public.request_matches where request_id in(select id from p1_browser_requests);
delete from public.matching_runs where request_id in(select id from p1_browser_requests);
delete from public.service_requests where id in(select id from p1_browser_requests);
commit;
select 'P1 browser Musluk fixtures cleaned' as result;
