# Administrator acceptance and controlled rollout

## Status

The new administrator browser suite is prepared, not yet verified in CI.
Listing tests or passing component tests is not PostgreSQL acceptance evidence.
No production SQL, grants, feature flags or deployment configuration are changed.

## Disposable acceptance environment

Workflow: `.github/workflows/umut-admin-acceptance.yml`.
Runner: `e2e/admin-ci/run.mjs`; Playwright config: `playwright.admin-ci.config.js`.

The job creates an unlinked Supabase stack in the GitHub runner, applies the
repository schema and reservation-transition migration, provisions one synthetic
active administrator through Auth, and starts Spring with separate restricted
reader/writer database roles. Private signing keys and passwords are generated per
run, never committed, and deleted with the temporary directory. No account login,
project link, paid cloud resource or production credential is required.

The browser signs in through the actual login form. Supabase Auth issues ES256
tokens; Spring verifies them against the local Auth JWKS. Hybrid card details and
archiving use actual PostgREST and the repository's authenticated RLS policies.
There are no mocked login, listing, command or 409 responses. The fixture reader
and writer policies match the existing PostgreSQL IT model, not production grants.

The command helper only connects to the fixed disposable Docker container and
requires both GitHub Actions and the explicit test-job marker. Browser HTTP traffic
is restricted to the local application and local Supabase origins. Realtime request
publications are excluded so mutation refresh cannot pass solely because of a
background subscription notification.

Ten cases cover the following in mobile and desktop Chromium:

- Real login; 27 active requests over two pages; ordering/membership; search,
  quality and status filters; archive visibility and unsupported restoration.
- Confirmation does not depend on the pending request reserving a slot.
- Confirm, move, archive, restore and cancel persist their intended slot state.
- A second authenticated session occupies the destination before confirm, move
  or restore. Each receives a genuine Spring 409 with the slot-conflict code.
- After each command, a new list request starts. After conflict, the translated
  message appears and the untouched note field shows the second session's edit.
- Failed commands preserve the request and source/destination availability.
  A subsequent UI retry succeeds after the other session releases the slot.

Existing Java PostgreSQL tests remain responsible for truly parallel lock waits,
deadlocks and injected later-statement rollback. This browser suite tests stale
screens and recovery; it does not replace that concurrency coverage.

Only HTML reports/screenshots of synthetic data are uploaded for three days.
Traces, videos, saved auth state, CLI status output and private keys are excluded.
Neither a Supabase emulator nor a production database is used.

## Required evidence before acceptance

Record the exact commit, workflow run URL, ten executed browser results and the
existing PostgreSQL contract result. Review any failed screenshot and rerun the
affected checks after fixing the cause. Do not treat retries or skipped tests as
success. The current package has not yet supplied these CI results.

## Operations gate (not yet complete)

The current Spring configuration does not yet provide dedicated liveness/readiness,
an alert integration or enforced request-rate limits. These are remaining work,
not features supplied by the browser runner's temporary readiness poll.

| Area | Required implementation and isolated proof |
| --- | --- |
| Health | Liveness independent of database health; readiness checks the reader and, when enabled, writer. No configuration/connection details in public responses. Test database interruption, non-ready status and recovery. |
| Error monitoring | Correlation ID, route template, status, duration and error code without body, JWT, tracking token, phone or customer name. Separate expected slot 409 from transient transaction conflicts, 5xx and timeouts. Verify redaction and alert delivery. |
| Rate limits | Define trusted proxy boundaries and enforce server-side limits for anonymous creation and authenticated commands. Return 429 with Retry-After before database work. Test bursts, recovery and multiple instances; a process-local limit alone is not distributed abuse protection. |
| Rollback | Select the actual host and immutable previous artifact; record configuration separately. Deploy candidate in isolation, create/modify a synthetic request, revert application version, verify session/read compatibility and unchanged request/slot state. Record measured recovery time. |

Hosting and a previous Spring deployment artifact are not established by the
existing Vercel frontend release. Therefore a genuine Spring deployment rollback
rehearsal cannot currently be marked complete. Do not substitute a git checkout or
frontend refresh for that rehearsal. Do not reverse the slot-safety SQL migration
as part of application rollback. Unknown creation outcomes must be checked before
retrying; there is no automatic write fallback or creation idempotency guarantee.

## Separate approvals for activation

Every stage needs an explicit approval identifying the target deployment and
configuration. CI success is not production authorization. Verify live SQL/trigger
parity and least-privilege grants separately; this test fixture cannot establish
those facts.

1. **Services and availability:** enable `VITE_BOOKING_READ_BACKEND=spring` only.
   Keep admin and customer write routing disabled. Verify empty/error availability
   states as well as successful reads, then observe operational measurements.
2. **Administrator commands:** enable `VITE_BOOKING_ADMIN_BACKEND=spring` only after
   real-session acceptance and the operations gate pass. Notes, quality and archive
   still use Supabase, so authenticated RLS and schema parity remain mandatory.
3. **Customer creation:** enable `VITE_BOOKING_WRITE_BACKEND=spring` only after the
   separate creation abuse/uncertain-outcome policy and end-to-end checks pass.

**Backend gating gap:** today `BOOKING_WRITES_ENABLED=true` exposes both admin
commands and anonymous POST `/api/v1/appointments`. Leaving the frontend customer
flag off does not close that endpoint. Separate server-side admin/create switches
and disabled-endpoint security tests are required before stage 2 can honestly
promise that customer creation remains closed. Do not rely on hidden UI controls.

Vite flags are build-time settings: verify the deployed build, not just the
environment dashboard. For each stage, record approval, artifact/commit, non-secret
flag values, health/acceptance evidence, observation window and rollback decision.
Stop escalation when any acceptance, authorization, integrity or operational check
fails; never enable the next stage merely because a deployment reports Ready.
