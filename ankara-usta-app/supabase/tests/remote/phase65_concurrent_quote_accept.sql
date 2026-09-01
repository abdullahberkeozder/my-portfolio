begin;
create temporary table phase65_context as select * from private.phase65_concurrency_context;
grant select on phase65_context to authenticated;
select set_config('request.jwt.claim.role','authenticated',true);
select set_config('request.jwt.claim.sub',(select customer_id::text from phase65_context),true);
set local role authenticated;
select public.accept_quote((select quote_id from phase65_context));
commit;
