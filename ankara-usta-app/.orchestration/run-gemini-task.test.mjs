import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  runGeminiTask,
  validateTask,
  acquireLock,
  releaseLock,
  takeFilesystemSnapshot,
  compareSnapshots,
  checkRuntimeVersion,
  redactCredentials,
  parseAgentReport
} from './run-gemini-task.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FAKE_AGY_PATH = path.resolve(__dirname, 'fixtures', 'fake-agy.mjs');

function createTestProject() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agy-runner-test-'));
  const canonicalRoot = fs.realpathSync(tmpDir);

  // Create monitored roots
  fs.mkdirSync(path.join(canonicalRoot, 'app'), { recursive: true });
  fs.mkdirSync(path.join(canonicalRoot, 'scripts'), { recursive: true });
  fs.mkdirSync(path.join(canonicalRoot, 'tests'), { recursive: true });
  fs.mkdirSync(path.join(canonicalRoot, 'services'), { recursive: true });
  fs.mkdirSync(path.join(canonicalRoot, 'supabase'), { recursive: true });
  fs.mkdirSync(path.join(canonicalRoot, '.orchestration'), { recursive: true });

  // Create a root package.json
  fs.writeFileSync(path.join(canonicalRoot, 'package.json'), JSON.stringify({ name: 'test-project' }));

  return canonicalRoot;
}

function cleanEnv() {
  delete process.env.FAKE_AGY_SCENARIO;
  delete process.env.FAKE_AGY_WRITE_FILE;
  delete process.env.FAKE_AGY_WRITE_CONTENT;
  delete process.env.FAKE_AGY_CHECK_CMD;
  delete process.env.FAKE_AGY_CONV_ID;
  delete process.env.FAKE_AGY_REQUIRE_AUTO_APPROVE;
}

test('1. Success needing review', async (t) => {
  const projectRoot = createTestProject();
  cleanEnv();
  t.after(() => {
    cleanEnv();
    fs.rmSync(projectRoot, { recursive: true, force: true });
  });

  process.env.FAKE_AGY_SCENARIO = 'success';
  process.env.FAKE_AGY_WRITE_FILE = path.join(projectRoot, 'app', 'allowed.txt');
  process.env.FAKE_AGY_WRITE_CONTENT = 'new feature content';
  process.env.FAKE_AGY_CHECK_CMD = 'npm run test';
  process.env.FAKE_AGY_CONV_ID = 'conv-success-01';

  const task = {
    id: 'TASK-001',
    objective: 'Implement feature in app/allowed.txt',
    allowedFiles: ['app/allowed.txt'],
    checks: ['npm run test'],
    readOnly: false
  };

  const result = await runGeminiTask(task, {
    projectRoot,
    agyBin: FAKE_AGY_PATH
  });

  assert.equal(result.status, 'needs_review');
  assert.equal(result.attempt, 1);
  assert.equal(result.conversationId, 'conv-success-01');
  assert.deepEqual(result.changedPaths, ['app/allowed.txt']);
  assert.equal(result.checkClaims.length, 1);
  assert.equal(result.checkClaims[0].passed, true);
  assert.ok(fs.existsSync(result.recordPath));
});

test('2. Zero-exit permission denial on stderr', async (t) => {
  const projectRoot = createTestProject();
  cleanEnv();
  t.after(() => {
    cleanEnv();
    fs.rmSync(projectRoot, { recursive: true, force: true });
  });

  process.env.FAKE_AGY_SCENARIO = 'zero_exit_permission_denied';

  const task = {
    id: 'TASK-002',
    objective: 'Read only check with perm denial',
    allowedFiles: [],
    checks: [],
    readOnly: true
  };

  const result = await runGeminiTask(task, {
    projectRoot,
    agyBin: FAKE_AGY_PATH
  });

  assert.equal(result.status, 'blocked');
  assert.ok(result.reasons.some((r) => r.includes('permission or authentication blocker')));
});

