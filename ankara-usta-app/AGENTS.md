# Ankara Usta App — Agent Workflow Contract

## Repository context

This repository is the Ankara Usta marketplace application. It contains a
Next.js/Vinext application, Supabase/PostgreSQL integration, an ASP.NET Core
notification worker, browser and component tests, and extensive engineering
and research documentation.

## Agent roles

- Codex is the orchestrator: clarify scope, inspect the repository, prepare
  bounded task specifications, define acceptance criteria, and review diffs
  and verification evidence.
- Antigravity/Gemini is the implementation agent: implement only the approved
  task, preserve existing behavior outside the task, run the requested checks,
  and report changed files and evidence.
- Neither agent may silently expand scope, rewrite unrelated work, or claim a
  test passed without actually running it.

## Existing worktree protection

The repository may contain substantial user-owned staged, unstaged, and
untracked work. Before any write:

- Inspect `git status --short --branch`.
- Preserve all pre-existing staged, unstaged, and untracked changes.
- Never run `git reset --hard`, `git checkout --`, `git clean`, or an equivalent
  destructive cleanup command.
- Do not commit, push, deploy, alter credentials, or change production data
  unless the user explicitly authorizes that separate action.
- Do not use broad formatting or codemod operations outside the approved task
  files.

## Task protocol

For every implementation task, create or receive a bounded task specification
containing:

1. Objective and user-visible outcome
2. In-scope files or areas
3. Explicit non-goals
4. Constraints and relevant repository sources
5. Acceptance criteria
6. Focused verification commands
7. Stop condition and unresolved questions

The implementation agent must read the task specification and relevant
repository documentation before editing. It must stop and report ambiguity
instead of inventing product requirements.

## Engineering sources of truth

When relevant, consult these before implementation:

- `README.md`
- `docs/engineering/PRODUCT-SRS-SDD-CONSOLIDATED-ROADMAP-2026-10-07.md`
- applicable files under `docs/adr/`, `docs/operations/`, and `docs/research/`
- the nearest existing tests and the package scripts in `package.json`

## Verification expectations

Use the smallest relevant checks first. Known repository checks include:

- `npm run repository:check`
- `npm run styles:check`
- `npm run type-check`
- focused Vitest or Playwright commands from `package.json`
- `npm run quality` only when the task requires the full non-browser gate

Record observed command results. Do not mark a task complete when required
evidence is missing.

## Gemini execution instructions

When this repository is opened in Antigravity, Gemini should:

- treat this file as binding repository guidance;
- implement only the current approved task;
- avoid destructive Git commands and unrelated formatting;
- leave commits and pushes to the user unless separately authorized;
- summarize changed files, tests run, failures, and remaining risks before
  ending the task.
