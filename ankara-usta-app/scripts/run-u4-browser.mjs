import {readFileSync} from 'node:fs';
import {parseEnv} from 'node:util';
import {spawnSync} from 'node:child_process';
import {join} from 'node:path';
import {assertStagingTarget} from './staging-target.mjs';

const root = process.cwd();
const local = parseEnv(readFileSync(join(root, '.env.e2e.local'), 'utf8'));
const ref = local.E2E_STAGING_PROJECT_REF;
const baseEnv = {...process.env, ...local, E2E_ALLOW_STAGING_WRITES: process.env.E2E_ALLOW_STAGING_WRITES};
assertStagingTarget(baseEnv);
for (const name of ['E2E_CUSTOMER_EMAIL', 'E2E_CUSTOMER_PASSWORD', 'E2E_SECOND_CUSTOMER_EMAIL', 'E2E_SECOND_CUSTOMER_PASSWORD']) {
  if (!local[name]) throw new Error(`Missing ${name}`);
}

const cli = join(root, 'node_modules', 'supabase', 'dist', 'supabase.js');
const lookup = spawnSync(process.execPath, [cli, 'projects', 'api-keys', '--project-ref', ref, '--output', 'json'], {
  cwd: root,
  encoding: 'utf8',
  windowsHide: true,
});
if (lookup.status !== 0) throw new Error('Staging API keys unavailable.');
const parsed = JSON.parse(lookup.stdout);
const keys = Array.isArray(parsed) ? parsed : parsed.api_keys ?? parsed.keys;
const key = keys.find(item => item.type === 'publishable')?.api_key ?? keys.find(item => item.name === 'anon')?.api_key;
const secret = keys.find(item => item.name === 'service_role')?.api_key ?? keys.find(item => item.type === 'secret')?.api_key;
if (!key || key.startsWith('sb_secret_')) throw new Error('Invalid staging public key.');
if (!secret || (!secret.startsWith('eyJ') && !secret.startsWith('sb_secret_'))) throw new Error('Invalid staging secret key.');

const env = {
  ...baseEnv,
  NEXT_PUBLIC_SUPABASE_URL: local.E2E_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: key,
  E2E_SUPABASE_KEY: key,
  E2E_SUPABASE_SERVICE_ROLE_KEY: secret,
  REQUIRE_AUTH_E2E: 'true',
  ORKESTRA_DIRECT_REQUESTS_ENABLED: 'true',
};
function run(args, environment = env) {
  return spawnSync(process.execPath, args, {cwd: root, env: environment, stdio: 'inherit', windowsHide: true}).status ?? 1;
}

let code = 1;
try {
  if (run(['scripts/run-vinext.mjs', 'build']) !== 0) throw new Error('U4 staging build failed.');
  code = run(['scripts/run-project-tool.mjs', 'playwright', 'test', '--config', 'playwright.u4.config.ts']);
} finally {
  console.log('Restoring normal local build without staging credentials.');
  if (run(['scripts/run-vinext.mjs', 'build'], process.env) !== 0) code = 1;
}
process.exitCode = code;
