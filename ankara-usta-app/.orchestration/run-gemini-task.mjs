#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const MIN_NODE_VERSION = { major: 22, minor: 13 };
export const PINNED_MODEL = 'gemini-3.8-flash-high';
export const DEFAULT_MODEL = PINNED_MODEL;
export const DEFAULT_AGY_BIN = 'C:/Users/a-ber/AppData/Local/agy/bin/agy.exe';
export const DEFAULT_TIMEOUT_MS = 600000; // 10 minutes
export const DEFAULT_MAX_BUFFER = 10 * 1024 * 1024; // 10 MB

export const MONITORED_ROOTS = ['app', 'scripts', 'tests', 'services', 'supabase', '.orchestration'];
export const EXCLUDED_DIRS = new Set([
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  'coverage',
  '.turbo',
  '.cache',
  'runs'
]);
export const EXCLUDED_FILES = new Set(['tsconfig.tsbuildinfo']);

export const SECRET_PATH_PATTERNS = [
  /(^|[/\\])\.env(\..+)?$/i,
  /(^|[/\\])\.git([/\\]|$)/i,
  /secret/i,
  /token/i,
  /credential/i,
  /password/i,
  /\.(pem|key)$/i
];

export const PERMISSION_DENIAL_PATTERNS = [
  /permission\s*denied/i,
  /unauthorized/i,
  /authentication\s*failed/i,
  /auth\s*required/i,
  /access\s*denied/i,
  /forbidden/i,
  /not\s*logged\s*in/i,
  /login\s*required/i
];

export const AGENT_REPORT_SCHEMA = {
  type: 'object',
  properties: {
    status: {
      type: 'string',
      enum: ['completed', 'blocked', 'failed']
    },
    summary: {
      type: 'string'
    },
    checks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          command: { type: 'string' },
          outcome: { type: 'string' },
          passed: { type: 'boolean' }
        },
        required: ['command', 'outcome', 'passed']
      }
    },
    remaining_risks: {
      type: 'array',
      items: { type: 'string' }
    }
  },
  required: ['status', 'summary', 'checks', 'remaining_risks']
};

/**
 * Check if current Node.js runtime meets project requirements.
 */
export function checkRuntimeVersion() {
  const parts = process.versions.node.split('.').map(Number);
  const major = parts[0];
  const minor = parts[1];
  const supported = major > MIN_NODE_VERSION.major ||
    (major === MIN_NODE_VERSION.major && minor >= MIN_NODE_VERSION.minor);

  if (!supported) {
    return {
      supported: false,
      current: process.version,
      required: `>=${MIN_NODE_VERSION.major}.${MIN_NODE_VERSION.minor}.0`,
      guidance: `Node ${MIN_NODE_VERSION.major}.${MIN_NODE_VERSION.minor}.0 or higher is required. Current version is ${process.version}. Please run using .tools/node-v24.19.0-win-x64/node.exe`
    };
  }
  return { supported: true, current: process.version };
}

/**
 * Redact obvious credentials from text.
 * Covers Bearer tokens, GitHub PATs, Google API keys, Supabase secrets (sb_secret_),
 * AI keys (sk-), JWT-like tokens, generic key/secret/password assignments, and private keys.
 */
