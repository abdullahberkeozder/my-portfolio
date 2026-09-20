import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {parseEnv} from 'node:util';
import {spawnSync} from 'node:child_process';
import {assertStagingTarget} from './staging-target.mjs';

const root=process.cwd();const cli=join(root,'node_modules','supabase','dist','supabase.js');
const local=parseEnv(readFileSync(join(root,'.env.e2e.local'),'utf8'));
const env={...process.env,...local,E2E_ALLOW_STAGING_WRITES:process.env.E2E_ALLOW_STAGING_WRITES};assertStagingTarget(env);
const lookup=spawnSync(process.execPath,[cli,'projects','api-keys','--project-ref',env.E2E_STAGING_PROJECT_REF,'--output','json'],{cwd:root,encoding:'utf8',windowsHide:true});
if(lookup.status!==0)throw new Error('Staging public key unavailable.');
const parsed=JSON.parse(lookup.stdout);const keys=Array.isArray(parsed)?parsed:parsed.api_keys??parsed.keys;
const publicKey=keys.find(key=>key.type==='publishable')?.api_key??keys.find(key=>key.name==='anon')?.api_key;
if(!publicKey||publicKey.startsWith('sb_secret_'))throw new Error('Invalid staging public key.');
const childEnv={...env,E2E_SUPABASE_KEY:publicKey};
function run(args,options={}){return spawnSync(process.execPath,args,{cwd:root,env:childEnv,stdio:options.capture?'pipe':'inherit',encoding:options.capture?'utf8':undefined,windowsHide:true});}
function cleanup(){const result=run([cli,'db','query','--linked','--project-ref',env.E2E_STAGING_PROJECT_REF,'--file',join(root,'supabase','tests','remote','r2_m2_m4_cleanup.sql'),'--yes']);if(result.status!==0)throw new Error('M2-M4 fixture cleanup failed.');}
cleanup();
let result;
try{result=run([join(root,'scripts','run-r2-m2-m4.mjs')]);if(result.status!==0)throw new Error('M2-M4 contract suite failed.');}
finally{cleanup();}
