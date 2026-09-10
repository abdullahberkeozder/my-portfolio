# Appointment database contract

Status: PostgreSQL contract CI passed on 2026-09-10 (run 34470901422).
Local Docker remains unavailable. Critical live function bodies and slot trigger
were compared read-only; see live-comparison-2026-09-10.md for scope and evidence.

## Run

Requires Java 17+, Maven 3.9+ and a running Docker engine with Linux containers.
From the repository root:

```sh
mvn -B -f the-welding-expert-app/backend-contract/pom.xml verify
```

The suite creates a disposable PostgreSQL 17.6 container. There is no external
database URL option; it never connects to Supabase production. Docker absence is
a failure, not a skipped green test. Reports are written under target/surefire-reports.

## Baseline and scope

The suite loads ../supabase/welding_appointments_schema.sql verbatim through JDBC.
It provides only auth.users, auth.uid() and database roles as a catalog shim.
It tests database integrity as the container database owner, NOT JWT validation,
RLS, customer authorization, Spring transaction propagation or JPA flush behavior.
Those need separate integration tests during API implementation.

Historical scripts are not applied alphabetically: atomic_appointment_confirmation.sql
and sync_appointment_status_with_slot.sql contain older trigger definitions, while
the consolidated schema includes archive handling. Later sprint scripts add more
behavior, including customer action history and notification outbox. This suite
does not yet cover that later self-service transaction.

Before adopting a deployment baseline, run inventory.sql read-only in the target
database and compare definitions with the repository. A scoped production inventory
has been collected; it is not a complete schema export. Do not apply this baseline to production.

## Behavior matrix

| Operation | Existing contract | Automated coverage |
| --- | --- | --- |
| Create two pending requests | Both may exist; slot remains open | requestsDoNotReserveSlot |
| Concurrent confirmation | Second transaction waits, then receives P0001/appointment_slot_unavailable | concurrentConfirmationWaitsThenRejectsSecondRequest |
| Failure after confirmation within transaction | Request status and slot both roll back | confirmationAndSlotRollbackTogether |
| Create against unavailable slot | No request inserted | unavailableSlotDoesNotLeaveRequest |
| Cancel confirmed request | Slot becomes available for another confirmation | cancellationReleasesSlotForAnotherRequest |
| Archive confirmed request | Consolidated SQL releases slot | Pending coverage |
| Restore confirmed archive | Missing reservation revalidation in inspected SQL | Integration blocker |
| Change confirmed date/time | Trigger does not handle direct date changes | Integration blocker |
| Customer cancellation/change request | A request for administrator action, not immediate rescheduling | Later sprint SQL; pending coverage |

## Spring integration gates

1. Compare target database inventory and select an explicit migration order.
2. Run this suite successfully against PostgreSQL; align the image major version
   with the target database after inventory.
3. Define allowed status transitions. Keep creation as a pending request and
   confirmation as the reservation boundary.
4. Add atomic rescheduling and archive-restore contracts before exposing those
   writes. A failed reschedule must preserve the original reservation. Lock both
   affected slots in deterministic order where needed to avoid inverse moves.
5. Add the rollback-winner concurrency case, different-slot parallel operations,
   day-closing races, and customer-action/history/outbox rollback tests.
6. Re-run these contracts through Spring service transactions and JPA, including
   flush/commit exceptions. Map slot conflicts to HTTP 409 after rollback.
7. Validate Auth/RLS boundaries independently; JDBC does not inherit the caller's
   Supabase identity. Keep customer tokens out of logs.

Stages 1-2 are not declared complete until the inventory comparison and real
database execution pass. Application SQL and customer-facing code are unchanged.

References: https://java.testcontainers.org/modules/databases/postgres/
and https://www.postgresql.org/docs/17/explicit-locking.html