export function redactCredentials(input) {
  if (typeof input !== 'string') return input;
  return input
    .replace(/Bearer\s+[A-Za-z0-9_\-\.]+/gi, 'Bearer [REDACTED]')
    .replace(/\b(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{16,}\b/gi, '$1_[REDACTED]')
    .replace(/\bAIza[0-9A-Za-z-_]{35}\b/gi, 'AIza[REDACTED]')
    .replace(/\bsb_secret_[A-Za-z0-9_\-]+\b/gi, 'sb_secret_[REDACTED]')
    .replace(/\bsbp_[A-Za-z0-9_\-]{16,}\b/gi, 'sbp_[REDACTED]')
    .replace(/\bsk-(?:proj-|ant-)?[A-Za-z0-9_\-]{8,}\b/gi, 'sk-[REDACTED]')
    .replace(/\beyJ[A-Za-z0-9_\-]{4,}\.[A-Za-z0-9_\-]{4,}\.[A-Za-z0-9_\-]{4,}\b/gi, '[REDACTED]')
    .replace(/-----BEGIN [A-Z ]+PRIVATE KEY-----[\s\S]*?-----END [A-Z ]+PRIVATE KEY-----/gi, '[PRIVATE_KEY_REDACTED]')
    .replace(/(?<=(?:password|passwd|secret|token|api[_-]?key|access[_-]?key|private[_-]?key|client[_-]?secret|auth)\s*[:=]\s*['"]?)[a-zA-Z0-9_\-\.]{6,}['"]?/gi, '[REDACTED]');
}

/**
 * Resolve the repository's actual index signature using read-only git plumbing.
 * Uses shell: false and a bounded child process.
 * Does not mutate the index or use git status as a side effect.
 */
export function resolveGitIndexSignature(canonicalRoot) {
  try {
    const res = spawnSync('git', ['rev-parse', '--git-path', 'index'], {
      cwd: canonicalRoot,
      shell: false,
      windowsHide: true,
      timeout: 3000,
      stdio: ['ignore', 'pipe', 'ignore'],
      encoding: 'utf8'
    });

    if (res.error || res.status !== 0 || !res.stdout) {
      return {
        signature: 'unavailable',
        coverageLimitation: 'Git index verification is unavailable: Git command failed or directory is not a Git repository.'
      };
    }

    const relOrAbs = res.stdout.trim();
    if (!relOrAbs) {
      return {
        signature: 'unavailable',
        coverageLimitation: 'Git index verification is unavailable: Git did not return an index path.'
      };
    }

    const gitIndexPath = path.resolve(canonicalRoot, relOrAbs);
    if (!fs.existsSync(gitIndexPath)) {
      return {
        signature: 'unavailable',
        coverageLimitation: 'Git index verification is unavailable: Git index file does not exist.'
      };
    }

    const stat = fs.statSync(gitIndexPath);
    const content = fs.readFileSync(gitIndexPath);
    const hash = crypto.createHash('sha256').update(content).digest('hex');

    // Validate the index trailer without mutating the index. Git writes a
    // SHA-1 trailer for normal repositories and a SHA-256 trailer when the
    // repository uses the sha256 object format. This distinguishes a genuine
    // raw tamper (invalid checksum) from a stat-cache refresh (valid checksum).
    const objectFormatResult = spawnSync('git', ['rev-parse', '--show-object-format'], {
      cwd: canonicalRoot,
      shell: false,
      windowsHide: true,
      timeout: 3000,
      stdio: ['ignore', 'pipe', 'ignore'],
      encoding: 'utf8'
    });
    const objectFormat = objectFormatResult.status === 0 && objectFormatResult.stdout?.trim() === 'sha256'
      ? 'sha256'
      : 'sha1';
    const checksumLength = objectFormat === 'sha256' ? 32 : 20;
    let checksumValid = null;
    if (content.length > checksumLength) {
      const payload = content.subarray(0, content.length - checksumLength);
      const expected = content.subarray(content.length - checksumLength);
      const actual = crypto.createHash(objectFormat).update(payload).digest();
      checksumValid = actual.length === expected.length && actual.equals(expected);
    }

    // Git may rewrite only its stat-cache metadata when a client runs a
    // read-only discovery command. Compare the logical staged entries for
    // preservation decisions, while retaining the raw file hash as evidence.
    const entries = spawnSync('git', ['ls-files', '--stage', '-z'], {
      cwd: canonicalRoot,
      shell: false,
      windowsHide: true,
      timeout: 3000,
      maxBuffer: 5 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'ignore']
    });
    const entryHash = !entries.error && entries.status === 0
      ? crypto.createHash('sha256').update(entries.stdout ?? Buffer.alloc(0)).digest('hex')
      : null;
    const tree = spawnSync('git', ['write-tree'], {
      cwd: canonicalRoot,
      shell: false,
      windowsHide: true,
      timeout: 3000,
      maxBuffer: 1024 * 1024,
      stdio: ['ignore', 'pipe', 'ignore'],
      encoding: 'utf8'
    });
    const treeHash = !tree.error && tree.status === 0 && tree.stdout?.trim()
      ? tree.stdout.trim()
      : null;

    return {
      signature: {
        path: gitIndexPath,
        size: stat.size,
        mtimeMs: stat.mtimeMs,
        hash,
        checksumValid,
        entryHash,
        treeHash
      },
      coverageLimitation: entryHash && treeHash
        ? null
        : 'Git logical index signature unavailable; raw index metadata retained for audit only.'
    };
  } catch (err) {
    return {
      signature: 'unavailable',
      coverageLimitation: `Git index verification is unavailable: ${err.message}`
    };
  }
}

/**
 * Resolve project root canonical path.
 */
export function resolveProjectRoot(explicitRoot) {
  let rootPath;
  if (explicitRoot) {
    rootPath = path.resolve(explicitRoot);
  } else {
    const scriptDir = path.dirname(fileURLToPath(import.meta.url));
    rootPath = path.resolve(scriptDir, '..');
  }

  try {
    rootPath = fs.realpathSync(rootPath);
  } catch (err) {
    throw new Error(`Invalid project root path "${rootPath}": ${err.message}`);
  }

  // Sanity check against root / system directory
  const parsed = path.parse(rootPath);
  if (rootPath === parsed.root || /system32/i.test(rootPath)) {
    throw new Error(`Refusing to use system or filesystem root as project root: "${rootPath}"`);
  }

  return rootPath;
}

/**
 * Validate a task specification.
 */
export function validateTask(task, canonicalRoot) {
  if (!task || typeof task !== 'object' || Array.isArray(task)) {
    throw new Error('Task specification must be a non-empty object.');
  }

  if (
    typeof task.id !== 'string' ||
    task.id.length === 0 ||
    task.id.length > 100 ||
    task.id.startsWith('.') ||
    task.id.startsWith('-') ||
    !/^[a-zA-Z0-9][a-zA-Z0-9_\-\.]*$/.test(task.id)
  ) {
    throw new Error(`Invalid task id "${task.id}". Must be alphanumeric, dashes, underscores, dots, 1-100 chars, not starting with dash or dot.`);
  }

  const objective = task.objective || task.instructions;
  if (typeof objective !== 'string' || objective.trim().length === 0) {
    throw new Error('Task must specify a non-empty "objective" or "instructions".');
  }

  if (!Array.isArray(task.allowedFiles)) {
    throw new Error('Task "allowedFiles" must be an array of strings.');
  }

  const readOnly = Boolean(task.readOnly);
  if (task.autoApprove !== undefined && typeof task.autoApprove !== 'boolean') {
    throw new Error('Task "autoApprove" must be a boolean when provided.');
  }
  if (readOnly && task.allowedFiles.length > 0) {
    throw new Error('readOnly task cannot specify allowedFiles. Must be empty.');
  }

  const validatedAllowedFiles = [];
  for (const rawPath of task.allowedFiles) {
    if (typeof rawPath !== 'string' || rawPath.trim().length === 0) {
      throw new Error('All allowedFiles entries must be non-empty strings.');
    }

    if (path.isAbsolute(rawPath) || /^[a-zA-Z]:/.test(rawPath) || rawPath.startsWith('/') || rawPath.startsWith('\\')) {
      throw new Error(`allowedFiles cannot contain absolute paths: "${rawPath}"`);
    }

    const normalized = rawPath.replace(/\\/g, '/');
    const segments = normalized.split('/');
    if (segments.includes('..') || segments.includes('.')) {
      throw new Error(`allowedFiles cannot contain path traversal (".." or "."): "${rawPath}"`);
    }

    for (const pattern of SECRET_PATH_PATTERNS) {
      if (pattern.test(normalized)) {
        throw new Error(`allowedFiles cannot reference secret or sensitive files: "${rawPath}"`);
      }
    }

    if (canonicalRoot) {
      const fullPath = path.resolve(canonicalRoot, rawPath);
      if (fs.existsSync(fullPath)) {
        try {
          const real = fs.realpathSync(fullPath);
          const rel = path.relative(canonicalRoot, real);
          if (rel.startsWith('..') || path.isAbsolute(rel)) {
            throw new Error(`allowedFiles path escapes project root via symlink: "${rawPath}"`);
          }
        } catch (err) {
          throw new Error(`Failed to resolve path "${rawPath}": ${err.message}`);
        }
      }
    }

    validatedAllowedFiles.push(normalized);
  }

  let checks = [];
  if (task.checks !== undefined) {
    if (!Array.isArray(task.checks)) {
      throw new Error('Task "checks" must be an array if provided.');
    }
    checks = task.checks.map((item, idx) => {
      if (typeof item === 'string') {
        return { command: item.trim(), description: item.trim() };
      }
      if (item && typeof item === 'object' && typeof item.command === 'string') {
        return {
          command: item.command.trim(),
          description: (item.description || item.command).trim()
        };
      }
      throw new Error(`Check at index ${idx} must be a command string or { command: string } object.`);
    });
  }

  return {
    id: task.id,
    objective: objective.trim(),
    allowedFiles: validatedAllowedFiles,
    checks,
    readOnly,
    autoApprove: Boolean(task.autoApprove)
  };
}

/**
 * Writer lock management per canonical project directory.
 */
export function acquireLock(canonicalRoot, runId, taskId) {
  const lockDir = path.join(canonicalRoot, '.orchestration');
  if (!fs.existsSync(lockDir)) {
    fs.mkdirSync(lockDir, { recursive: true });
  }
  const lockPath = path.join(lockDir, '.runner.lock');
  const payload = {
    pid: process.pid,
    runId,
    taskId,
    createdAt: new Date().toISOString()
  };

  try {
    fs.writeFileSync(lockPath, JSON.stringify(payload, null, 2), { flag: 'wx' });
  } catch (err) {
    if (err.code === 'EEXIST') {
      let ownerInfo = 'unknown';
      try {
        const raw = fs.readFileSync(lockPath, 'utf8');
        const existing = JSON.parse(raw);
        ownerInfo = `PID ${existing.pid}, runId ${existing.runId}, task ${existing.taskId}`;
      } catch {}
      const lockError = new Error(`Lock contention: Project directory "${canonicalRoot}" is currently locked by another runner process (${ownerInfo}).`);
      lockError.code = 'ELOCKED';
      throw lockError;
    }
    throw err;
  }

  return { lockPath, runId, canonicalRoot, pid: process.pid };
}

export function releaseLock(lockHandle) {
  if (!lockHandle || !lockHandle.lockPath) return;
  try {
    if (!fs.existsSync(lockHandle.lockPath)) return;
    const raw = fs.readFileSync(lockHandle.lockPath, 'utf8');
    const existing = JSON.parse(raw);
    if (existing.pid === lockHandle.pid && existing.runId === lockHandle.runId) {
      fs.unlinkSync(lockHandle.lockPath);
    }
  } catch {
    // Ignore release errors; do not delete another process's lock
  }
}

/**
 * Capture content hashes of monitored files and Git index signature.
 */
export function takeFilesystemSnapshot(canonicalRoot) {
  const files = new Map();

  function hashFile(filePath) {
    try {
      const content = fs.readFileSync(filePath);
      return crypto.createHash('sha256').update(content).digest('hex');
    } catch {
      return null;
    }
  }

  function walkDirectory(dirPath, relBase) {
    let entries;
    try {
      entries = fs.readdirSync(dirPath, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const name = entry.name;
      const relPath = relBase ? `${relBase}/${name}` : name;
      const fullPath = path.join(dirPath, name);

      if (entry.isDirectory()) {
        if (EXCLUDED_DIRS.has(name)) continue;
        walkDirectory(fullPath, relPath);
      } else if (entry.isFile()) {
        if (name === '.runner.lock') continue;
        if (EXCLUDED_FILES.has(name)) continue;
        let isSecret = false;
        for (const pattern of SECRET_PATH_PATTERNS) {
          if (pattern.test(relPath)) {
            isSecret = true;
            break;
          }
        }
        if (isSecret) continue;

        const hash = hashFile(fullPath);
        if (hash) {
          files.set(relPath, hash);
        }
      }
    }
  }

  // 1. Monitored subdirectories
  for (const rootName of MONITORED_ROOTS) {
    const fullRoot = path.join(canonicalRoot, rootName);
    if (fs.existsSync(fullRoot)) {
      try {
        const stat = fs.statSync(fullRoot);
        if (stat.isDirectory()) {
          walkDirectory(fullRoot, rootName);
        }
      } catch {}
    }
  }

  // 2. Root files in project root
  try {
    const rootEntries = fs.readdirSync(canonicalRoot, { withFileTypes: true });
    for (const entry of rootEntries) {
      if (entry.isFile()) {
        const name = entry.name;
        if (name === '.runner.lock') continue;
        if (EXCLUDED_FILES.has(name)) continue;
        let isSecret = false;
        for (const pattern of SECRET_PATH_PATTERNS) {
          if (pattern.test(name)) {
            isSecret = true;
            break;
          }
        }
        if (!isSecret) {
          const fullPath = path.join(canonicalRoot, name);
          const hash = hashFile(fullPath);
          if (hash) {
            files.set(name, hash);
          }
        }
      }
    }
  } catch {}

  // 3. Git index signature via read-only plumbing
  const gitInfo = resolveGitIndexSignature(canonicalRoot);

  return {
    files,
    gitIndexSignature: gitInfo.signature,
    coverageLimitation: gitInfo.coverageLimitation,
    monitoredRoots: MONITORED_ROOTS,
    excludedDirs: Array.from(EXCLUDED_DIRS),
    excludedFiles: Array.from(EXCLUDED_FILES)
  };
}

/**
 * Compare two filesystem snapshots to detect modified, created, and deleted paths.
 */
export function compareSnapshots(before, after) {
  const modified = [];
  const created = [];
  const deleted = [];

  for (const [relPath, beforeHash] of before.files.entries()) {
    if (!after.files.has(relPath)) {
      deleted.push(relPath);
    } else {
      const afterHash = after.files.get(relPath);
      if (beforeHash !== afterHash) {
        modified.push(relPath);
      }
    }
  }

  for (const [relPath] of after.files.entries()) {
    if (!before.files.has(relPath)) {
      created.push(relPath);
    }
  }

  const changedPaths = [...modified, ...created, ...deleted].sort();

  let gitIndexModified = false;
  const beforeSig = before.gitIndexSignature;
  const afterSig = after.gitIndexSignature;

  if (beforeSig && afterSig && beforeSig !== 'unavailable' && afterSig !== 'unavailable') {
    if (beforeSig.checksumValid === true && afterSig.checksumValid === false) {
      gitIndexModified = true;
    } else if (beforeSig.treeHash && afterSig.treeHash) {
      gitIndexModified = beforeSig.treeHash !== afterSig.treeHash;
    } else if (beforeSig.treeHash && !afterSig.treeHash) {
      gitIndexModified = true;
    } else if (beforeSig.entryHash && afterSig.entryHash) {
      gitIndexModified = beforeSig.entryHash !== afterSig.entryHash;
    } else if (beforeSig.hash !== afterSig.hash || beforeSig.size !== afterSig.size) {
      gitIndexModified = true;
    }
  } else if (beforeSig && beforeSig !== 'unavailable' && afterSig === 'unavailable') {
    gitIndexModified = true;
  }

  return {
    modified,
    created,
    deleted,
    changedPaths,
    gitIndexModified
  };
}

/**
 * Terminate a process tree by PID without using a shell.
 */
export async function terminateChildTree(pid) {
  if (!pid) return { terminated: false, error: 'Missing PID' };

  if (process.platform === 'win32') {
    return new Promise((resolve) => {
      let resolved = false;
      const killerTimeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          try { killer.kill(); } catch {}
          resolve({ terminated: false, error: 'taskkill timed out' });
        }
      }, 3000);

      const killer = spawn('taskkill.exe', ['/PID', String(pid), '/T', '/F'], {
        windowsHide: true,
        shell: false,
        stdio: 'ignore'
      });
      killer.on('close', (code) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(killerTimeout);
          if (code === 0 || code === 128) {
            // 0 = killed, 128 = process not found (already gone)
            resolve({ terminated: true });
          } else {
            resolve({ terminated: false, error: `taskkill exited with code ${code}` });
          }
        }
      });
      killer.on('error', (err) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(killerTimeout);
          resolve({ terminated: false, error: err.message });
        }
      });
    });
  }

  try {
    process.kill(-pid, 'SIGKILL');
    return { terminated: true };
  } catch {
    try {
      process.kill(pid, 'SIGKILL');
      return { terminated: true };
    } catch (err) {
      return { terminated: false, error: err.message };
    }
  }
}

