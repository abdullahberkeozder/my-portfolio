# Notification result lease fencing

Status: implemented, targeted migration recorded in isolated `orkestra-e2e`,
.NET contracts verified, one concurrent database race verified. Not committed or
released; worker polling and provider sends remain disabled.

## Contract

Migration `20260922205318_notification_result_lease_fencing.sql` removes the
unfenced three-argument result RPC and adds `(id, worker_id, attempt, succeeded,
error)`. An atomic UPDATE requires processing state, the current owner and the
claimed attempt generation. Both existing claim RPCs increment attempts on every
claim. Owner/generation mismatch raises P0001 without changing any row.
Only service_role can execute; anon/authenticated are denied.

Expiry makes a lease reclaimable; expiry alone does not revoke it. Takeover or
cron recovery invalidates the old acknowledgement. Attempts must never be reset
on the same row; unsafe manual reset guidance was removed from the runbook.
Privileged direct table writes remain outside this RPC protection boundary.

The .NET client sends the original claim's attempt and worker identity for both
success and failure. A failed acknowledgement propagates, never triggers a second
failure acknowledgement, and does not claim persisted delivery success.

## Evidence

- `npm run dotnet:check`: exit 0; Release build, 0 warnings/errors; health,
  delivery/failure/cancellation, fencing payload and single-acknowledgement tests.
- Targeted migration `20260922205318_notification_result_lease_fencing` was
  applied with a matching `supabase_migrations.schema_migrations` row in
  **orkestra-e2e only** (`hyuijuafuayzultbjvjb`). Preflight confirmed the email
  claim migration was present, old result signature existed, and no processing
  rows remained. No bulk migration push, production mutation or worker polling.
- Candidate DDL rollback rehearsal was performed before targeted activation; its
  temporary RPC and fixture were verified absent afterward.
- Late success and failure from old worker rejected; wrong worker with current
  attempt rejected; current worker with stale attempt rejected; reclaimed row
  unchanged after rejection; current owner succeeds.
- Two separate Supabase SQL transactions overlapped on the same negative-ID
  fixture. Transaction B reclaimed the expired lease; A submitted the old
  worker's success while B held its row update. A waited for the row lock, then
  was rejected after B committed. B's row was unchanged, the current owner could
  acknowledge, and the unrelated-queue digest matched after exact-fixture cleanup.
- A second optional race repetition and the direct integration of a running .NET
  worker were not verified; concurrent Management API queries proved timing
  sensitive. The passing overlap above is the sole live race evidence.
- Retry/backoff, eighth-failure dead-letter, terminal rejection and scoped cron
  recovery pass. Other queue rows remain unchanged; separate connection confirms
  fixture cleanup. This supersedes the open fencing finding in the earlier
  recovery rehearsal, not its historical evidence.

## Activation and remaining limits

Before enabling polling in any environment, deploy the matching .NET build and
run the rehearsal without the candidate flag. Old clients deliberately fail
closed. Do not restore the unfenced RPC as a rollback shortcut. If deployment
fails, keep workers stopped and roll forward with a compatible client/RPC pair.

The isolated RPC is active, but no worker process was configured or started.
Next evidence: .NET worker-to-PostgREST integration with fake delivery, followed
by a controlled worker start. This proves one database interleaving, not general
provider exactly-once delivery or a safe dead-letter redrive workflow.
