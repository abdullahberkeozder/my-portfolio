import { spawn } from 'node:child_process';
import { join } from 'node:path';

const root = process.cwd();
const cli = join(root, 'node_modules', 'supabase', 'dist', 'supabase.js');
const sqlRoot = join(root, 'supabase', 'tests', 'remote');

function query(file, {showOutput = true} = {}) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [cli, 'db', 'query', '--linked', '--file', join(sqlRoot, file), '--yes'], {
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

let fixtureCreated = false;
try {
  requireSuccess(await query('phase65_hardening.sql'), 'Phase 6.5 hardening suite');
  requireSuccess(await query('phase65_concurrency_setup.sql'), 'Concurrency fixture setup');
  fixtureCreated = true;

  const draftResults = await Promise.all([
    query('phase65_concurrent_draft.sql', {showOutput: false}),
    query('phase65_concurrent_draft.sql', {showOutput: false}),
  ]);
  if (!draftResults.every((result) => result.code === 0)) {
    throw new Error(`Both idempotent draft upserts must succeed: ${draftResults.map((result) => result.code).join(', ')}\n${draftResults.map((result,index) => `draft-${index+1}:\n${result.stdout}\n${result.stderr}`).join('\n')}`);
  }
  console.log('Concurrent idempotent draft upserts: 2/2 succeeded');

  const acceptanceResults = await Promise.all([
    query('phase65_concurrent_quote_accept.sql', {showOutput: false}),
    query('phase65_concurrent_quote_accept.sql', {showOutput: false}),
  ]);
  const successfulAcceptances = acceptanceResults.filter((result) => result.code === 0).length;
  if (successfulAcceptances !== 1) {
    throw new Error(`Exactly one parallel quote acceptance must succeed; observed ${successfulAcceptances}\n${acceptanceResults.map((result,index) => `accept-${index+1}:\n${result.stdout}\n${result.stderr}`).join('\n')}`);
  }
  console.log('Parallel quote acceptance: exactly 1/2 succeeded');

  requireSuccess(await query('phase65_concurrency_verify.sql'), 'Concurrency invariant verification');
} finally {
  if (fixtureCreated) {
    const cleanup = await query('phase65_concurrency_cleanup.sql');
    if (cleanup.code !== 0) process.exitCode = 1;
  }
}
