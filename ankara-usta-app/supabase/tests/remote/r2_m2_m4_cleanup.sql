begin;
create temporary table r2_contract_requests(id uuid primary key) on commit drop;

insert into r2_contract_requests(id)
select distinct request_id from public.quotes
where note in ('R2 M4','R2 revision v2','R2 competing revision')
on conflict do nothing;
insert into r2_contract_requests(id)
select distinct conversation.request_id
from public.request_conversations conversation
join public.request_conversation_messages message on message.conversation_id=conversation.id
where message.body='Kapsamı teyit edebilir misiniz?'
on conflict do nothing;
insert into r2_contract_requests(id)
select request_id from public.request_invitations
where decline_reason='Bu tarihte müsait değilim.'
on conflict do nothing;
insert into r2_contract_requests(id)
select successor_request_id from public.request_invitations
where request_id in(select id from r2_contract_requests) and successor_request_id is not null
on conflict do nothing;
create temporary table r2_contract_jobs on commit drop as
select id from public.jobs where request_id in(select id from r2_contract_requests);

set local session_replication_role = replica;
delete from public.job_events where job_id in(select id from r2_contract_jobs);
delete from public.job_messages where job_id in(select id from r2_contract_jobs);
delete from public.inspection_appointments where job_id in(select id from r2_contract_jobs);
delete from public.scope_changes where job_id in(select id from r2_contract_jobs);
delete from public.job_addresses where job_id in(select id from r2_contract_jobs);
delete from public.work_log_entries where job_id in(select id from r2_contract_jobs);
delete from public.job_acceptances where job_id in(select id from r2_contract_jobs);
delete from public.reviews where job_id in(select id from r2_contract_jobs);
delete from public.workmanship_certificates where job_id in(select id from r2_contract_jobs);
delete from public.dispute_cases where job_id in(select id from r2_contract_jobs);
delete from public.jobs where id in(select id from r2_contract_jobs);
delete from public.request_conversation_messages where conversation_id in(
  select id from public.request_conversations where request_id in(select id from r2_contract_requests)
);
delete from public.request_conversations where request_id in(select id from r2_contract_requests);
delete from public.quote_revision_requests where quote_id in(
  select id from public.quotes where request_id in(select id from r2_contract_requests)
);
delete from public.quotes where request_id in(select id from r2_contract_requests);
delete from public.request_invitation_events where request_id in(select id from r2_contract_requests);
delete from public.request_invitations where request_id in(select id from r2_contract_requests);
set local session_replication_role = origin;
delete from public.request_matches where request_id in(select id from r2_contract_requests);
delete from public.matching_runs where request_id in(select id from r2_contract_requests);
delete from public.service_requests where id in(select id from r2_contract_requests);
commit;
select 'R2 M2-M4 fixtures cleaned' as result;
