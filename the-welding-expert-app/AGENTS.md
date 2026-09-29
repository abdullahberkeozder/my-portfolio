# Umut Usta Agent Guidance

## Scope and Product

This file applies to `the-welding-expert-app`. Other applications in this repository
are separate projects; preserve their files and unrelated working-tree changes.

Keep the focus on three-step booking, appointment tracking, self-service requests,
and administrator scheduling. Follow existing React, Spring and PostgreSQL patterns.
Do not expand a narrow task into an unrelated refactor or infrastructure migration.

## Read What the Task Needs

For code changes, read the affected implementation and relevant tests first, not
the entire repository. For documentation-only tasks, read the affected documents
and consult implementation only to verify claims about behavior.
Paths below are relative to this directory unless stated otherwise:

- Spring API, authorization, configuration or transactions: `backend/README.md`.
- Reservation rules or appointment/availability SQL changes: `docs/Appointment_Transition_Contract.md`,
  `backend-contract/README.md`, and the relevant schema/migrations in `supabase/`.
- CI or ephemeral staging: repository-root `.github/workflows/umut-database-contract.yml`
  and `playwright.spring.config.js`.
- Product scope, prioritization or user-flow decisions: the relevant sections of
  `docs/Umut_Usta_Urun_Iyilestirme_Sprint_Plani_2026-07-26.md`.
- Remaining backend scope: `docs/Umut_Usta_Kalan_Backend_Calismalari_2026-09-10.md`.

Historical reports are context, not proof of current deployment or test results.
Check code and current evidence when a document conflicts with them. Update relevant
documentation when changing its contract; do not require every document for every edit.

## Invariants

- Preserve existing PostgreSQL slot locking and atomic reservation behavior through
  Spring integration. Do not replace these guarantees with frontend checks.
- Pending requests do not reserve slots. Competing confirmations must not produce
  two active reservations for the same slot. Failed commands must not leave partial
  request or slot changes.
- Keep reader and writer privileges separate. Read-only transactions do not replace
  database grants or authorization. Do not enable production feature flags implicitly.
- Do not expose credentials, tracking tokens or customer data in logs or artifacts.

## Verification and Completion

Scale verification to the change. Documentation-only edits need consistency/link
checks, not a full application test run. For UI changes, select component tests and
mobile/desktop browser checks relevant to the changed behavior or layout. Do not
expand a small fix into an unrelated whole-site audit.

SQL behavior, slot, transaction and database privilege changes require real PostgreSQL
integration coverage. Verify HTTP/JWT authorization changes with security tests;
include PostgreSQL tests when database authorization or data access is affected.
An existing test covering the changed contract can satisfy verification; do not add
an unrelated query merely to repeat it. Use the existing disposable CI environment;
do not install or start local
Docker unless the user explicitly changes this preference. Compilation and skipped
integration tests are not evidence of PostgreSQL success.

The CI staging fixtures use synthetic data and have no production access. When CI
execution and required Git actions are authorized for the task, run the workflow,
fix failures caused by the change, and rerun affected checks without asking at every
iteration. Do not weaken assertions to obtain a passing result.

Finish the agreed acceptance criteria and inspect the result before declaring success.
Report what passed, what was skipped, and what remains unverified. If access, quota,
credentials or a product decision blocks progress, state the blocker and remaining
work rather than claiming completion or bypassing the restriction.

## Action Boundaries

Local implementation and focused tests may proceed within the requested task.
Commit, push and PR creation require task authorization; permission for one does not
automatically include the others or unrelated future work. Prefer `codex/` branches.
If the user authorizes commit, push, PR creation and CI retries together for this
task, proceed within that scope without reconfirming each iteration. A request to
verify CI alone does not grant missing Git permissions or authorize merge/deploy.

Do not merge, deploy, apply live SQL, change live grants, pause/delete projects, or
create paid resources without explicit authorization. Keep this workflow free of
paid resources. Never substitute the production database for isolated staging.
These instructions do not override tool permissions or approval requirements.