test('3. Blocked report from agent', async (t) => {
  const projectRoot = createTestProject();
  cleanEnv();
  t.after(() => {
    cleanEnv();
    fs.rmSync(projectRoot, { recursive: true, force: true });
  });

  process.env.FAKE_AGY_SCENARIO = 'blocked_report';

  const task = {
    id: 'TASK-003',
    objective: 'Blocked task',
    allowedFiles: [],
    checks: [],
    readOnly: true
  };

  const result = await runGeminiTask(task, {
    projectRoot,
    agyBin: FAKE_AGY_PATH
  });

  assert.equal(result.status, 'blocked');
  assert.ok(result.reasons.some((r) => r.includes('Agent reported blocked')));
});

test('4. Missing and failing required checks cannot produce needs_review', async (t) => {
  const projectRoot = createTestProject();
  cleanEnv();
  t.after(() => {
    cleanEnv();
    fs.rmSync(projectRoot, { recursive: true, force: true });
  });

  // 4a. Missing check
  process.env.FAKE_AGY_SCENARIO = 'missing_check';
  const taskA = {
    id: 'TASK-004A',
    objective: 'Task with missing check',
    allowedFiles: [],
    checks: ['npm run required-check'],
    readOnly: true
  };

  const resultA = await runGeminiTask(taskA, {
    projectRoot,
    agyBin: FAKE_AGY_PATH
  });

  assert.equal(resultA.status, 'failed');
  assert.ok(resultA.reasons.some((r) => r.includes('Required check missing')));

  // 4b. Failing check
  process.env.FAKE_AGY_SCENARIO = 'failing_check';
  process.env.FAKE_AGY_CHECK_CMD = 'npm run required-check';
  const taskB = {
    id: 'TASK-004B',
    objective: 'Task with failing check',
    allowedFiles: [],
    checks: ['npm run required-check'],
    readOnly: true
  };

  const resultB = await runGeminiTask(taskB, {
    projectRoot,
    agyBin: FAKE_AGY_PATH
  });

  assert.equal(resultB.status, 'failed');
  assert.ok(resultB.reasons.some((r) => r.includes('Required check failed')));
});

test('5. Malformed JSON envelope fails closed', async (t) => {
  const projectRoot = createTestProject();
  cleanEnv();
  t.after(() => {
    cleanEnv();
    fs.rmSync(projectRoot, { recursive: true, force: true });
  });

  process.env.FAKE_AGY_SCENARIO = 'malformed_json';

  const task = {
    id: 'TASK-005',
    objective: 'Malformed output test',
    allowedFiles: [],
    checks: [],
    readOnly: true
  };

  const result = await runGeminiTask(task, {
    projectRoot,
    agyBin: FAKE_AGY_PATH
  });

  assert.equal(result.status, 'failed');
  assert.ok(result.reasons.some((r) => r.includes('Failed to parse stdout as JSON envelope')));
});

test('6. Nonzero process exit code', async (t) => {
  const projectRoot = createTestProject();
  cleanEnv();
  t.after(() => {
    cleanEnv();
    fs.rmSync(projectRoot, { recursive: true, force: true });
  });

  process.env.FAKE_AGY_SCENARIO = 'nonzero_exit';

  const task = {
    id: 'TASK-006',
    objective: 'Nonzero exit test',
    allowedFiles: [],
    checks: [],
    readOnly: true
  };

  const result = await runGeminiTask(task, {
    projectRoot,
    agyBin: FAKE_AGY_PATH
  });

  assert.equal(result.status, 'failed');
  assert.ok(result.reasons.some((r) => r.includes('non-zero code')));
});

test('7. Process spawn error', async (t) => {
  const projectRoot = createTestProject();
  cleanEnv();
  t.after(() => {
    cleanEnv();
    fs.rmSync(projectRoot, { recursive: true, force: true });
  });

  const task = {
    id: 'TASK-007',
    objective: 'Spawn error test',
    allowedFiles: [],
    checks: [],
    readOnly: true
  };

  const result = await runGeminiTask(task, {
    projectRoot,
    agyBin: 'non-existent-executable-file-123456.exe'
  });

  assert.equal(result.status, 'failed');
  assert.ok(result.reasons.some((r) => r.includes('spawn') || r.includes('ENOENT')));
});