/**
 * Build the bounded prompt for the agent.
 */
export function buildAgentPrompt(task, canonicalRoot) {
  const allowedList = task.readOnly
    ? 'NONE (readOnly: true. You must NOT modify any files).'
    : (task.allowedFiles.length > 0
        ? task.allowedFiles.map((f) => `  - ${f}`).join('\n')
        : 'NONE');

  const checkList = task.checks.length > 0
    ? task.checks.map((c) => `  - ${c.command}`).join('\n')
    : '  - (None specified)';

  return [
    `# Bounded Task Execution: ${task.id}`,
    '',
    `## Objective`,
    task.objective,
    '',
    `## Constraints and AGENTS.md Binding Rules`,
    `- Preserve all pre-existing staged, unstaged, and untracked work.`,
    `- Never run destructive Git commands (e.g., git reset, git checkout, git clean).`,
    `- Do not commit, push, deploy, alter credentials, or modify production data.`,
    `- Do NOT edit any files outside the explicit allowedFiles list below.`,
    `- If readOnly is true, do NOT modify any files.`,
    `- Do NOT spawn additional agents or invoke agy recursively.`,
    task.autoApprove
      ? `- Tool permissions are explicitly auto-approved for this bounded task; stay strictly within the scope below.`
      : `- Do not request or use auto-approved tool permissions for this task.`,
    '',
    `## In-Scope Allowed Files`,
    allowedList,
    '',
    `## Required Checks`,
    `Run only these focused checks once and report observed outputs:`,
    checkList,
    '',
    `## Required Structured Output`,
    `You must produce your final response adhering to the JSON schema.`,
    `Report your actual status ("completed", "blocked", or "failed"), summary, observed check outcomes, and remaining risks.`
  ].join('\n');
}

