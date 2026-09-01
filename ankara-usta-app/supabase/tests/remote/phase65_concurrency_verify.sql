do $$begin
  if (select count(*) from public.service_requests request cross join private.phase65_concurrency_context context where request.customer_id=context.customer_id and request.idempotency_key=context.draft_idempotency_key)<>1 then
    raise exception 'Concurrent draft upserts did not produce exactly one request';
  end if;
  if (select count(*) from public.quotes quote cross join private.phase65_concurrency_context context where quote.request_id=context.quote_request_id and quote.status='accepted')<>1 then
    raise exception 'Concurrent quote acceptance did not produce exactly one accepted quote';
  end if;
  if (select count(*) from public.jobs job cross join private.phase65_concurrency_context context where job.request_id=context.quote_request_id)<>1 then
    raise exception 'Concurrent quote acceptance did not produce exactly one job';
  end if;
  if not exists(select 1 from public.service_requests request cross join private.phase65_concurrency_context context where request.id=context.quote_request_id and request.status='provider_selected') then
    raise exception 'Accepted quote did not close the request';
  end if;
end$$;
select 'Phase 6.5 concurrency invariants passed' as result;
