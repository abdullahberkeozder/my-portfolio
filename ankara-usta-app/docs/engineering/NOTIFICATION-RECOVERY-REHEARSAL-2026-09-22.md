# Notification recovery rehearsal — 22 September 2026

Target: existing isolated `orkestra-e2e` (`hyuijuafuayzultbjvjb`).
Source baseline: `8c80fb7` plus local worker health/testing changes and this fixture.
Status: isolated database contract verified; not a deployed worker or provider test.

## Execution

From `ankara-usta-app`, with project Node 24.19.0:

```powershell
$env:E2E_ALLOW_STAGING_WRITES='true'
.\.tools\node-v24.19.0-win-x64\node.exe scripts/run-notification-rehearsal.mjs
```

Exit 0. All assertions passed and a separate database connection confirmed no
fixture persisted. The runner checks the existing staging guard and the exact
approved E2E project ID before SQL execution. Production was not mutated.

## Verified behavior

- Deployed email claim RPC claimed only the dedicated negative-ID fixture and
  incremented attempts, set processing state and worker ownership.
- Failures 1–7 scheduled delays of 30, 60, 120, 240, 480, 960 and 1920 seconds.
- Eighth failed attempt entered `dead`; no success timestamp remained.
- Result RPC rejected a terminal row rather than acknowledging it again.
- A simulated six-minute-old lease was reclaimed by another worker, with an
  incremented attempt and new worker ID. A subsequent success set `sent`, cleared
  failure/worker fields and recorded a timestamp.
- The deployed cron entry was active on `*/10 * * * *` with a 15-minute stale
  threshold. Its actual SQL, with an added fixture-ID predicate, recovered attempt
  seven to `retrying` and attempt eight to `dead`.
- Unrelated outbox rows were byte-for-byte equivalent as JSON before/after the
  assertions. All mutations were rolled back, not cleaned up by broad deletion.

## Isolation and limits

Preflight found **125 eligible email rows** in staging. No general worker or email
provider was started. The fixture uses an unused event/test-recipient pair, a
negative explicit identity and earliest-time sentinel, with limit=1. A short table
lock stabilizes the queue; lock timeout is 3s and statement timeout is 30s. An
existing sentinel/fixture collision causes an immediate failure. Existing identity
sequences are not advanced by the explicit fixture ID.

Assertions run through the administrative SQL connection; selected service-role
grants and public denials are inspected, not a complete REST authorization suite.
This transaction is serialized. It does not prove simultaneous SKIP LOCKED claims,
real process death, timer wake-up, provider delivery, idempotency-window behavior,
or the complete .NET-to-PostgREST boundary. The cron SQL is exercised manually with
a scope predicate; the actual scheduler was not awaited.

Source review also identifies a follow-up: `mark_notification_result` accepts only
notification ID/result/error and checks `processing`, not the current worker or a
lease token. A delayed old worker could therefore acknowledge a reclaimed lease.
No competing-worker race was executed in this slice; lease fencing needs its own
negative fixture and coordinated RPC/client change before claiming race safety.

## Next slice

Add lease ownership/fencing and a stale-worker negative test, then a true two-session
claim test. Keep fixtures scoped and delivery fake. After that, rehearse the worker
process against isolated data and an explicitly controlled provider sink; record
retry/dead-letter alerts and the operator responsible for recovery.

No migration, deployment, commit or push was performed by this rehearsal.