/**
 * Validate and parse the structured agent report from the envelope.
 */
export function parseAgentReport(envelope, task) {
  if (!envelope || typeof envelope !== 'object') {
    return { valid: false, error: 'Envelope is not an object' };
  }

  let report = envelope.structured_output;
  if (!report && typeof envelope.response === 'object' && envelope.response !== null) {
    report = envelope.response;
  } else if (!report && typeof envelope.response === 'string') {
    let clean = envelope.response.trim();
    if (clean.startsWith('```')) {
      clean = clean.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '').trim();
    }
    try {
      report = JSON.parse(clean);
    } catch {
      // Antigravity can include a verbose JSON object followed by the final
      // schema object in the same response string. Recover the final object
      // without persisting or trusting the verbose prefix.
      const finalObjectStart = clean.lastIndexOf('\n{');
      if (finalObjectStart >= 0) {
        try {
          report = JSON.parse(clean.slice(finalObjectStart + 1).trim());
        } catch {
          // not a recoverable JSON string
        }
      }
    }
  }

  if (!report || typeof report !== 'object') {
    return { valid: false, error: 'Missing or unparseable structured agent report' };
  }

  const validStatuses = ['completed', 'blocked', 'failed'];
  if (!validStatuses.includes(report.status)) {
    return { valid: false, error: `Invalid report status: "${report.status}"` };
  }

  if (typeof report.summary !== 'string') {
    return { valid: false, error: 'Report missing string summary' };
  }

  if (!Array.isArray(report.checks)) {
    return { valid: false, error: 'Report "checks" must be an array' };
  }

  const normalizedChecks = [];
  for (let i = 0; i < report.checks.length; i++) {
    const c = report.checks[i];
    if (!c || typeof c !== 'object') {
      return { valid: false, error: `Report check at index ${i} is not an object` };
    }
    if (typeof c.command !== 'string' || typeof c.outcome !== 'string') {
      return { valid: false, error: `Report check at index ${i} missing command or outcome string` };
    }
    normalizedChecks.push({
      command: c.command.trim(),
      outcome: c.outcome.trim(),
      passed: Boolean(c.passed)
    });
  }

  let remainingRisks = [];
  if (Array.isArray(report.remaining_risks)) {
    remainingRisks = report.remaining_risks.map(String);
  } else if (typeof report.remaining_risks === 'string') {
    remainingRisks = [report.remaining_risks];
  }

  return {
    valid: true,
    report: {
      status: report.status,
      summary: report.summary,
      checks: normalizedChecks,
      remaining_risks: remainingRisks
    }
  };
}

