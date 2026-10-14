import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { assertStagingTarget } from './staging-target.mjs';

const root = process.cwd();
const local = parseEnv(readFileSync(join(root, '.env.e2e.local'), 'utf8'));
assertStagingTarget(local, { writes: false });
for (const name of ['E2E_ADMIN_EMAIL', 'E2E_ADMIN_PASSWORD']) {
  if (!local[name]) throw new Error(`Missing ${name}`);
}
const key = process.env.E2E_SUPABASE_KEY?.trim();
if (!key?.startsWith('sb_publishable_')) throw new Error('A current staging publishable key is required in E2E_SUPABASE_KEY.');
const env = {
  ...process.env,
  ...local,
  NEXT_PUBLIC_SUPABASE_URL: local.E2E_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: key,
  E2E_SUPABASE_KEY: key,
};
function run(args, environment = env) {
  return spawnSync(process.execPath, args, { cwd: root, env: environment, stdio: 'inherit', windowsHide: true }).status ?? 1;
}
let code = 1;
try {
  if (run(['scripts/run-vinext.mjs', 'build']) !== 0) throw new Error('Operations visual staging build failed.');
  code = run(['scripts/run-project-tool.mjs', 'playwright', 'test', '--config', 'playwright.operations-visual.config.ts']);
} finally {
  console.log('Restoring normal local build without staging credentials.');
  if (run(['scripts/run-vinext.mjs', 'build'], process.env) !== 0) code = 1;
}
process.exitCode = code;
