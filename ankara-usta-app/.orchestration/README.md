# Ankara Usta Task Runner (`.orchestration`)

Small, dependency-free Node ESM adapter that allows Codex to send one bounded task to Antigravity / Gemini, capture a reviewable structured outcome, and measure duration without duplicating tests.

## 1. Roles and Responsibilities

- **Codex (Orchestrator):** Defines bounded task specifications, sets acceptance criteria, inspects diffs and test evidence, decides acceptance, and manages repair attempts.
- **Gemini / Antigravity (Implementer):** Implements the task within allowed files, runs requested checks once, and produces a structured claim report.
- **Task Runner (Mechanical Tooling):** Spawns the CLI child process without a shell, protects project boundaries (writer lock, content hash snapshotting, Git index verification), parses JSON envelope/reports, and saves compact execution records.
- **Critical Invariant:** The runner never outputs an `accepted` status and never declares application correctness. Terminal states are strictly `needs_review`, `blocked`, or `failed`. Codex accepts outcomes.

## 2. Prerequisites and Runtime Requirements

- **Supported Node Runtime:** Node.js 22.13.0 or higher.
  - Recommended local runtime: `.tools/node-v24.19.0-win-x64/node.exe`
  - In unsupported runtimes (e.g., system Node 20), the runner exits immediately with actionable guidance.
- **Antigravity CLI:** Official `agy.exe` executable:
  - Default Windows path: `C:/Users/a-ber/AppData/Local/agy/bin/agy.exe`
  - Configurable via `--agy-bin <path>` or `AGY_BIN` environment variable.
- **Model:** Pinned to `gemini-3.8-flash-high`. Any `--model` override that differs from `gemini-3.8-flash-high` is strictly rejected; only the pinned model may be sent.

## 3. CLI Usage

### Running a Task

```bash
# Using recommended local Node runtime:
.tools/node-v24.19.0-win-x64/node.exe .orchestration/run-gemini-task.mjs --task .orchestration/tasks/my-task.json
```

### CLI Arguments

| Argument | Description | Default |
|---|---|---|
| `--task <path>` | Path to JSON task file | Required (or `--task-json`) |
| `--task-json <str>` | Inline JSON task string | Optional |
| `--project-root <dir>`| Explicit canonical project root | Inferred from script parent |
| `--resume <run.json>` | Resume previous conversation session for repair | Fresh conversation |
| `--timeout <ms>` | Execution timeout in milliseconds | `600000` (10 minutes) |
| `--model <name>` | Fixed model identifier (only `gemini-3.8-flash-high` accepted; others rejected) | `gemini-3.8-flash-high` |
| `--agy-bin <path>` | Executable path for Antigravity CLI | Default local path or `AGY_BIN` |

Task files may set `"autoApprove": true` only for an explicitly authorized bounded
implementation task. The runner then passes Antigravity's
`--dangerously-skip-permissions` flag so headless execution can complete; the
default is `false`. This is not an isolation boundary: scope hashes and Git-index
checks remain mandatory review evidence.

### Exit Codes

- `0`: Task completed within bounds, checks reported passing (`needs_review`).
- `1`: Task failed (spawn error, timeout, malformed output, failing/missing check, scope violation, or index tampering).
- `2`: Task blocked (agent reported blocked or stderr permission/auth blocker detected).

## 4. Task JSON Format

A task JSON file defines a single bounded unit of work:

```json
{
  "id": "TASK-001",
  "objective": "Add keyboard navigation support to BadgePopover component and update its unit tests.",
  "allowedFiles": [
    "app/components/BadgePopover.tsx",
    "tests/component/BadgePopover.test.tsx"
  ],
  "checks": [
    "npm run test -- tests/component/BadgePopover.test.tsx"
  ],
  "readOnly": false
}
```

### Specification Constraints
- `id`: Safe identifier (alphanumeric, dashes, underscores, dots; 1-100 characters; no slashes or traversal).
- `objective`: Clear, non-empty description of the task.
- `allowedFiles`: Array of project-relative paths. Traversal (`..`), absolute paths, sensitive files (`.env*`, secrets, tokens, private keys, `.git/*`), and paths passing through existing symlinks or junctions are rejected.
- `checks`: Array of focused verification commands that Gemini must execute once.
- `readOnly`: If `true`, `allowedFiles` must be empty. Creation, modification, or deletion in monitored source paths results in a failure.

## 5. Security and Safety Guarantees

1. **One Writer Lock Per Project:**
   - Lock file: `.orchestration/.runner.lock` in the canonical project root.
   - Atomic file creation ensures only one runner process writes to the repository at a time.
   - The lock is never stolen automatically. Stale locks must be inspected and resolved manually.
   - Releasing the lock validates PID and run ID to avoid removing another owner's lock.
2. **Pre/Post Content Hash Verification (Post-Execution Detection, Not Isolation):**
   - Content SHA-256 hashes are captured across monitored roots (`app`, `scripts`, `tests`, `services`, `supabase`, `docs`, `public`, `.openai`, `.orchestration`, and root files) before and after execution.
   - Generated/excluded directories and sensitive files are intentionally outside the hash comparison; this is review evidence rather than an isolation boundary.
   - Untracked and already-dirty files are snapshotted; existing user work is protected against silent modification.
   - Any modified, created, or deleted file outside `allowedFiles` immediately triggers a `scope_violation` failure.
   - **Isolation Boundary:** Content hashes provide post-execution change detection, not OS-level sandboxing or active filesystem write isolation. The runner does not prevent the agent process from writing outside bounds during execution; it detects discrepancies after completion and fails closed.
