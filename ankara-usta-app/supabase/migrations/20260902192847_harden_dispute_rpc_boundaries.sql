begin;
-- Preserve public RPC signatures and OIDs; retain authorization in private implementations.
-- This changes the exposure boundary, not which signed-in users may perform an action.
do $migration$
declare
  fn record;
  definition text;
  arguments text;
  result_type text;
  call_arguments text;
  migrated integer := 0;
begin
  for fn in
    select p.*, n.nspname from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname = any(array[
      'open_job_dispute','add_dispute_statement','submit_dispute_appeal',
      'admin_transition_dispute','add_dispute_internal_note',
      'apply_tradesperson_sanction','get_dispute_decisions'
    ])
  loop
    if not fn.prosecdef then raise exception 'Expected existing definer RPC: %',fn.proname; end if;
    if exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
      where n.nspname='private' and p.proname=fn.proname) then
      raise exception 'Private implementation already exists: %',fn.proname;
    end if;
    definition := pg_get_functiondef(fn.oid);
    if position('auth.uid()' in definition)=0 then raise exception 'Missing actor check: %',fn.proname; end if;
    arguments := pg_get_function_arguments(fn.oid);
    result_type := pg_get_function_result(fn.oid);
    select string_agg(format('%I',arg),', ' order by ordinal) into call_arguments
      from unnest(fn.proargnames) with ordinality names(arg,ordinal) where ordinal<=fn.pronargs;
    execute replace(definition,'FUNCTION public.'||fn.proname||'(', 'FUNCTION private.'||fn.proname||'(');
    execute format('revoke all on function private.%I(%s) from public, anon, authenticated, service_role',fn.proname,oidvectortypes(fn.proargtypes));
    execute format('grant execute on function private.%I(%s) to authenticated, service_role',fn.proname,oidvectortypes(fn.proargtypes));
    execute format('create or replace function public.%I(%s) returns %s language sql security invoker set search_path = %L as %L',
      fn.proname,arguments,result_type,'',
      case when fn.proretset then 'select * from ' else 'select ' end || format('private.%I(%s)',fn.proname,call_arguments));
    execute format('revoke all on function public.%I(%s) from public, anon',fn.proname,oidvectortypes(fn.proargtypes));
    execute format('grant execute on function public.%I(%s) to authenticated, service_role',fn.proname,oidvectortypes(fn.proargtypes));
    migrated := migrated+1;
  end loop;
  if migrated<>7 then raise exception 'Expected seven RPCs, found %',migrated; end if;
end $migration$;
notify pgrst, 'reload schema';
commit;
