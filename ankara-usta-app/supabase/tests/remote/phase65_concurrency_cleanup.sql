delete from public.jobs where request_id in (
  select draft_id from private.phase65_concurrency_context
  union all select quote_request_id from private.phase65_concurrency_context
);
delete from public.service_requests where id in (
  select draft_id from private.phase65_concurrency_context
  union all select quote_request_id from private.phase65_concurrency_context
);
delete from public.tradesperson_profiles where user_id in (
  select tradesperson_id from private.phase65_concurrency_context
);
drop table private.phase65_concurrency_context;
select 'Phase 6.5 concurrency fixture cleaned' as result;