3. **Git Index Preservation & Coverage Limitations:**
   - Resolves the repository's actual Git index via read-only `git` plumbing (`git rev-parse --git-path index`, staged-entry enumeration, and `git write-tree`) with `shell: false` and bounded child processes, without mutating the index or running `git status`.
   - Works when the project is a nested directory whose `.git` repository directory is located in a parent folder.
   - If the agent stages files (`git add`), the runner flags an index preservation violation and fails closed.
   - Stat-cache-only rewrites are compared by the logical tree hash, while raw index metadata remains audit evidence. If Git is unavailable or the logical signature cannot be produced, the runner records an explicit coverage limitation rather than claiming full index protection.
4. **No Process Shell & Windows Child Tree Termination:**
   - Commands are launched with `shell: false`, `windowsHide: true`, and closed stdin.
   - On Windows timeouts or cancellation, PID-targeted `taskkill.exe /PID <pid> /T /F` terminates the child process tree without targeting unrelated processes.
5. **No Automatic Repair Loops:**
   - The runner runs once and stops. It never retries in a blind loop.
   - Single explicit repair is supported via `--resume <run.json>` (max 1 repair attempt).
6. **Credential Redaction and Free Text Sanitization:**
   - All persisted agent free text (summary, check outcomes, remaining risks, and failure reasons) is automatically sanitized with credential redaction before persistence.
   - Redaction patterns cover Bearer tokens, GitHub PATs, Google API keys, Supabase secrets (`sb_secret_`), OpenAI keys (`sk-`), JWT tokens, private key blocks, and generic key/password/secret assignments.
   - Raw stdout, raw stderr, prompt strings, and environment variables are never persisted to disk.

## 6. Run Persistence & Pilot Logging

Every run writes a compact summary to an untracked directory:
`.orchestration/runs/run-<taskId>-<timestamp>-<hash>/run.json`

Example structure:
```json
{
  "runId": "run-TASK-001-1729500000000-a1b2c3d4",
  "taskId": "TASK-001",
  "attempt": 1,
  "projectRoot": "C:/.../ankara-usta-app",
  "model": "gemini-3.8-flash-high",
  "startedAt": "2026-10-21T11:40:00.000Z",
  "finishedAt": "2026-10-21T11:40:15.500Z",
  "wallDurationSeconds": 15.5,
  "status": "needs_review",
  "reasons": [],
  "changedPaths": ["app/components/BadgePopover.tsx"],
  "checkClaims": [
    {
      "command": "npm run test -- tests/component/BadgePopover.test.tsx",
      "outcome": "Tests passed: 2 passed, 0 failed",
      "passed": true
    }
  ],
  "gitIndexSignature": {
    "path": "C:/.../.git/index",
    "size": 12345,
    "mtimeMs": 1729500000000,
    "hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  },
  "coverageLimitation": null,
  "conversationId": "conv-12345",
  "cumulativeUsage": { "input_tokens": 1200, "output_tokens": 350 },
  "deltaUsage": null,
  "agentReport": { ... }
}
```

### Pilot Evaluation Guidelines for Codex
When evaluating pilot tasks using this runner:
- **Do not duplicate tests unconditionally:** If Gemini ran the focused test and reported passing evidence, Codex does not need to re-run the exact same test unless code changed after the test, the output is suspicious, or independent verification is required.
- **Record actual pilot metrics:**
  1. Total wall duration per accepted outcome.
  2. First-pass acceptance rate vs. tasks requiring repair (`attempt: 2`).
  3. Frequency of blocked runs (permissions, auth).
  4. Number of repeated or unnecessary checks.
- **Codex accepts or rejects:** Record the final acceptance decision in task notes. Do not manufacture synthetic acceptance scores.

## 7. PowerShell görev kuyruğu

Codex görevleri `.orchestration/inbox/*.task.md` içine bırakır. Doğrulanmış Antigravity oturumunda çalışan `scripts/gemini-worker.ps1` bu dosyaları Gemini 3.8 Flash High’a gönderir ve çıktıyı `.orchestration/outbox/*.result.md` içine yazar.

### Bir kez başlatma

Antigravity CLI oturumunun doğrulandığı PowerShell penceresinde proje kökünden:

```powershell
.\scripts\gemini-worker.ps1
```

Görevlerin kapsamı Codex tarafından hazırlanır; worker yalnızca kuyruğu tüketir. Worker açık kaldığı sürece yeni görevler için prompt kopyalamanız gerekmez.

İzin istemlerini Gemini görev sözleşmeleriyle otomatik onaylamak gerektiğinde açıkça:

```powershell
.\scripts\gemini-worker.ps1 -SkipPermissions
```

`-SkipPermissions` kullanılabilir. Bu modda da commit ve push yasaktır; Codex her sonuçtan sonra diff ve testleri denetler.

Worker, `agy --print-timeout 0s` ile Gemini turunun kendi kendine tamamlanmasını bekler. Bu, uzun dosya incelemelerinde CLI’nin sabit üç dakikalık kesmesini önler; worker görevi sonuç veya hata dosyasıyla kapatır. `-SkipPermissions` yalnızca kullanıcının açık izniyle kullanılmalıdır.

### Durum klasörleri

- `inbox`: çalışmayı bekleyen `.task.md` dosyaları
- `processing`: worker’ın o anda aldığı görev
- `outbox`: tamamlanan görev çıktıları
- `failed`: worker seviyesinde başarısız görevler

Bu klasörler runtime çıktısıdır; görev dosyaları dışında üretim kodu içermez.
