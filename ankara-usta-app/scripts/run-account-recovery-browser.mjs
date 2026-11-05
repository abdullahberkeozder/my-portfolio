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
for (const name of ['E2E_CUSTOMER_EMAIL', 'E2E_CUSTOMER_PASSWORD']) {
  if (!local[name]) throw new Error(`Missing ${name}`);
}

function isPublishable(value) {
  return typeof value === 'string' && value.length > 20 && !value.startsWith('sb_secret_');
}

function isSecret(value) {
  return typeof value === 'string' && value.length > 20
    && (value.startsWith('sb_secret_') || value.startsWith('eyJ'));
}

let key = process.env.E2E_SUPABASE_KEY;
let secret = process.env.E2E_SUPABASE_SERVICE_ROLE_KEY;

// Prefer process-injected secrets so local runs never need to write keys to a
// file and do not depend on Supabase CLI telemetry/profile state. Keep the CLI
// lookup as a convenience fallback for already-configured developer machines.
if (!isPublishable(key) || !isSecret(secret)) {
  const cli = join(root, 'node_modules', 'supabase', 'dist', 'supabase.js');
  const lookup = spawnSync(process.execPath, [cli, 'projects', 'api-keys', '--project-ref', ref, '--output', 'json'], {
    cwd: root,
    encoding: 'utf8',
    windowsHide: true,
  });
  if (lookup.status !== 0) throw new Error('Staging API keys unavailable. Provide E2E_SUPABASE_KEY and E2E_SUPABASE_SERVICE_ROLE_KEY as process secrets.');
  const parsed = JSON.parse(lookup.stdout);
  const keys = Array.isArray(parsed) ? parsed : parsed.api_keys ?? parsed.keys;
  key = keys.find(item => item.type === 'publishable')?.api_key ?? keys.find(item => item.name === 'anon')?.api_key;
  // Auth Admin on this staging project still requires the JWT service_role
  // credential. Keep the modern secret key for worker/PostgREST paths, but use
  // the explicitly re-enabled legacy key only for this isolated recovery E2E.
  secret = keys.find(item => item.name === 'service_role')?.api_key
    ?? keys.find(item => item.type === 'secret')?.api_key;
}
if (!isPublishable(key)) throw new Error('Invalid staging public key.');
if (!isSecret(secret)) throw new Error('Invalid staging secret key.');

async function assertAuthAdminAccess() {
  const headers = {apikey: secret};
  if (secret.startsWith('eyJ')) headers.Authorization = `Bearer ${secret}`;
  const response = await fetch(`${local.E2E_SUPABASE_URL}/auth/v1/admin/users?limit=1`, {
    headers,
  });
  if (response.ok) return;
  throw new Error(`Staging Auth Admin is unavailable for the configured secret key (HTTP ${response.status}). Enable an approved isolated Auth Admin credential before running account-recovery E2E.`);
}

await assertAuthAdminAccess();

const env = {
  ...baseEnv,
  NEXT_PUBLIC_SUPABASE_URL: local.E2E_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: key,
  E2E_SUPABASE_KEY: key,
  E2E_SUPABASE_SERVICE_ROLE_KEY: secret,
  REQUIRE_AUTH_E2E: 'true',
};
function run(args, environment = env) {
  return spawnSync(process.execPath, args, {cwd: root, env: environment, stdio: 'inherit', windowsHide: true}).status ?? 1;
}

let code = 1;
try {
  if (run(['scripts/run-vinext.mjs', 'build']) !== 0) throw new Error('Account recovery staging build failed.');
  code = run(['scripts/run-project-tool.mjs', 'playwright', 'test', '--config', 'playwright.account-recovery.config.ts']);
} finally {
  console.log('Restoring normal local build without staging credentials.');
  if (run(['scripts/run-vinext.mjs', 'build'], process.env) !== 0) code = 1;
}
process.exitCode = code;