test('8. Process timeout and termination', async (t) => {
  const projectRoot = createTestProject();
  cleanEnv();
  t.after(() => {
    cleanEnv();
    fs.rmSync(projectRoot, { recursive: true, force: true });
  });

  process.env.FAKE_AGY_SCENARIO = 'timeout';

  const task = {
    id: 'TASK-008',
    objective: 'Timeout test',
    allowedFiles: [],
    checks: [],
    readOnly: true
  };

  const result = await runGeminiTask(task, {
    projectRoot,
    agyBin: FAKE_AGY_PATH,
    timeoutMs: 400
  });

  assert.equal(result.status, 'failed');
  assert.ok(result.reasons.some((r) => r.includes('timed out')));
});

test('9. Scope violation including already-dirty and untracked files', async (t) => {
  const projectRoot = createTestProject();
  cleanEnv();
  t.after(() => {
    cleanEnv();
    fs.rmSync(projectRoot, { recursive: true, force: true });
  });

  // Pre-existing dirty / untracked file
  fs.writeFileSync(path.join(projectRoot, 'app', 'dirty.txt'), 'pre-existing user work');

  process.env.FAKE_AGY_SCENARIO = 'scope_violation';

  const task = {
    id: 'TASK-009',
    objective: 'Scope violation test',
    allowedFiles: ['app/allowed.txt'],
    checks: ['check-1'],
    readOnly: false
  };

  const result = await runGeminiTask(task, {
    projectRoot,
    agyBin: FAKE_AGY_PATH
  });

  assert.equal(result.status, 'failed');
  assert.ok(result.reasons.some((r) => r.includes('Scope violation')));
  assert.ok(result.changedPaths.includes('unlisted-file.txt'));
  // Pre-existing dirty file was NOT modified, so not in changedPaths
  assert.ok(!result.changedPaths.includes('app/dirty.txt'));
  // Existing user work was preserved
  assert.equal(fs.readFileSync(path.join(projectRoot, 'app', 'dirty.txt'), 'utf8'), 'pre-existing user work');
});

