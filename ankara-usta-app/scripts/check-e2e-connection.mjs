import {readFileSync} from 'node:fs';
import {parseEnv} from 'node:util';
import {spawnSync} from 'node:child_process';
import {createClient} from '@supabase/supabase-js';

// Deliberately never loads or rewrites .env.local or the linked project.
const env = parseEnv(readFileSync(new URL('../.env.e2e.local',import.meta.url),'utf8'));
const ref = 'hyuijuafuayzultbjvjb';
if (env.E2E_STAGING_PROJECT_REF !== ref || env.E2E_SUPABASE_URL !== `https://${ref}.supabase.co`) {
  throw new Error('Only the approved orkestra-e2e project is allowed.');
}
const result = spawnSync(process.execPath,['node_modules/supabase/dist/supabase.js','projects','api-keys','--project-ref',ref,'--output','json'],{encoding:'utf8',windowsHide:true});
if (result.status !== 0) throw new Error('Unable to read staging publishable key through the authenticated CLI.');
const parsed = JSON.parse(result.stdout);
const rows = Array.isArray(parsed) ? parsed : parsed.api_keys ?? parsed.keys;
const key = rows?.find(row=>row.type==='publishable')?.api_key ?? rows?.find(row=>row.name==='anon')?.api_key;
if (!key || key.startsWith('sb_secret_')) throw new Error('No public client key found.');
if (!key.startsWith('sb_publishable_')) {
  const claims=JSON.parse(Buffer.from(key.split('.')[1],'base64url').toString());
  if(claims.role!=='anon'||claims.ref!==ref) throw new Error('Not a staging anonymous client key.');
}
const makeClient=()=>createClient(env.E2E_SUPABASE_URL,key,{auth:{persistSession:false,autoRefreshToken:false}});
const publicClient=makeClient();
const {count,error}=await publicClient.from('tradesperson_profiles').select('user_id',{count:'exact',head:true}).eq('application_status','approved');
if(error) throw new Error(`Staging directory read failed (${error.code}).`);
console.log(`PASS: isolated public connection; ${count} approved profiles visible.`);
const missing=['CUSTOMER','SECOND_CUSTOMER','TRADESPERSON','ADMIN'].flatMap(role=>['EMAIL','PASSWORD'].map(field=>`E2E_${role}_${field}`)).filter(name=>!env[name]);
if(missing.length) {
  console.error(`BLOCKED: missing ${missing.join(', ')}. No passwords changed; no account tests skipped.`);
  process.exitCode=1;
} else {
  for(const role of ['CUSTOMER','SECOND_CUSTOMER','TRADESPERSON','ADMIN']) {
    const client=makeClient();
    const {error:authError}=await client.auth.signInWithPassword({email:env[`E2E_${role}_EMAIL`],password:env[`E2E_${role}_PASSWORD`]});
    if(authError) throw new Error(`${role} sign-in failed (${authError.code ?? authError.status}).`);
    const {error:signoutError}=await client.auth.signOut({scope:'local'});
    if(signoutError) throw new Error(`${role} test session cleanup failed.`);
    console.log(`PASS: ${role} sign-in and local sign-out.`);
  }
}