/**
 * Validate required checks against agent claims.
 */
export function validateCheckClaims(requiredChecks, agentChecks) {
  const missing = [];
  const failed = [];

  for (const req of requiredChecks) {
    const reqCmd = req.command.trim();
    const match = agentChecks.find((c) => {
      const claimCmd = c.command.trim();
      return claimCmd === reqCmd || claimCmd.includes(reqCmd) || reqCmd.includes(claimCmd);
    });

    if (!match) {
      missing.push(reqCmd);
    } else if (!match.passed) {
      failed.push({ command: reqCmd, outcome: match.outcome });
    }
  }

  return {
    allPassed: missing.length === 0 && failed.length === 0,
    missing,
    failed
  };
}

/**
 * Validate resume run record.
 */
export function validateResume(resumeFromPath, canonicalRoot, taskId) {
  if (!fs.existsSync(resumeFromPath)) {
    throw new Error(`Resume file not found: "${resumeFromPath}"`);
  }

  let prior;
  try {
    prior = JSON.parse(fs.readFileSync(resumeFromPath, 'utf8'));
  } catch (err) {
    throw new Error(`Invalid JSON in resume file: ${err.message}`);
  }

  if (prior.taskId !== taskId) {
    throw new Error(`Resume task ID mismatch: prior run was for task "${prior.taskId}", current task is "${taskId}"`);
  }

  if (path.resolve(prior.projectRoot) !== canonicalRoot) {
    throw new Error(`Resume project root mismatch: prior was "${prior.projectRoot}", current is "${canonicalRoot}"`);
  }

  if (!prior.conversationId || typeof prior.conversationId !== 'string') {
    throw new Error(`Resume error: Prior run record missing valid conversationId.`);
  }

  const priorAttempt = Number(prior.attempt) || 1;
  if (priorAttempt >= 2) {
    throw new Error(`Resume error: Maximum repair attempts exceeded (prior attempt was ${priorAttempt}, max allowed repairs is 1).`);
  }

  return {
    conversationId: prior.conversationId,
    attempt: priorAttempt + 1,
    priorCumulativeUsage: prior.cumulativeUsage || null
  };
}

/**
 * Main execution function.
 */
