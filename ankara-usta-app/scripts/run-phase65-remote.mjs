import { spawn, spawnSync } from 'node:child_process';
import { join } from 'node:path';
import {readFileSync} from 'node:fs';
import {parseEnv} from 'node:util';
import {assertStagingTarget} from './staging-target.mjs';

const root = process.cwd();
const cli = join(root, 'node_modules', 'supabase', 'dist', 'supabase.js');
const sqlRoot = join(root, 'supabase', 'tests', 'remote');
const staging=parseEnv(readFileSync(join(root,'.env.e2e.local'),'utf8'));
assertStagingTarget({...staging,E2E_ALLOW_STAGING_WRITES:process.env.E2E_ALLOW_STAGING_WRITES});
const projectRef=staging.E2E_STAGING_PROJECT_REF;

const keyLookup=spawnSync(process.execPath,[cli,'projects','api-keys','--project-ref',projectRef,'--reveal','--output','json'],{
  cwd:root,encoding:'utf8',windowsHide:true,
});
if(keyLookup.status!==0)throw new Error('Staging API keys are unavailable.');
const parsedKeys=JSON.parse(keyLookup.stdout);
const keys=Array.isArray(parsedKeys)?parsedKeys:parsedKeys.api_keys??parsedKeys.keys;
const publicKey=keys.find(key=>key.type==='publishable')?.api_key??keys.find(key=>key.name==='anon')?.api_key;
const serviceKey=keys.find(key=>key.name==='service_role')?.api_key??keys.find(key=>key.type==='secret')?.api_key;
if(!publicKey||!serviceKey)throw new Error('Staging public/service keys are unavailable.');

function query(file, {showOutput = true} = {}) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [cli, 'db', 'query', '--linked', '--project-ref', projectRef, '--file', join(sqlRoot, file), '--yes'], {
      cwd: root,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('close', (code) => {
      if (showOutput && stdout.trim()) process.stdout.write(stdout);
      if (showOutput && stderr.trim()) process.stderr.write(stderr);
      resolve({code: code ?? 1, stdout, stderr});
    });
  });
}

function requireSuccess(result, label) {
  if (result.code !== 0) {
    throw new Error(`${label} failed\n${result.stdout}\n${result.stderr}`);
  }
}

requireSuccess(await query('r2_cleanup_orphans.sql'), 'Previous R2 fixture cleanup');
requireSuccess(await query('phase65_hardening.sql'), 'Phase 6.5 hardening suite');

const concurrency=spawnSync(process.execPath,[join(root,'scripts','run-phase65-data-concurrency.mjs')],{
  cwd:root,stdio:'inherit',windowsHide:true,
  env:{...process.env,...staging,E2E_ALLOW_STAGING_WRITES:'true',E2E_SUPABASE_KEY:publicKey,E2E_SUPABASE_SERVICE_ROLE_KEY:serviceKey},
});
const cleanup=query('r2_cleanup_orphans.sql');
if(concurrency.status!==0){await cleanup;throw new Error('Data API concurrency suite failed.');}
requireSuccess(await cleanup,'Post-run R2 fixture cleanup');
