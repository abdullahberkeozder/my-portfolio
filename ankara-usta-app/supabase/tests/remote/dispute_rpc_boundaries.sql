-- Database-role regression checks, not real Auth sessions or browser E2E.
begin;
do $check$
declare fn record; total integer := 0;
begin
  for fn in select p.* from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname=any(array['open_job_dispute','add_dispute_statement',
      'submit_dispute_appeal','admin_transition_dispute','add_dispute_internal_note',
      'apply_tradesperson_sanction','get_dispute_decisions']) loop
    if fn.prosecdef then raise exception 'Public definer remains'; end if;
    if has_function_privilege('anon',fn.oid,'execute') then raise exception 'Anonymous execute remains'; end if;
    if not has_function_privilege('authenticated',fn.oid,'execute') then raise exception 'Authenticated RPC unavailable'; end if;
    total := total+1;
  end loop;
  if total<>7 then raise exception 'Missing public wrappers'; end if;
end $check$;
select set_config('request.jwt.claims','{}',true);
select set_config('request.jwt.claim.sub','',true);
set local role authenticated;
do $check$
declare call_sql text; denied integer:=0;
begin
  foreach call_sql in array array[
    $$select public.open_job_dispute('00000000-0000-0000-0000-000000000000','quality','Controlled authorization test description')$$,
    $$select public.add_dispute_statement('00000000-0000-0000-0000-000000000000','Controlled authorization test statement')$$,
    $$select public.submit_dispute_appeal('00000000-0000-0000-0000-000000000000','Controlled authorization test appeal')$$,
    $$select public.admin_transition_dispute('00000000-0000-0000-0000-000000000000','triage','Controlled authorization test reason')$$,
    $$select public.add_dispute_internal_note('00000000-0000-0000-0000-000000000000','Controlled test note')$$,
    $$select public.apply_tradesperson_sanction('00000000-0000-0000-0000-000000000000','warning','Controlled authorization test reason')$$,
    $$select public.get_dispute_decisions('00000000-0000-0000-0000-000000000000')$$
  ] loop
    begin
      execute call_sql;
      raise exception 'FAIL: unauthenticated call accepted';
    exception when raise_exception then
      if sqlerrm not in ('Only job participants may open a dispute','Statement is not allowed',
        'Appeal is not allowed','Operator transition is not allowed','Internal note is not allowed',
        'Sanction is not allowed','Dispute decisions are not available') then raise; end if;
      denied:=denied+1;
    end;
  end loop;
  if denied<>7 then raise exception 'Missing rejection'; end if;
end $check$;
reset role;
rollback;
select 'PASS: 7 invoker wrappers, anonymous privileges denied, 7 missing-identity calls rejected' as result;