test('10. Git index preservation detection in nested Git repository', async (t) => {
  // Keep the Git fixture inside the writable workspace. Some Windows sandbox
  // temp locations allow Node writes but deny git.exe's config write.
  const fixtureRoot = path.join(__dirname, 'runs', 'test-fixtures');
  fs.mkdirSync(fixtureRoot, { recursive: true });
  const parentDir = fs.mkdtempSync(path.join(fixtureRoot, 'agy-nested-repo-'));
  const canonicalParent = fs.realpathSync(parentDir);

  // Resolve Git explicitly on Windows; do not invoke a shell.
  const gitExecutable = process.platform === 'win32' && fs.existsSync('C:\\Program Files\\Git\\cmd\\git.exe')
    ? 'C:\\Program Files\\Git\\cmd\\git.exe'
    : 'git';
  const gitProbe = spawnSync(gitExecutable, ['--version'], {
    shell: false,
    windowsHide: true,
    encoding: 'utf8'
  });
  if (gitProbe.error || gitProbe.status !== 0) {
    fs.rmSync(parentDir, { recursive: true, force: true });
    t.skip(`Git unavailable: ${gitProbe.error?.message ?? gitProbe.stderr ?? gitProbe.status}`);
    return;
  }

  const gitInit = spawnSync(gitExecutable, ['init'], {
    cwd: canonicalParent,
    shell: false,
    windowsHide: true,
    encoding: 'utf8'
  });
  if (gitInit.error || gitInit.status !== 0) {
    fs.rmSync(parentDir, { recursive: true, force: true });
    t.skip(`Git fixture unavailable: ${gitInit.error?.message ?? gitInit.stderr ?? gitInit.status}`);
    return;
  }

  spawnSync(gitExecutable, ['config', 'user.email', 'test@example.com'], {
    cwd: canonicalParent,
    shell: false,
    windowsHide: true,
    stdio: 'ignore'
  });
  spawnSync(gitExecutable, ['config', 'user.name', 'Test User'], {
    cwd: canonicalParent,
    shell: false,
    windowsHide: true,
    stdio: 'ignore'
  });

  // Create an initial tracked file in the parent repo to create a deterministic Git index
  fs.writeFileSync(path.join(canonicalParent, 'parent-tracked.txt'), 'initial parent tracked content');
  const gitAdd = spawnSync(gitExecutable, ['add', 'parent-tracked.txt'], {
    cwd: canonicalParent,
    shell: false,
    windowsHide: true,
    encoding: 'utf8'
  });
  assert.equal(gitAdd.status, 0, `git add should succeed: ${gitAdd.stderr ?? gitAdd.error?.message ?? ''}`);

  // Create nested project directory inside parent repo (no .git folder here)
  const projectRoot = path.join(canonicalParent, 'nested-project');
  fs.mkdirSync(path.join(projectRoot, 'app'), { recursive: true });
  fs.mkdirSync(path.join(projectRoot, 'scripts'), { recursive: true });
  fs.mkdirSync(path.join(projectRoot, 'tests'), { recursive: true });
  fs.mkdirSync(path.join(projectRoot, 'services'), { recursive: true });
  fs.mkdirSync(path.join(projectRoot, 'supabase'), { recursive: true });
  fs.mkdirSync(path.join(projectRoot, '.orchestration'), { recursive: true });
  fs.writeFileSync(path.join(projectRoot, 'package.json'), JSON.stringify({ name: 'nested-project' }));

  cleanEnv();
  t.after(() => {
    cleanEnv();
    fs.rmSync(parentDir, { recursive: true, force: true });
  });

  // Verify takeFilesystemSnapshot from nested projectRoot resolves the Git index and computes deterministic signature
  const snapshotBefore = takeFilesystemSnapshot(projectRoot);
  assert.notEqual(snapshotBefore.gitIndexSignature, 'unavailable', 'Git index signature should be available in nested repo');
  assert.ok(snapshotBefore.gitIndexSignature, 'Git index signature object should be present');
  assert.equal(typeof snapshotBefore.gitIndexSignature.hash, 'string');
  assert.equal(snapshotBefore.gitIndexSignature.hash.length, 64);
  assert.ok(snapshotBefore.gitIndexSignature.size > 0);
  assert.equal(snapshotBefore.coverageLimitation, null);

  process.env.FAKE_AGY_SCENARIO = 'index_tamper';

  const task = {
    id: 'TASK-010',
    objective: 'Index tamper test in nested repo',
    allowedFiles: [],
    checks: ['check-1'],
    readOnly: true
  };

  const result = await runGeminiTask(task, {
    projectRoot,
    agyBin: FAKE_AGY_PATH
  });

  assert.equal(result.status, 'failed');
  assert.ok(result.reasons.some((r) => r.includes('Index preservation violation') || r.includes('Git index was modified')));
});

test('11. Lock contention and clean release', async (t) => {
  const projectRoot = createTestProject();
  t.after(() => {
    fs.rmSync(projectRoot, { recursive: true, force: true });
  });

  const lock1 = acquireLock(projectRoot, 'run-lock-1', 'T-LOCK');
  assert.ok(fs.existsSync(lock1.lockPath));

  // Second acquire must fail with ELOCKED
  assert.throws(
    () => acquireLock(projectRoot, 'run-lock-2', 'T-LOCK'),
    (err) => err.code === 'ELOCKED'
  );

  // Releasing with mismatched runId does NOT delete lock
  releaseLock({ lockPath: lock1.lockPath, runId: 'mismatched-run-id', pid: process.pid });
  assert.ok(fs.existsSync(lock1.lockPath));

  // Releasing with correct handle removes lock
  releaseLock(lock1);
  assert.ok(!fs.existsSync(lock1.lockPath));

  // Can acquire again
  const lock2 = acquireLock(projectRoot, 'run-lock-2', 'T-LOCK');
  assert.ok(fs.existsSync(lock2.lockPath));
  releaseLock(lock2);
});

