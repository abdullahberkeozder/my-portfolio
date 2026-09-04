# Phase 1 — Reliable task completion

Date: 2026-09-03. Source: `REMAINING-WORK-AUDIT-2026-09-03.md`, proposed Phase 1.

Status: **Implemented → Locally verified** for the bounded job-room slice below. **Multi-account verified → Released: pending.** No remote database, schema, migration, runtime flag, deployment, commit or push was changed. Existing unrelated working-tree changes were preserved.

Base HEAD: `ca1db13d326e5f9c6fd72dd19cc0647d64ea3a8b`. This is the starting revision, not an implementation commit. Implementation is currently uncommitted.

## Implemented scope and evidence

| Finding | Change | Local evidence |
| --- | --- | --- |
| F01 | Optional telemetry catches storage/transport failures; successful wizard submission no longer fails because local draft cleanup throws. No telemetry retry or implied consent. | `tests/unit/analytics.test.ts`; wizard cleanup source inspection |
| F02 | Shared POST helper with 15-second timeout, acknowledgement checks and safe error messages. Trust forms always release pending state, preserve text on failure, and capture the upload form before awaiting. Unknown outcomes block blind resubmission and provide a current-record link. | `tests/unit/workspaceMutation.test.ts`, `tests/component/JobReliability.test.tsx` |
| F05 | Delayed message success only clears the text actually sent; duplicate in-flight submission is guarded. Unchanged failed messages reuse the existing idempotency key. | `JobReliability.test.tsx` |
| F06 | SUBSCRIBED/reconnect, online, focus and visible-tab events request a coalesced server refresh; cleanup cancels timers/listeners; manual refresh remains available. | `tests/component/JobConnectionSafety.test.tsx` |
| F08 | Initial job query failure is distinct from not-found. Failure in any of the nine related reads shows retry instead of a misleading empty review/address/history. Transient auth failure does not redirect as if signed out. | `tests/component/JobPageReads.test.tsx` |
| F11 | Job identity boundary unmounts private forms on account change/sign-out. Ten job mutation routes require the rendered expected identity to match the verified server user before RPC/storage writes. | `JobConnectionSafety.test.tsx`, `tests/unit/jobApiSafety.test.ts` |
| F20 | JobWorkspace/JobTrustCenter share client acknowledgement handling; ten job APIs share sanitized error codes, messages and correlation IDs. Domain RPCs remain unchanged. | `workspaceMutation.test.ts`, `jobApiSafety.test.ts` |

## API compatibility and authorization

Job mutation requests now require `X-Orkestra-Expected-User`. The value must equal the authenticated server user. Missing/mismatched identity returns `409 ACCOUNT_CHANGED` before writes. Anonymous users remain rejected. First-party JobWorkspace and JobTrustCenter supply this header, including multipart uploads. External/manual clients must adopt the header; do not remove the guard to accommodate a stale client.

Affected routes: job messages, work-log, reviews, disputes, address, inspection proposal, scope-change proposal, transition; inspection and scope-change responses.

The header is not a credential or permission grant. SQL/RLS/RPC authorization remains authoritative. Local mocked API tests do not establish real RLS, role or concurrency correctness. Error correlation IDs are returned; no new persistent server tracing system is claimed.

## Verification

- Targeted regression suites: 69 tests passed across six files (including pre-existing analytics cases).
- Full suite with coverage: **53 files / 309 tests passed**.
- Coverage: statements 91.48%, branches 86.64%, functions 92.14%, lines 94.40%. Configured scope is data/domain/lib, not complete UI/API/SQL coverage.
- Type-check: passed.
- Lint: passed.
- Production build and style-entrypoint validation: passed.
- Local preview returned HTTP 200. No real signed-in browser, device or database verification is claimed.
- Test runner emitted jsdom's existing “navigation to another Document” diagnostic; assertions passed. This is not browser-navigation evidence.

## Deliberate limits and follow-up

- F08 uses conservative whole-room recovery, not independent section-level retries. Signed-media URL recovery remains separate. Unsaved forms are still memory-only; navigation/reload/account-change discards them intentionally or as an existing limit.
- F20 is consolidated for job rooms only. Moderation, pre-job and quote-specific flows retain their existing contracts; no application-wide completion claim.
- Trust-center uncertain outcomes require inspecting the current record before a fresh attempt. This does not add database-level upload/review/dispute idempotency. Existing upload/metadata cleanup failure risks remain.
- Existing job messages retain their retry key. Other JobWorkspace actions show uncertainty and do not automatically retry, but this slice does not introduce global mutation idempotency or durable pending operations.
- Reconnect requests fresh authoritative reads, not proof that an entire unpaginated history was delivered under every real outage. Pagination and server refresh failure UX remain follow-up work.
- Real multi-account auth return/switch, RLS, concurrent messages/acceptance and remote migration evidence remain in the deferred pre-release backlog. No feature flag was enabled.
- Phase 2 remains: labels/selection semantics, confirmation focus management, mobile consent/menu layering, compact hero ownership and visual checks.
- Phase 3 remains: stale E2E selectors, UI-debt budget, release evidence and broader regression coverage. Earlier UI-debt failure is not cleared by passing lint/build here; full CI/quality is not claimed green.

Next: apply Phase 2 as a separate, reviewable slice. Keep remote activation blocked until the deferred real-account and migration evidence is complete.
