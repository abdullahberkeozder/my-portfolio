begin;
create temporary table p1_musluk_requests(id uuid primary key) on commit drop;
insert into p1_musluk_requests(id)
select distinct request_id from public.quotes where note like 'P1 MUSLUK GOLDEN %';
insert into p1_musluk_requests(id)
select request.id
from public.service_requests request
join auth.users customer on customer.id=request.customer_id
where request.idempotency_key='9f6d21c4-3a67-4d2e-8b51-210920260001'
  and customer.email='u3-customer@orkestra.example'
on conflict do nothing;
create temporary table p1_musluk_jobs on commit drop as
select id from public.jobs where request_id in(select id from p1_musluk_requests);

set local session_replication_role=replica;
delete from public.job_events where job_id in(select id from p1_musluk_jobs);
delete from public.job_messages where job_id in(select id from p1_musluk_jobs);
delete from public.inspection_appointments where job_id in(select id from p1_musluk_jobs);
delete from public.scope_changes where job_id in(select id from p1_musluk_jobs);
delete from public.job_addresses where job_id in(select id from p1_musluk_jobs);
delete from public.work_log_entries where job_id in(select id from p1_musluk_jobs);
delete from public.job_acceptances where job_id in(select id from p1_musluk_jobs);
delete from public.reviews where job_id in(select id from p1_musluk_jobs);
delete from public.workmanship_certificates where job_id in(select id from p1_musluk_jobs);
delete from public.dispute_cases where job_id in(select id from p1_musluk_jobs);
delete from public.jobs where id in(select id from p1_musluk_jobs);
delete from public.quote_revision_requests where quote_id in(
  select id from public.quotes where request_id in(select id from p1_musluk_requests)
);
delete from public.quotes where request_id in(select id from p1_musluk_requests);
set local session_replication_role=origin;
delete from public.request_conversation_messages where conversation_id in(
  select id from public.request_conversations where request_id in(select id from p1_musluk_requests)
);
delete from public.request_conversations where request_id in(select id from p1_musluk_requests);
delete from public.request_invitation_events where request_id in(select id from p1_musluk_requests);
delete from public.request_invitations where request_id in(select id from p1_musluk_requests);
delete from public.request_matches where request_id in(select id from p1_musluk_requests);
delete from public.matching_runs where request_id in(select id from p1_musluk_requests);
delete from public.service_requests where id in(select id from p1_musluk_requests);
commit;
select 'P1 Musluk fixtures cleaned' as result;
