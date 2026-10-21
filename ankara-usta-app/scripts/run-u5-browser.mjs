import {readFileSync} from 'node:fs';
import {parseEnv} from 'node:util';
import {spawnSync} from 'node:child_process';
import {join} from 'node:path';
import {assertStagingTarget} from './staging-target.mjs';

const root = process.cwd();
const local = parseEnv(readFileSync(join(root, '.env.e2e.local'), 'utf8'));
const baseEnv = {...process.env, ...local, E2E_ALLOW_STAGING_WRITES: process.env.E2E_ALLOW_STAGING_WRITES};
assertStagingTarget(baseEnv, {writes: false});

for (const name of [
  'E2E_CUSTOMER_EMAIL', 'E2E_CUSTOMER_PASSWORD',
  'E2E_TRADESPERSON_EMAIL', 'E2E_TRADESPERSON_PASSWORD',
]) {
  if (!local[name]) throw new Error(`Missing ${name}`);
}

function isPublishable(value) {
  return typeof value === 'string' && value.length > 20 && !value.startsWith('sb_secret_');
}
function isSecret(value) {
  return typeof value === 'string' && value.length > 20
    && (value.startsWith('sb_secret_') || value.startsWith('eyJ'));
}

const key = process.env.E2E_SUPABASE_KEY?.trim();
const secret = process.env.E2E_SUPABASE_SERVICE_ROLE_KEY?.trim();
if (!isPublishable(key)) throw new Error('U5 requires E2E_SUPABASE_KEY as a process secret.');
if (!isSecret(secret)) throw new Error('U5 requires E2E_SUPABASE_SERVICE_ROLE_KEY as a process secret.');

const probe = await fetch(`${local.E2E_SUPABASE_URL}/rest/v1/tradesperson_profiles?select=user_id&limit=1`, {
  headers: {apikey: secret},
});
if (!probe.ok) throw new Error(`Staging secret API key probe failed (${probe.status}).`);

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
  if (run(['scripts/run-vinext.mjs', 'build']) !== 0) throw new Error('U5 staging build failed.');
  code = run(['scripts/run-project-tool.mjs', 'playwright', 'test', '--config', 'playwright.u5.config.ts']);
} finally {
  console.log('Restoring normal local build without staging credentials.');
  if (run(['scripts/run-vinext.mjs', 'build'], process.env) !== 0) code = 1;
}
process.exitCode = code;
