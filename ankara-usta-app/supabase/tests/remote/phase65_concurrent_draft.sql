begin;
create temporary table phase65_context as select * from private.phase65_concurrency_context;
grant select on phase65_context to authenticated;
select set_config('request.jwt.claim.role','authenticated',true);
select set_config('request.jwt.claim.sub',(select customer_id::text from phase65_context),true);
set local role authenticated;
do $$begin
  if (select auth.uid()) is distinct from (select customer_id from phase65_context) then
    raise exception 'Concurrent draft JWT mismatch: % <> %',(select auth.uid()),(select customer_id from phase65_context);
  end if;
end$$;
select public.upsert_request_draft(
  (select draft_idempotency_key from phase65_context),
  'tv-duvar-montaji','package','{"fixture":"phase65-concurrency","screen":"scope"}',
  null,null,'Bu hafta'
);
commit;
