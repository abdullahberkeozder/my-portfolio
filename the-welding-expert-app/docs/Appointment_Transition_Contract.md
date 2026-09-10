# Appointment reservation transition contract

Local implementation, 2026-09-10. Not deployed; PostgreSQL execution pending CI.

## Rules in this change

- New requests remain pending and do not reserve a slot.
- Confirmation must use UPDATE, not direct confirmed INSERT (including archived confirmed INSERT).
- Restoring an archived confirmed request retains its status only when the slot can be reserved again. Otherwise the entire update fails and the request stays archived.
- Moving an active confirmed request keeps its confirmed status. Both slots are locked in date/time/id order. The target must exist, be visible, open and available, with no other active confirmed request.
- Failed moves retain the old request date/time and reservation. Successful moves reserve the target and release the source within the same transaction.
- Moving and leaving active confirmed status in the same update is rejected. Cancel/archive and move are separate operations.
- Existing cancellation, archive and delete release behavior is preserved, but a slot is not reopened over another active confirmed request in legacy inconsistent data.
- Repeating an unchanged confirmed update does not reserve again.
- Confirmed -> completed keeps the existing closed-slot behavior. Pending customer change requests still do not move reservations.

This patch does not define the complete status/role matrix, elapsed-hour policy,
manual slot closure ownership, idempotency or customer command authorization.
Existing grants/RLS remain unchanged. No Spring write endpoint is added.

## Deployment gate

Apply the existing base schema first, then
`supabase/migrations/20260910150437_appointment_reservation_transitions.sql`.
Both Java test suites explicitly load this migration after the baseline.
Do not rerun the baseline afterward: it replaces the function and trigger.
The earlier live-comparison document describes the old baseline, not this patch.

Before production: run CI PostgreSQL tests; inspect duplicate active confirmations
and slot inconsistencies using read-only queries; review status rules and migration
ordering; validate in staging. This patch does not repair old rows or add a unique
index. It does not guarantee protection against privileged manual slot overrides.
Bulk/multi-command transactions may still deadlock and must roll back safely;
stable slot ordering here is not a universal deadlock-free guarantee.

Test coverage includes free/occupied restore, time/date moves, hidden target,
move rollback, confirmed INSERT rejection, completed compatibility, delete release,
and confirm/restore/move contending with an in-flight confirmation. The contender
must be observed waiting via pg_blocking_pids, not assumed to overlap via sleeps.

Remaining concurrency cases: lock-holder rollback followed by waiter success,
opposite-direction moves and cancel/archive races. No production writes are
authorized by this document.

Reference: [PostgreSQL row locking](https://www.postgresql.org/docs/17/explicit-locking.html).
