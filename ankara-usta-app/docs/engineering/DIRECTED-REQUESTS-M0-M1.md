# M0 / M1 — Directed request implementation evidence

Date: 2026-09-02
Base commit: `51d7e25`. Changes are uncommitted; no new commit, push or deployment was requested or performed. The worktree already contained prior draft/auth work, which is preserved.

## Delivery state

| Slice | Planned | Implemented | Locally verified | Multi-account verified | Released |
| --- | --- | --- | --- | --- | --- |
| M0 routing / authorization contract | Yes | Source + migration authored | TypeScript tests pass; SQL execution pending | No | No |
| M1 directed vertical UI path | Yes | Source implemented, rollout gated | Component/API mocks, lint, type-check, build pass; browser acceptance pending | No | No |

Neither slice has cleared the complete **Locally verified** gate: database and browser evidence remain outstanding. Do not describe them as production-ready.

## Implemented behavior

- One wizard, reused on `/ustalar/[id]/talep`; no duplicate question flow.
- Directory service/district filtering runs before server-side pagination. Filters remain in page links. Deterministic ordering uses display name and ID.
- Eligible profiles offer a service selector and **Bu ustadan teklif al**. The entry route re-reads approved profile, offered service, areas and verification; URL parameters cannot supply the professional's display name or working areas.
- Server-only `ORKESTRA_DIRECT_REQUESTS_ENABLED` gate defaults off. Disabled direct entry and draft/submit APIs fail closed instead of falling back to open matching.
- Domain validation requires a UUID target for `direct`, forbids targets for `open`, and defaults legacy payloads to `open`.
- Local draft namespace includes customer, service and target professional. Open and different-target drafts do not overwrite each other.
- Routing is saved with answers, step, question index and idempotency key. A conflicting restored target blocks the form without overwriting storage.
- Login/signup return uses the directed route and retains service/target. Guest transfer remains an explicit same-tab ownership decision; remote request IDs are not transferred.
- Explicitly continuing a local draft now prefers that draft over a competing remote prop.
- Summary identifies the intended professional and explains that the request is not automatically shared with others or equivalent to a confirmed appointment.
- Location choices use the selected professional's districts. A restored out-of-area location cannot be submitted.
- Customer draft retrieval follows the authoritative stored target back to the directed route. Customer request list labels directed requests and links to the selected profile.
- Existing open draft RPC stays unchanged at the API boundary; no new parameters are required for existing open clients.

## Database migration

`supabase/migrations/20260902200310_directed_request_routing.sql`

Authored, **not applied locally or remotely**:

- Adds routing and target columns; existing rows default to open. Constraints prohibit inconsistent audiences and self-targeting.
- Adds an authenticated direct-draft RPC with owner-derived identity, shared validation and transactional idempotency locking. Service/target cannot change under the same key.
- Prevents the legacy open draft RPC from editing a directed request with a reused key.
- Filters the existing matching query by target before ranking/limit, retaining service, area, verification and availability checks.
- Adds guards on request audience changes and match/quote recipients, including privileged writers.
- Tightens request-read helper so matching cannot expose a direct request to another professional or expose a draft to a matched professional.
- Keeps direct table mutation grants revoked; public mutation entry point is an invoker wrapper.

The migration modifies two existing function definitions with checked replacement anchors. It raises an exception if the expected definition changed. Inspect the deployed definitions before applying; do not remove this guard to force an unfamiliar schema through.

Direct publication can still yield no match when the chosen professional has no matching availability. It does not invite another professional. Invitation expiry/decline and improved no-supply operations belong to M2, not this release.

## Verification evidence

- Full Vitest unit/component suite: **33 files, 167 tests passed**.
- Focused routing/persistence/auth/API/wizard/ownership suite: **7 files, 41 tests passed**.
- Lint: passed.
- Type-check: passed.
- Production build: passed (Vinext route classification informational notices remain).
- New tests: `tests/unit/requestRouting.test.ts`, `tests/unit/directedDraftApi.test.ts`, `tests/component/DirectedRequestWizard.test.tsx`.
- Existing auth-return, request validation and draft ownership regressions remain passing.

Tests prove local validation, mock API dispatch, rollout rejection, target-specific restoration, conflicting-target rejection, out-of-area rejection and safe login return. They do not prove real Auth sessions, Supabase RLS, database transactions, Realtime, responsive layout or accessibility in a browser.

`supabase status` could not inspect a local database because Docker and Podman are unavailable. The linked project was identified but not mutated. No isolated test project, accounts or production test records were created.

`supabase/tests/remote/directed_request_contract.sql` is an authored rollback check for constraints, grants, routing guards and missing-identity rejection. **Not run.** Even if it passes later, it is not a substitute for positive/negative multi-account access tests.

## Remaining release gates

On 2026-09-02 the user deferred these checks until the final validation stage so product development can continue. The six gates and their evidence checklist now live in [Deferred pre-release validation](PRE-RELEASE-VALIDATION-BACKLOG.md). They are not waived or passed. Do not provision test infrastructure now; keep the direct-request release gate disabled until verification succeeds.

Rollback at the application layer: disable the feature flag and hide new direct entry. Preserve existing private records and their target constraints. Do not drop target columns or convert direct requests into open requests as a rollback shortcut.

## Limits intentionally retained

No direct-to-open UI, messaging, negotiation, inquiry, invitation lifecycle, payment or appointment booking was added. Device-local drafts are not encrypted or cross-device synchronization. File objects must still be selected again after full navigation. Admin operational access and media delivery need their own role-specific acceptance evidence; copy about authorized operations is not a claim of blanket admin access.