test('12. Safe path and task argument validation', async (t) => {
  const projectRoot = createTestProject();
  t.after(() => {
    fs.rmSync(projectRoot, { recursive: true, force: true });
  });

  // Reject invalid task ID
  assert.throws(() => validateTask({ id: '../bad', objective: 'Obj', allowedFiles: [] }, projectRoot));
  assert.throws(() => validateTask({ id: 'foo/bar', objective: 'Obj', allowedFiles: [] }, projectRoot));
  assert.throws(() => validateTask({ id: '.hidden', objective: 'Obj', allowedFiles: [] }, projectRoot));
  assert.throws(() => validateTask({ id: '-leading-dash', objective: 'Obj', allowedFiles: [] }, projectRoot));

  // Reject path traversal in allowedFiles
  assert.throws(() => validateTask({
    id: 'T12',
    objective: 'Obj',
    allowedFiles: ['../outside.txt']
  }, projectRoot));

  // Reject absolute paths
  assert.throws(() => validateTask({
    id: 'T12',
    objective: 'Obj',
    allowedFiles: ['/etc/passwd']
  }, projectRoot));

  // Reject secret paths
  assert.throws(() => validateTask({
    id: 'T12',
    objective: 'Obj',
    allowedFiles: ['.env']
  }, projectRoot));
  assert.throws(() => validateTask({
    id: 'T12',
    objective: 'Obj',
    allowedFiles: ['app/.env.local']
  }, projectRoot));
  assert.throws(() => validateTask({
    id: 'T12',
    objective: 'Obj',
    allowedFiles: ['secrets/key.pem']
  }, projectRoot));

  // Reject readOnly with allowedFiles
  assert.throws(() => validateTask({
    id: 'T12',
    objective: 'Obj',
    allowedFiles: ['app/file.txt'],
    readOnly: true
  }, projectRoot));

  // Credential redaction helper check
  const textWithCreds = 'Error with Bearer ya29.123456789 and ghp_abcdefghijklmnop123456 and AIzaSyD12345678901234567890123456789012 and sb_secret_mySecretKey123456 and sk-proj-1234567890abcdef123456 and eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHclw_c_pQ4Lw_pQ4Lw and password="MyPassword123"';
  const redacted = redactCredentials(textWithCreds);
  assert.ok(!redacted.includes('ya29.123456789'));
  assert.ok(!redacted.includes('ghp_abcdefghijklmnop123456'));
  assert.ok(!redacted.includes('AIzaSyD12345678901234567890123456789012'));
  assert.ok(!redacted.includes('mySecretKey123456'));
  assert.ok(!redacted.includes('1234567890abcdef123456'));
  assert.ok(!redacted.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'));
  assert.ok(!redacted.includes('MyPassword123'));
  assert.ok(redacted.includes('[REDACTED]'));
  assert.ok(redacted.includes('sb_secret_[REDACTED]'));
  assert.ok(redacted.includes('sk-[REDACTED]'));

  // Runtime version helper check
  const rt = checkRuntimeVersion();
  assert.equal(typeof rt.supported, 'boolean');
});

test('13. Resume identity binding and max repair limit', async (t) => {
  const projectRoot = createTestProject();
  cleanEnv();
  t.after(() => {
    cleanEnv();
    fs.rmSync(projectRoot, { recursive: true, force: true });
  });

  const runsDir = path.join(projectRoot, '.orchestration', 'runs', 'run-test-prior');
  fs.mkdirSync(runsDir, { recursive: true });

  const priorRunRecord = {
    runId: 'run-test-prior',
    taskId: 'TASK-013',
    attempt: 1,
    projectRoot,
    model: 'gemini-3.8-flash-high',
    conversationId: 'conv-session-1234',
    cumulativeUsage: { input_tokens: 100, output_tokens: 30 }
  };

  const priorRunPath = path.join(runsDir, 'run.json');
  fs.writeFileSync(priorRunPath, JSON.stringify(priorRunRecord, null, 2));

  process.env.FAKE_AGY_SCENARIO = 'success';
  process.env.FAKE_AGY_CHECK_CMD = 'npm test';

  const task = {
    id: 'TASK-013',
    objective: 'Resume repair test',
    allowedFiles: [],
    checks: ['npm test'],
    readOnly: true
  };

  // Valid resume
  const resumedResult = await runGeminiTask(task, {
    projectRoot,
    agyBin: FAKE_AGY_PATH,
    resumeFrom: priorRunPath
  });

  assert.equal(resumedResult.status, 'needs_review');
  assert.equal(resumedResult.attempt, 2);
  assert.equal(resumedResult.conversationId, 'conv-session-1234');
  assert.ok(resumedResult.deltaUsage);

  // Resume exceeding max repairs (prior attempt already 2)
  const maxRepairsRecord = {
    ...priorRunRecord,
    attempt: 2
  };
  fs.writeFileSync(priorRunPath, JSON.stringify(maxRepairsRecord, null, 2));

  await assert.rejects(
    () => runGeminiTask(task, { projectRoot, agyBin: FAKE_AGY_PATH, resumeFrom: priorRunPath }),
    (err) => err.message.includes('Maximum repair attempts exceeded')
  );

  // Resume with mismatched task id
  const mismatchedTaskRecord = {
    ...priorRunRecord,
    taskId: 'TASK-OTHER'
  };
  fs.writeFileSync(priorRunPath, JSON.stringify(mismatchedTaskRecord, null, 2));

  await assert.rejects(
    () => runGeminiTask(task, { projectRoot, agyBin: FAKE_AGY_PATH, resumeFrom: priorRunPath }),
    (err) => err.message.includes('Resume task ID mismatch')
  );
});

test('14. Model pinning rejects differing overrides and enforces gemini-3.8-flash-high', async (t) => {
  const projectRoot = createTestProject();
  cleanEnv();
  t.after(() => {
    cleanEnv();
    fs.rmSync(projectRoot, { recursive: true, force: true });
  });

  const task = {
    id: 'TASK-014',
    objective: 'Model pinning test',
    allowedFiles: [],
    checks: [],
    readOnly: true
  };

  // Differing model override rejected
  await assert.rejects(
    () => runGeminiTask(task, { projectRoot, agyBin: FAKE_AGY_PATH, model: 'gemini-1.5-pro' }),
    (err) => err.message.includes('Model override rejected') && err.message.includes('gemini-3.8-flash-high')
  );

  await assert.rejects(
    () => runGeminiTask(task, { projectRoot, agyBin: FAKE_AGY_PATH, model: 'claude-3-5-sonnet' }),
    (err) => err.message.includes('Model override rejected')
  );

  // Exact pinned model is accepted and passed to agent
  process.env.FAKE_AGY_SCENARIO = 'success';
  const result = await runGeminiTask(task, {
    projectRoot,
    agyBin: FAKE_AGY_PATH,
    model: 'gemini-3.8-flash-high'
  });
  assert.equal(result.model, 'gemini-3.8-flash-high');
});

test('15. Credential redaction in summary, check outcomes, remaining risks, and reasons without persisting raw outputs', async (t) => {
  const projectRoot = createTestProject();
  cleanEnv();
  t.after(() => {
    cleanEnv();
    fs.rmSync(projectRoot, { recursive: true, force: true });
  });

  process.env.FAKE_AGY_SCENARIO = 'credentials_in_free_text';
  process.env.FAKE_AGY_CHECK_CMD = 'npm run test:auth';

  const task = {
    id: 'TASK-015',
    objective: 'Credential redaction test',
    allowedFiles: [],
    checks: ['npm run test:auth'],
    readOnly: true
  };

  const result = await runGeminiTask(task, {
    projectRoot,
    agyBin: FAKE_AGY_PATH
  });

  // Verify memory object agent report is redacted
  assert.ok(result.agentReport);
  assert.ok(!result.agentReport.summary.includes('N3v3rExpos3Th1sS3cr3tK3y'));
  assert.ok(!result.agentReport.summary.includes('1234567890abcdef123456'));
  assert.ok(result.agentReport.summary.includes('sb_secret_[REDACTED]'));
  assert.ok(result.agentReport.summary.includes('sk-[REDACTED]'));

  assert.equal(result.checkClaims.length, 1);
  assert.ok(!result.checkClaims[0].outcome.includes('testtoken12345'));
  assert.ok(!result.checkClaims[0].outcome.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'));
  assert.ok(result.checkClaims[0].outcome.includes('Bearer [REDACTED]'));
  assert.ok(result.checkClaims[0].outcome.includes('[REDACTED]'));

  assert.equal(result.agentReport.remaining_risks.length, 1);
  assert.ok(!result.agentReport.remaining_risks[0].includes('mySuperSecretPassword123'));
  assert.ok(result.agentReport.remaining_risks[0].includes('[REDACTED]'));

  // Verify persisted run.json on disk contains no raw secrets
  const rawDiskRecord = fs.readFileSync(result.recordPath, 'utf8');
  assert.ok(!rawDiskRecord.includes('N3v3rExpos3Th1sS3cr3tK3y'));
  assert.ok(!rawDiskRecord.includes('1234567890abcdef123456'));
  assert.ok(!rawDiskRecord.includes('testtoken12345'));
  assert.ok(!rawDiskRecord.includes('mySuperSecretPassword123'));
  assert.ok(!rawDiskRecord.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'));

  // Verify raw stdout, stderr, prompt, and env are NOT persisted
  const parsedDiskRecord = JSON.parse(rawDiskRecord);
  assert.equal(parsedDiskRecord.stdout, undefined);
  assert.equal(parsedDiskRecord.stderr, undefined);
  assert.equal(parsedDiskRecord.prompt, undefined);
  assert.equal(parsedDiskRecord.env, undefined);
});

test('16. Git index unavailable records gitIndexSignature unavailable and coverage limitation', async (t) => {
  const projectRoot = createTestProject();
  cleanEnv();
  t.after(() => {
    cleanEnv();
    fs.rmSync(projectRoot, { recursive: true, force: true });
  });

  // Snapshot on non-git directory returns gitIndexSignature: 'unavailable' and coverageLimitation
  const snapshot = takeFilesystemSnapshot(projectRoot);
  assert.equal(snapshot.gitIndexSignature, 'unavailable');
  assert.ok(typeof snapshot.coverageLimitation === 'string');
  assert.ok(snapshot.coverageLimitation.includes('Git index verification is unavailable'));

  process.env.FAKE_AGY_SCENARIO = 'success';
  const task = {
    id: 'TASK-016',
    objective: 'Git unavailable test',
    allowedFiles: [],
    checks: [],
    readOnly: true
  };

  const result = await runGeminiTask(task, {
    projectRoot,
    agyBin: FAKE_AGY_PATH
  });

  assert.equal(result.status, 'needs_review');
  assert.equal(result.gitIndexSignature, 'unavailable');
  assert.ok(result.coverageLimitation.includes('Git index verification is unavailable'));
  assert.ok(Array.isArray(result.coverageLimitations));
  assert.equal(result.coverageLimitations.length, 1);
});

test('17. Git stat-cache refresh does not count as index mutation when staged entries are unchanged', () => {
  const files = new Map([['app/example.ts', 'hash']]);
  const before = {
    files,
    gitIndexSignature: {
      path: 'C:/repo/.git/index',
      size: 100,
      mtimeMs: 1,
      hash: 'raw-before',
      entryHash: 'entries-same',
      treeHash: 'tree-same'
    }
  };
  const refreshed = {
    files,
    gitIndexSignature: {
      path: 'C:/repo/.git/index',
      size: 120,
      mtimeMs: 2,
      hash: 'raw-after',
      entryHash: 'entries-same',
      treeHash: 'tree-same'
    }
  };
  const changed = {
    files,
    gitIndexSignature: {
      path: 'C:/repo/.git/index',
      size: 120,
      mtimeMs: 2,
      hash: 'raw-after',
      entryHash: 'entries-changed',
      treeHash: 'tree-changed'
    }
  };

  assert.equal(compareSnapshots(before, refreshed).gitIndexModified, false);
  assert.equal(compareSnapshots(before, changed).gitIndexModified, true);
});

test('18. Parses the final structured report when Antigravity prefixes another JSON object', () => {
  const report = parseAgentReport({
    response: '{"task_specification":{"objective":"verbose prefix"}}\n{"status":"completed","summary":"done","checks":[],"remaining_risks":[]}'
  }, { checks: [] });

  assert.equal(report.valid, true);
  assert.equal(report.report.status, 'completed');
  assert.equal(report.report.summary, 'done');
});

test('19. Auto-approve is opt-in and passed only when explicitly requested', async (t) => {
  const projectRoot = createTestProject();
  cleanEnv();
  t.after(() => {
    cleanEnv();
    fs.rmSync(projectRoot, { recursive: true, force: true });
  });

  process.env.FAKE_AGY_SCENARIO = 'success';
  process.env.FAKE_AGY_REQUIRE_AUTO_APPROVE = '1';
  const task = {
    id: 'TASK-019',
    objective: 'Explicit permission contract test',
    allowedFiles: [],
    checks: [],
    readOnly: true,
    autoApprove: true
  };

  const result = await runGeminiTask(task, {
    projectRoot,
    agyBin: FAKE_AGY_PATH
  });

  assert.equal(result.status, 'needs_review');
  assert.deepEqual(result.reasons, []);
});

test('20. Snapshot detects changes in docs, public and hosting configuration', (t) => {
  const projectRoot = createTestProject();
  t.after(() => fs.rmSync(projectRoot, { recursive: true, force: true }));

  for (const directory of ['docs', 'public', '.openai']) {
    fs.mkdirSync(path.join(projectRoot, directory));
  }
  fs.writeFileSync(path.join(projectRoot, 'docs', 'guide.md'), 'before');
  const before = takeFilesystemSnapshot(projectRoot);

  fs.writeFileSync(path.join(projectRoot, 'docs', 'guide.md'), 'after');
  fs.writeFileSync(path.join(projectRoot, 'public', 'mark.svg'), '<svg/>');
  fs.writeFileSync(path.join(projectRoot, '.openai', 'hosting.json'), '{}');
  const comparison = compareSnapshots(before, takeFilesystemSnapshot(projectRoot));

  assert.deepEqual(comparison.changedPaths, [
    '.openai/hosting.json',
    'docs/guide.md',
    'public/mark.svg'
  ]);
});

test('21. New allowed file cannot escape through a symlinked parent', (t) => {
  const projectRoot = createTestProject();
  const outsideRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'agy-runner-outside-'));
  t.after(() => {
    fs.rmSync(projectRoot, { recursive: true, force: true });
    fs.rmSync(outsideRoot, { recursive: true, force: true });
  });

  const linkPath = path.join(projectRoot, 'app', 'external');
  try {
    fs.symlinkSync(outsideRoot, linkPath, 'junction');
  } catch (err) {
    if (err.code === 'EPERM' || err.code === 'EACCES' || err.code === 'ENOTSUP') {
      t.skip(`Symlink creation unavailable: ${err.code}`);
      return;
    }
    throw err;
  }

  assert.throws(() => validateTask({
    id: 'TASK-021',
    objective: 'Create a new file under a linked parent',
    allowedFiles: ['app/external/new.txt']
  }, projectRoot), /symlink/);
  assert.equal(fs.existsSync(path.join(outsideRoot, 'new.txt')), false);
});
