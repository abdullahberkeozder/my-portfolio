import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {parseEnv} from 'node:util';
import {spawnSync} from 'node:child_process';
import {assertStagingTarget} from './staging-target.mjs';

const root=process.cwd();
const cli=join(root,'node_modules','supabase','dist','supabase.js');
const local=parseEnv(readFileSync(join(root,'.env.e2e.local'),'utf8'));
const env={...process.env,...local,E2E_ALLOW_STAGING_WRITES:process.env.E2E_ALLOW_STAGING_WRITES};
assertStagingTarget(env);

for(const name of ['E2E_CUSTOMER_EMAIL','E2E_CUSTOMER_PASSWORD','E2E_SECOND_TRADESPERSON_EMAIL','E2E_SECOND_TRADESPERSON_PASSWORD']){
  if(!env[name])throw new Error(`Missing ${name}`);
}

const lookup=spawnSync(process.execPath,[cli,'projects','api-keys','--project-ref',env.E2E_STAGING_PROJECT_REF,'--output','json'],{cwd:root,encoding:'utf8',windowsHide:true});
if(lookup.status!==0)throw new Error('Staging public key unavailable.');
const parsed=JSON.parse(lookup.stdout);
const keys=Array.isArray(parsed)?parsed:parsed.api_keys??parsed.keys;
const publicKey=keys.find(key=>key.type==='publishable')?.api_key??keys.find(key=>key.name==='anon')?.api_key;
if(!publicKey||publicKey.startsWith('sb_secret_'))throw new Error('Invalid staging public key.');

const childEnv={...env,E2E_SUPABASE_KEY:publicKey,E2E_GOLDEN_TRADESPERSON_EMAIL:env.E2E_SECOND_TRADESPERSON_EMAIL,E2E_GOLDEN_TRADESPERSON_PASSWORD:env.E2E_SECOND_TRADESPERSON_PASSWORD};
function run(args){return spawnSync(process.execPath,args,{cwd:root,env:childEnv,stdio:'inherit',windowsHide:true}).status??1;}
function cleanup(){return run([cli,'db','query','--linked','--project-ref',env.E2E_STAGING_PROJECT_REF,'--file',join(root,'supabase','tests','remote','p1_musluk_cleanup.sql'),'--yes']);}

let code=1;
try{
  if(cleanup()!==0)throw new Error('Pre-run P1 Musluk fixture cleanup failed.');
  code=run([join(root,'scripts','test-marketplace-journey.mjs')]);
}finally{
  if(cleanup()!==0)code=1;
}
process.exitCode=code;
