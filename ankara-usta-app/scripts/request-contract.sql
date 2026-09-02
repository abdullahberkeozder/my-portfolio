-- Generated contract snapshot; original source: app/data/wizardDefinitions.ts.
begin;
create or replace function private.request_contract()
returns jsonb language sql immutable security invoker set search_path = ''
as $$ select $contract$__DEFINITIONS__$contract$::jsonb $$;
revoke all on function private.request_contract() from public, anon;
grant execute on function private.request_contract() to authenticated, service_role;

create or replace function private.request_answers_valid(p_service_id text, p_answers jsonb, p_complete boolean)
returns boolean language plpgsql immutable security invoker set search_path = ''
as $$
declare definition jsonb := private.request_contract()->p_service_id;
  question jsonb; visible_ids text[] := array[]::text[]; qid text; visible boolean;
begin
  if definition is null or jsonb_typeof(p_answers) is distinct from 'object' then return false; end if;
  for question in select value from jsonb_array_elements(definition->'questions') loop
    qid := question->>'id';
    visible := not (question ? 'showWhen') or (
      (question->'showWhen'->>'questionId') = any(visible_ids)
      and (question->'showWhen'->'equals') ? (p_answers->>(question->'showWhen'->>'questionId')));
    if coalesce(visible,false) then
      visible_ids := array_append(visible_ids,qid);
      if p_answers ? qid then
        if jsonb_typeof(p_answers->qid) <> 'string' or not ((question->'options') ? (p_answers->>qid)) then return false; end if;
      elsif p_complete then return false;
      end if;
    end if;
  end loop;
  return not exists(select 1 from jsonb_object_keys(p_answers) k where not (k=any(visible_ids)));
end $$;

create or replace function private.request_timing_days(value text)
returns integer language plpgsql immutable security invoker set search_path = ''
as $$ begin
  case value
    when 'urgent','Bugün / acil','Hemen / Bugün','Mümkün olan en kısa sürede' then return 0;
    when 'this_week','Bu hafta','Bu hafta içinde' then return 7;
    when 'next_two_weeks','Önümüzdeki iki hafta' then return 14;
    when 'flexible','Tarih konusunda esneğim','Tarih esnek' then return 30;
    else raise exception 'Invalid timing preference';
  end case;
end $$;
revoke all on function private.request_timing_days(text) from public,anon;
grant execute on function private.request_timing_days(text) to authenticated,service_role;

create or replace function private.normalize_request_timing()
returns trigger language plpgsql security invoker set search_path = ''
as $$ begin
  if new.preferred_timing is not null and trim(new.preferred_timing) <> '' then
    new.preferred_timing := case private.request_timing_days(new.preferred_timing)
      when 0 then 'urgent' when 7 then 'this_week'
      when 14 then 'next_two_weeks' else 'flexible' end;
  end if;
  return new;
end $$;
revoke all on function private.normalize_request_timing() from public,anon;
create trigger normalize_request_timing before insert or update of preferred_timing
on public.service_requests for each row execute function private.normalize_request_timing();

-- Preserve the existing function's ownership, authorization and query logic.
do $$ declare fn record; original text; updated text; replacements integer := 0;
begin
  for fn in select p.oid from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where p.proname='match_request' and n.nspname in ('public','private') loop
    original := pg_get_functiondef(fn.oid);
    updated := regexp_replace(original, 'horizon_days := case request_row.preferred_timing[\s\S]*?end;',
      'horizon_days := private.request_timing_days(request_row.preferred_timing);');
    if updated <> original then execute updated; replacements := replacements+1; end if;
  end loop;
  if replacements <> 1 then raise exception 'Expected exactly one matching implementation'; end if;
end $$;
commit;
