import {readFileSync} from 'node:fs';
import {parseEnv} from 'node:util';
import {spawnSync} from 'node:child_process';
import {join} from 'node:path';
import {assertStagingTarget} from './staging-target.mjs';

const root=process.cwd();
const config=parseEnv(readFileSync(join(root,'.env.e2e.local'),'utf8'));
assertStagingTarget({...config,E2E_ALLOW_STAGING_WRITES:process.env.E2E_ALLOW_STAGING_WRITES});
if(config.E2E_STAGING_PROJECT_REF!=='hyuijuafuayzultbjvjb') throw new Error('Only the approved orkestra-e2e rehearsal target is allowed.');
const cli=join(root,'node_modules','supabase','dist','supabase.js');
function query(args){
  const result=spawnSync(process.execPath,[cli,'db','query','--linked','--project-ref',config.E2E_STAGING_PROJECT_REF,...args],
    {cwd:root,encoding:'utf8',windowsHide:true});
  if(result.status!==0) throw new Error([result.stderr,result.stdout,result.error?.message].filter(Boolean).join('\n') || 'Database rehearsal failed.');
  return result.stdout;
}
try {
  const fixture=readFileSync(join(root,'supabase/tests/remote/notification_recovery_rehearsal.sql'),'utf8');
  if(process.argv.includes('--candidate-migration')) {
    // Transactional rehearsal only: neither DDL nor fixture nor migration history persists.
    const migration=readFileSync(join(root,'supabase/migrations/20260922205318_notification_result_lease_fencing.sql'),'utf8');
    query(['/* transactional candidate rehearsal */\n'+fixture.replace("set local statement_timeout = '30s';", () => "set local statement_timeout = '30s';\n"+migration)]);
  } else {
    query(['--file',join(root,'supabase/tests/remote/notification_recovery_rehearsal.sql')]);
  }
  console.log('PASS: retry, dead-letter, stale-owner/generation rejection, unchanged reclaimed lease, recovered success, scoped cron and unrelated rows.');
} finally {
  // A separate connection confirms the transaction did not persist its fixture.
  query(["do $$ begin if exists(select 1 from public.notification_outbox where id=-9220922001) then raise exception 'Rehearsal fixture persisted'; end if; end $$;"]);
  console.log('PASS: rollback cleanup confirmed from a separate connection.');
  if(process.argv.includes('--candidate-migration')) {
    query(["do $$ begin if to_regprocedure('public.mark_notification_result(bigint,boolean,text)') is null or to_regprocedure('public.mark_notification_result(bigint,text,integer,boolean,text)') is not null then raise exception 'Candidate DDL rollback not confirmed'; end if; end $$;"]);
    console.log('PASS: candidate DDL rolled back; no permanent RPC activation.');
  }
}
