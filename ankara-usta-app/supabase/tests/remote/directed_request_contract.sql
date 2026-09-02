-- Read-only/rollback checks after the directed-request migration.
-- Does NOT prove positive multi-account RLS, matching, media or Realtime behavior.
begin;
do $$
declare definition text;
begin
  if not exists(select 1 from pg_constraint where conrelid='public.service_requests'::regclass and conname='request_routing_valid') then
    raise exception 'Missing routing constraint';
  end if;
  if not exists(select 1 from pg_constraint where conrelid='public.service_requests'::regclass and conname='request_no_self_target') then
    raise exception 'Missing self-target constraint';
  end if;
  if exists(select 1 from public.service_requests where not (
    (routing_mode='open' and target_professional_id is null) or (routing_mode='direct' and target_professional_id is not null))) then
    raise exception 'Inconsistent existing request audience';
  end if;
  if has_function_privilege('anon','public.upsert_direct_request_draft(uuid,text,text,jsonb,uuid,text,text,text)','EXECUTE') then
    raise exception 'Anonymous direct mutation allowed';
  end if;
  if has_table_privilege('authenticated','public.service_requests','UPDATE') then
    raise exception 'Direct table updates bypass routing RPC';
  end if;
  if (select prosecdef from pg_proc where oid='public.upsert_direct_request_draft(uuid,text,text,jsonb,uuid,text,text,text)'::regprocedure) then
    raise exception 'Public RPC must be invoker';
  end if;
  definition:=pg_get_functiondef('private.match_request(uuid)'::regprocedure);
  if position('profile.user_id=request_row.target_professional_id' in definition)=0 then
    raise exception 'Matching target predicate missing';
  end if;
  if (select count(*) from pg_trigger where tgname in ('guard_request_routing','guard_direct_match','guard_direct_quote') and not tgisinternal)<>3 then
    raise exception 'Recipient guard triggers missing';
  end if;
end;
$$;
select set_config('request.jwt.claim.sub','',true);
select set_config('request.jwt.claims','{}',true);
set local role authenticated;
do $$
begin
  begin
    perform public.upsert_direct_request_draft(gen_random_uuid(),'tv-duvar-montaji','package','{}',gen_random_uuid());
    raise exception 'Missing identity unexpectedly accepted';
  exception when insufficient_privilege then null;
  end;
end;
$$;
reset role;
rollback;
