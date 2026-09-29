import {readFileSync} from 'node:fs';
import {parseEnv} from 'node:util';
import {spawn} from 'node:child_process';
import {join} from 'node:path';
import {randomUUID} from 'node:crypto';
import {setTimeout as delay} from 'node:timers/promises';
import {assertStagingTarget} from './staging-target.mjs';

const root=process.cwd();
const config=parseEnv(readFileSync(join(root,'.env.e2e.local'),'utf8'));
assertStagingTarget({...config,E2E_ALLOW_STAGING_WRITES:process.env.E2E_ALLOW_STAGING_WRITES});
if(config.E2E_STAGING_PROJECT_REF!=='hyuijuafuayzultbjvjb') throw new Error('Only orkestra-e2e allowed');
const cli=join(root,'node_modules/supabase/dist/supabase.js');
const version='20260922205318';
const name='notification_result_lease_fencing';
const migration=readFileSync(join(root,`supabase/migrations/${version}_${name}.sql`),'utf8');
const run=randomUUID();
const id=-9220922002;
const tag=`lease-${run}`;
const fixtureGuard=`id=${id} and payload->>'rehearsal'='${run}'`;
async function query(sql) {
  return new Promise((resolve,reject)=>{
    const child=spawn(process.execPath,[cli,'db','query','--linked','--project-ref',config.E2E_STAGING_PROJECT_REF,sql,'--output','json'],{cwd:root,windowsHide:true});
    const timeout=setTimeout(()=>{
      // Kill only this owned CLI process tree; SQL also has a server-side timeout.
      if(process.platform==='win32') spawn('taskkill',['/PID',String(child.pid),'/T','/F'],{windowsHide:true,stdio:'ignore'});
      else child.kill('SIGTERM');
    },45000);
    let out='',err='';
    child.stdout.on('data',x=>out+=x); child.stderr.on('data',x=>err+=x);
    child.on('error',error=>{clearTimeout(timeout);reject(error);});
    child.on('close',code=>{
      clearTimeout(timeout);
      if(code!==0) return reject(new Error(`${err}\n${out}`));
      try { resolve(JSON.parse(out).rows ?? []); } catch { reject(new Error('Invalid CLI JSON result')); }
    });
  });
}
if(process.argv.includes('--activate-rpc')) {
  // One targeted migration and its history entry commit together. Never db push
  // unrelated pending migrations. Queue lock excludes concurrent claims during DDL.
  await query(`begin; set local lock_timeout='3s'; set local statement_timeout='20s';
    lock table public.notification_outbox in share row exclusive mode;
    do $pre$ begin
      if exists(select 1 from public.notification_outbox where status='processing') then raise exception 'Drain workers first'; end if;
      if not exists(select 1 from supabase_migrations.schema_migrations where version='20260901130258') then raise exception 'Email migration missing'; end if;
      if exists(select 1 from supabase_migrations.schema_migrations where version='${version}') then raise exception 'Already applied; omit activation flag'; end if;
      if to_regprocedure('public.mark_notification_result(bigint,boolean,text)') is null then raise exception 'Unexpected previous RPC'; end if;
    end $pre$;
    ${migration}
    insert into supabase_migrations.schema_migrations(version,name,statements)
    values('${version}','${name}',array[$source$${migration}$source$]);
    notify pgrst,'reload schema'; commit;`);
  console.log('APPLIED: targeted fenced RPC + migration history; polling remains disabled.');
}
await query(`do $$ begin
  if to_regprocedure('public.mark_notification_result(bigint,boolean,text)') is not null
    or to_regprocedure('public.mark_notification_result(bigint,text,integer,boolean,text)') is null then raise exception 'Fenced RPC required'; end if;
  if not exists(select 1 from supabase_migrations.schema_migrations where version='${version}') then raise exception 'Migration history missing'; end if;
end $$;`);
const baseline=(await query('select md5(coalesce(jsonb_agg(to_jsonb(n) order by id)::text,\'[]\')) as digest from public.notification_outbox n;'))[0].digest;
let created=false;
const pending=[];
try {
  await query(`do $$ declare e uuid; u uuid; begin
    if exists(select 1 from public.notification_outbox where id=${id} or next_attempt_at='-infinity'::timestamptz or status='processing') then raise exception 'Queue not safe for rehearsal'; end if;
    select ev.id,usr.id into e,u from public.job_events ev cross join auth.users usr
      where usr.email='u3-customer@orkestra.example'
      and not exists(select 1 from public.notification_outbox n where n.event_id=ev.id and n.recipient_id=usr.id and n.channel='email') limit 1;
    if e is null then raise exception 'No test recipient/event pair'; end if;
    insert into public.notification_outbox(id,event_id,recipient_id,channel,payload,status,attempts,worker_id,updated_at,next_attempt_at)
    overriding system value values(${id},e,u,'email',jsonb_build_object('rehearsal','${run}'),'processing',1,'old-worker',now()-interval '6 minutes','-infinity');
  end $$;`);
  created=true;
  // Independent Management API requests become distinct backend transactions.
  // B performs the real claim and holds the row lock briefly while A submits
  // the stale result in a separate database transaction.
  for(const [index,outcome,sameOwner] of [[0,true,false]]) {
    const owner=sameOwner?'old-worker':'new-worker';
    await query(`update public.notification_outbox set status='processing',attempts=1,worker_id='old-worker',updated_at=now()-interval '6 minutes',next_attempt_at='-infinity',sent_at=null,last_error=null where ${fixtureGuard};`);
    const bName=`${tag}-b${index}`,aName=`${tag}-a${index}`;
    const b=query(`begin; set local application_name='${bName}'; set local statement_timeout='25s'; set local lock_timeout='3s';
      do $$ declare n integer; begin
        select count(*) into n from public.claim_email_notification_batch('${owner}',1) where id=${id};
        if n<>1 then raise exception 'Fixture not claimed'; end if;
      end $$;
      do $$ begin perform pg_sleep(2); end $$; commit; select 1 as completed;`).then(()=>({ok:true}),error=>({error}));
    pending.push(b);
    await delay(350);
    const a=query(`begin; set local application_name='${aName}'; set local statement_timeout='22s'; set local lock_timeout='20s';
      set local role service_role;
      do $$ declare rejected boolean:=false; begin
        begin perform public.mark_notification_result(${id},'old-worker',1,${outcome},'late result');
        exception when sqlstate 'P0001' then
          if sqlerrm<>'Notification lease is no longer owned' then raise; end if;
          rejected:=true;
        end;
        if not rejected then raise exception 'Stale acknowledgement accepted'; end if;
      end $$; commit;`).then(()=>({ok:true}),error=>({error}));
    pending.push(a);
    const results=await Promise.all([a,b]);
    for(const result of results) if(result.error) throw result.error;
    await query(`do $$ begin
      if not exists(select 1 from public.notification_outbox where ${fixtureGuard} and status='processing' and worker_id='${owner}' and attempts=2 and sent_at is null and last_error is null) then raise exception 'Stale result changed takeover row'; end if;
    end $$;
    set local role service_role;
    select id,status from public.mark_notification_result(${id},'${owner}',2,true,null);`);
    console.log(`PASS race ${index}: separate transaction claim/ack overlap; stale ${outcome?'success':'failure'} rejected; same owner=${sameOwner}; current owner acknowledged.`);
  }
} finally {
  await Promise.all(pending);
  // Also clean up after uncertain setup response; only this exact run may be removed.
  await query(`delete from public.notification_outbox where ${fixtureGuard};`);
  const rows=await query(`select exists(select 1 from public.notification_outbox where ${fixtureGuard}) as remains, md5(coalesce(jsonb_agg(to_jsonb(n) order by id)::text,'[]')) as digest from public.notification_outbox n;`);
  if(rows[0].remains || rows[0].digest!==baseline) throw new Error('Cleanup or unrelated queue integrity check failed');
  console.log(`PASS: fixture cleanup and unrelated queue digest (${created?'fixture created':'setup incomplete'}).`);
}