export async function runGeminiTask(rawTask, options = {}) {
  const runtimeCheck = checkRuntimeVersion();
  if (!runtimeCheck.supported) {
    throw new Error(runtimeCheck.guidance);
  }

  const canonicalRoot = resolveProjectRoot(options.projectRoot);
  const task = validateTask(rawTask, canonicalRoot);

  if (options.model !== undefined && options.model !== null && options.model !== PINNED_MODEL) {
    throw new Error(`Model override rejected: model is pinned to "${PINNED_MODEL}". Received "${options.model}".`);
  }

  const agyBin = options.agyBin || process.env.AGY_BIN || DEFAULT_AGY_BIN;
  const model = PINNED_MODEL;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxBuffer = options.maxBuffer ?? DEFAULT_MAX_BUFFER;

  let attempt = 1;
  let resumeConversationId = null;
  let priorUsage = null;

  if (options.resumeFrom) {
    const resumeInfo = validateResume(options.resumeFrom, canonicalRoot, task.id);
    attempt = resumeInfo.attempt;
    resumeConversationId = resumeInfo.conversationId;
    priorUsage = resumeInfo.priorCumulativeUsage;
  }

  const runId = `run-${task.id}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  const lockHandle = acquireLock(canonicalRoot, runId, task.id);

  const startedAt = new Date();
  const startHrTime = process.hrtime.bigint();

  let beforeSnapshot = null;
  let afterSnapshot = null;
  let child = null;
  let childExitCode = null;
  let stdoutBuffer = '';
  let stderrBuffer = '';
  let timedOut = false;
  let bufferOverflow = false;
  let spawnError = null;
  let cancellationError = null;
  let timeoutTimer = null;
  let fallbackTimer = null;
  let terminationPromise = null;
  let terminationResult = null;
  let abortHandler = null;

  try {
    beforeSnapshot = takeFilesystemSnapshot(canonicalRoot);

    const prompt = buildAgentPrompt(task, canonicalRoot);
    const cliArgs = [
      '--print', prompt,
      '--model', model,
      '--mode', task.readOnly ? 'plan' : 'accept-edits',
      '--output-format', 'json',
      '--json-schema', JSON.stringify(AGENT_REPORT_SCHEMA)
    ];

    if (task.autoApprove) {
      cliArgs.push('--dangerously-skip-permissions');
    }

    if (resumeConversationId) {
      cliArgs.push('--conversation', resumeConversationId);
    }

    let spawnExe = agyBin;
    let spawnArgs = cliArgs;

    // Deterministic support for .mjs / .js fake CLI fixtures without a shell
    if (agyBin.endsWith('.mjs') || agyBin.endsWith('.js')) {
      spawnExe = process.execPath;
      spawnArgs = [agyBin, ...cliArgs];
    }

    child = spawn(spawnExe, spawnArgs, {
      cwd: canonicalRoot,
      shell: false,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    if (options.signal) {
      abortHandler = () => {
        cancellationError = new Error('Execution aborted by signal');
        try { child.kill(); } catch {}
        if (child.pid) {
          terminateChildTree(child.pid).catch(() => {});
        }
      };
      options.signal.addEventListener('abort', abortHandler, { once: true });
    }

    child.stdout.on('data', (chunk) => {
      stdoutBuffer += chunk.toString('utf8');
      if (stdoutBuffer.length > maxBuffer) {
        bufferOverflow = true;
        try { child.kill(); } catch {}
        if (child.pid) {
          terminateChildTree(child.pid).catch(() => {});
        }
      }
    });

    child.stderr.on('data', (chunk) => {
      stderrBuffer += chunk.toString('utf8');
      if (stderrBuffer.length > maxBuffer) {
        bufferOverflow = true;
        try { child.kill(); } catch {}
        if (child.pid) {
          terminateChildTree(child.pid).catch(() => {});
        }
      }
    });

    child.on('error', (err) => {
      spawnError = err;
    });

    childExitCode = await new Promise((resolve) => {
      let resolved = false;
      const finish = (code) => {
        if (!resolved) {
          resolved = true;
          if (timeoutTimer) clearTimeout(timeoutTimer);
          if (fallbackTimer) clearTimeout(fallbackTimer);
          resolve(code);
        }
      };

      child.on('close', (code) => {
        finish(code);
      });

      if (timeoutMs > 0) {
        timeoutTimer = setTimeout(() => {
          timedOut = true;
          try {
            child.kill();
          } catch {}

          if (child.pid) {
            terminationPromise = terminateChildTree(child.pid)
              .then((res) => { terminationResult = res; return res; })
              .catch((err) => {
                terminationResult = { terminated: false, error: err.message };
                return terminationResult;
              });
          }

          fallbackTimer = setTimeout(() => {
            finish(null);
          }, Math.min(2000, Math.max(500, timeoutMs)));
        }, timeoutMs);
      }
    });

    if (timedOut && terminationPromise && !terminationResult) {
      await Promise.race([
        terminationPromise,
        new Promise((r) => setTimeout(r, 500))
      ]);
    }

    afterSnapshot = takeFilesystemSnapshot(canonicalRoot);
  } finally {
    if (timeoutTimer) clearTimeout(timeoutTimer);
    if (fallbackTimer) clearTimeout(fallbackTimer);
    if (options.signal && abortHandler) {
      options.signal.removeEventListener('abort', abortHandler);
    }
    releaseLock(lockHandle);
  }

  const finishedAt = new Date();
  const endHrTime = process.hrtime.bigint();
  const wallDurationSeconds = Number(endHrTime - startHrTime) / 1e9;

  // Evaluate results
  const comparison = (beforeSnapshot && afterSnapshot)
    ? compareSnapshots(beforeSnapshot, afterSnapshot)
    : { changedPaths: [], gitIndexModified: false };

  const reasons = [];
  let terminalStatus = 'needs_review';

  // 1. Check process spawn / lifecycle errors
  if (spawnError) {
    terminalStatus = 'failed';
    reasons.push(`Process spawn failure: ${spawnError.message}`);
  } else if (timedOut) {
    terminalStatus = 'failed';
    const termMsg = (terminationResult && terminationResult.terminated)
      ? 'child process tree terminated'
      : (terminationResult && terminationResult.error
          ? `child tree termination failed: ${terminationResult.error}`
          : 'child tree termination unknown');
    reasons.push(`Execution timed out after ${timeoutMs}ms; ${termMsg}`);
  } else if (bufferOverflow) {
    terminalStatus = 'failed';
    reasons.push(`Stdout or stderr exceeded max buffer limit of ${maxBuffer} bytes`);
  } else if (cancellationError) {
    terminalStatus = 'failed';
    reasons.push(`Execution cancelled: ${cancellationError.message}`);
  } else if (childExitCode !== 0) {
    terminalStatus = 'failed';
    reasons.push(`CLI process exited with non-zero code ${childExitCode}`);
  }

  // 2. Inspect stderr for explicit permission/auth denial
  let stderrPermissionBlocker = false;
  for (const pattern of PERMISSION_DENIAL_PATTERNS) {
    if (pattern.test(stderrBuffer)) {
      stderrPermissionBlocker = true;
      break;
    }
  }

  if (stderrPermissionBlocker) {
    if (terminalStatus !== 'failed') {
      terminalStatus = 'blocked';
    }
    reasons.push('Explicit permission or authentication blocker detected on stderr');
  }

  // 3. Parse envelope and report if process exited 0
  let envelope = null;
  let parsedReport = null;
  let conversationId = resumeConversationId;
  let cumulativeUsage = null;
  let deltaUsage = null;

  if (terminalStatus !== 'failed' && stdoutBuffer.trim().length > 0) {
    try {
      envelope = JSON.parse(stdoutBuffer.trim());
    } catch {
      if (terminalStatus !== 'failed' && terminalStatus !== 'blocked') {
        terminalStatus = 'failed';
        reasons.push('Failed to parse stdout as JSON envelope');
      }
    }
  }

  if (envelope) {
    if (resumeConversationId) {
      if (envelope.conversation_id && envelope.conversation_id !== resumeConversationId) {
        terminalStatus = 'failed';
        reasons.push(`Resume error: conversation_id mismatch (expected "${resumeConversationId}", received "${envelope.conversation_id}")`);
      }
      conversationId = resumeConversationId;
    } else if (envelope.conversation_id) {
      conversationId = envelope.conversation_id;
    }
    if (envelope.usage && typeof envelope.usage === 'object') {
      cumulativeUsage = envelope.usage;
      if (priorUsage) {
        deltaUsage = {};
        for (const [key, val] of Object.entries(cumulativeUsage)) {
          if (typeof val === 'number') {
            const priorVal = typeof priorUsage[key] === 'number' ? priorUsage[key] : 0;
            deltaUsage[key] = Math.max(0, val - priorVal);
          }
        }
      }
    }

    if (envelope.status !== 'SUCCESS') {
      if (terminalStatus !== 'blocked') {
        terminalStatus = 'failed';
        reasons.push(`Envelope status is not SUCCESS (was "${envelope.status}")`);
      }
    }

    const reportResult = parseAgentReport(envelope, task);
    if (!reportResult.valid) {
      if (terminalStatus !== 'blocked') {
        terminalStatus = 'failed';
        reasons.push(`Agent report validation failed: ${reportResult.error}`);
      }
    } else {
      parsedReport = reportResult.report;

      if (parsedReport.status === 'blocked') {
        if (terminalStatus !== 'failed') {
          terminalStatus = 'blocked';
        }
        reasons.push(`Agent reported blocked: ${parsedReport.summary}`);
      } else if (parsedReport.status === 'failed') {
        terminalStatus = 'failed';
        reasons.push(`Agent reported failed: ${parsedReport.summary}`);
      }

      // Check validation
      const checkEval = validateCheckClaims(task.checks, parsedReport.checks);
      if (!checkEval.allPassed) {
        if (terminalStatus !== 'blocked') {
          terminalStatus = 'failed';
        }
        if (checkEval.missing.length > 0) {
          reasons.push(`Required check missing from report claims: ${checkEval.missing.join(', ')}`);
        }
        if (checkEval.failed.length > 0) {
          reasons.push(`Required check failed: ${checkEval.failed.map((f) => `${f.command} (${f.outcome})`).join(', ')}`);
        }
      }
    }
  }

  // 4. Scope and Git index verification
  if (task.readOnly) {
    if (comparison.changedPaths.length > 0) {
      terminalStatus = 'failed';
      reasons.push(`readOnly violation: Files were modified during readOnly task: ${comparison.changedPaths.join(', ')}`);
    }
  } else {
    const allowedSet = new Set(task.allowedFiles);
    const outOfScope = comparison.changedPaths.filter((p) => !allowedSet.has(p));
    if (outOfScope.length > 0) {
      terminalStatus = 'failed';
      reasons.push(`Scope violation: Changed files outside task allowedFiles: ${outOfScope.join(', ')}`);
    }
  }

  if (comparison.gitIndexModified) {
    terminalStatus = 'failed';
    reasons.push('Index preservation violation: Git index was modified during task execution');
  }

  // Persist run artifact
  const safeTaskId = task.id.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
  const runDir = path.join(canonicalRoot, '.orchestration', 'runs', `${runId}`);
  fs.mkdirSync(runDir, { recursive: true });

  const sanitizedReasons = reasons.map(redactCredentials);

  let sanitizedReport = null;
  let sanitizedCheckClaims = [];

  if (parsedReport) {
    sanitizedReport = {
      status: parsedReport.status,
      summary: redactCredentials(parsedReport.summary),
      checks: parsedReport.checks.map((c) => ({
        command: c.command,
        outcome: redactCredentials(c.outcome),
        passed: c.passed
      })),
      remaining_risks: parsedReport.remaining_risks.map(redactCredentials)
    };
    sanitizedCheckClaims = sanitizedReport.checks;
  }

  const effectiveGitSig = afterSnapshot?.gitIndexSignature ?? beforeSnapshot?.gitIndexSignature ?? 'unavailable';
  const effectiveCoverageLimitation = afterSnapshot?.coverageLimitation ?? beforeSnapshot?.coverageLimitation ?? null;

  const resultRecord = {
    runId,
    taskId: task.id,
    attempt,
    projectRoot: canonicalRoot,
    model: PINNED_MODEL,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    wallDurationSeconds: Number(wallDurationSeconds.toFixed(2)),
    status: terminalStatus,
    reasons: sanitizedReasons,
    changedPaths: comparison.changedPaths,
    checkClaims: sanitizedCheckClaims,
    gitIndexSignature: effectiveGitSig,
    coverageLimitation: effectiveCoverageLimitation,
    coverageLimitations: effectiveCoverageLimitation ? [effectiveCoverageLimitation] : [],
    conversationId,
    cumulativeUsage,
    deltaUsage,
    agentReport: sanitizedReport
  };

  const recordPath = path.join(runDir, 'run.json');
  fs.writeFileSync(recordPath, JSON.stringify(resultRecord, null, 2));

  return {
    ...resultRecord,
    runDir,
    recordPath
  };
}

/**
 * CLI Entry point
 */
export async function main(argv = process.argv.slice(2)) {
  const runtimeCheck = checkRuntimeVersion();
  if (!runtimeCheck.supported) {
    process.stderr.write(`Error: ${runtimeCheck.guidance}\n`);
    process.exit(1);
  }

  let taskPath = null;
  let taskJson = null;
  let projectRoot = null;
  let resumeFrom = null;
  let timeoutMs = null;
  let model = null;
  let agyBin = null;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--task' && argv[i + 1]) {
      taskPath = argv[++i];
    } else if (arg === '--task-json' && argv[i + 1]) {
      taskJson = argv[++i];
    } else if (arg === '--project-root' && argv[i + 1]) {
      projectRoot = argv[++i];
    } else if (arg === '--resume' && argv[i + 1]) {
      resumeFrom = argv[++i];
    } else if (arg === '--timeout' && argv[i + 1]) {
      timeoutMs = Number(argv[++i]);
    } else if (arg === '--model' && argv[i + 1]) {
      const requestedModel = argv[++i];
      if (requestedModel !== PINNED_MODEL) {
        process.stderr.write(`Error: Model override rejected: model is pinned to "${PINNED_MODEL}". Received "${requestedModel}".\n`);
        process.exit(1);
      }
      model = PINNED_MODEL;
    } else if (arg === '--agy-bin' && argv[i + 1]) {
      agyBin = argv[++i];
    } else if (arg === '--help' || arg === '-h') {
      process.stdout.write([
        'Usage: node run-gemini-task.mjs [options]',
        '',
        'Options:',
        '  --task <path>         Path to JSON task file',
        '  --task-json <string>  Raw JSON task string',
        '  --project-root <dir>  Explicit canonical project root',
        '  --resume <run.json>   Path to prior run.json to resume repair',
        '  --timeout <ms>        Execution timeout in milliseconds',
        '  --model <name>        Pinned model (must be gemini-3.8-flash-high)',
        '  --agy-bin <path>      Path to agy executable',
        '  --help, -h            Show this help'
      ].join('\n') + '\n');
      process.exit(0);
    } else if (!arg.startsWith('-') && !taskPath) {
      taskPath = arg;
    }
  }

  let rawTask;
  try {
    if (taskJson) {
      rawTask = JSON.parse(taskJson);
    } else if (taskPath) {
      const resolvedTaskPath = path.resolve(taskPath);
      rawTask = JSON.parse(fs.readFileSync(resolvedTaskPath, 'utf8'));
    } else {
      process.stderr.write('Error: Must provide --task <path> or --task-json <string>.\n');
      process.exit(1);
    }
  } catch (err) {
    process.stderr.write(`Error reading task JSON: ${err.message}\n`);
    process.exit(1);
  }

  try {
    const result = await runGeminiTask(rawTask, {
      projectRoot,
      resumeFrom,
      timeoutMs: timeoutMs || undefined,
      model: model || undefined,
      agyBin: agyBin || undefined
    });

    process.stdout.write(JSON.stringify(result, null, 2) + '\n');

    if (result.status === 'needs_review') {
      process.exit(0);
    } else if (result.status === 'blocked') {
      process.exit(2);
    } else {
      process.exit(1);
    }
  } catch (err) {
    process.stderr.write(`Runner error: ${err.message}\n`);
    process.exit(1);
  }
}

// Only invoke CLI when executed directly
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((err) => {
    process.stderr.write(`Fatal error: ${err.message}\n`);
    process.exit(1);
  });
}
