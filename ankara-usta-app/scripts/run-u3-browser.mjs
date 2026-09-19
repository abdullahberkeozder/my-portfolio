import {readFileSync} from 'node:fs';
import {parseEnv} from 'node:util';
import {spawnSync} from 'node:child_process';
const ref='hyuijuafuayzultbjvjb';
const local=parseEnv(readFileSync('.env.e2e.local','utf8'));
if(local.E2E_STAGING_PROJECT_REF!==ref||local.E2E_SUPABASE_URL!==`https://${ref}.supabase.co`) throw new Error('Wrong test target.');
for(const name of ['E2E_CUSTOMER_EMAIL','E2E_CUSTOMER_PASSWORD','E2E_SECOND_CUSTOMER_EMAIL','E2E_SECOND_CUSTOMER_PASSWORD']) if(!local[name]) throw new Error(`Missing ${name}`);
const lookup=spawnSync(process.execPath,['node_modules/supabase/dist/supabase.js','projects','api-keys','--project-ref',ref,'--output','json'],{encoding:'utf8',windowsHide:true});
if(lookup.status!==0) throw new Error('Staging public key unavailable.');
const data=JSON.parse(lookup.stdout); const rows=Array.isArray(data)?data:data.api_keys??data.keys;
const key=rows.find(k=>k.type==='publishable')?.api_key??rows.find(k=>k.name==='anon')?.api_key;
if(!key||key.startsWith('sb_secret_')) throw new Error('Invalid public key.');
const env={...process.env,...local,NEXT_PUBLIC_SUPABASE_URL:local.E2E_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:key,E2E_SUPABASE_KEY:key,ORKESTRA_DIRECT_REQUESTS_ENABLED:'true'};
function run(args,environment){return spawnSync(process.execPath,args,{env:environment,stdio:'inherit',windowsHide:true}).status??1;}
let code=1;
try {
  if(run(['scripts/run-vinext.mjs','build'],env)!==0) throw new Error('Staging build failed.');
  code=run(['scripts/run-project-tool.mjs','playwright','test','--config','playwright.u3.config.ts'],env);
} finally {
  console.log('Restoring normal local build without test credentials.');
  if(run(['scripts/run-vinext.mjs','build'],process.env)!==0) code=1;
}
process.exitCode=code;
