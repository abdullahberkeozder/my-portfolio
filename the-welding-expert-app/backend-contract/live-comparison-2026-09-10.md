# Live comparison, 2026-09-10

Read-only metadata inspection of the Supabase project named the-welding-expert-app.
No customer rows were read or written. Server major: PostgreSQL 17 (17.6.1.155).

Compared function bodies after removing CR and trimming surrounding whitespace.
MD5 here is only a reproducible text comparison, not a security mechanism.

| Function | Repository and live body MD5 | Result |
| --- | --- | --- |
| create_appointment_request | 33a46c4b7888b05564aaed99a61fb84f | Equal |
| handle_appointment_status_slot_sync | bd0de014647be8f0422c0024bf22cf81 | Equal |

Live slot trigger is BEFORE DELETE OR UPDATE OF status, archived_at, FOR EACH ROW,
calling handle_appointment_status_slot_sync(). It matches the tested baseline.
Timestamp, customer-note protection, first-contact and legacy-note triggers are
also present on the inspected tables. Live slot uniqueness is (day_id, slot_time),
and day uniqueness is work_date. No unique confirmed-appointment-per-slot index
was returned by the appointment table index inventory.

CI evidence: https://github.com/abdullahberkeozder/my-portfolio/actions/runs/34470901422
The postgres-contract job succeeded for commit 10a3df0.

Confirmed gaps in definitions (not exercised by mutating production):
- Direct date/time changes on a confirmed appointment do not transfer reservation.
- Restoring an archived confirmed appointment does not revalidate/reserve its slot.
- A direct INSERT with status confirmed is outside this UPDATE/DELETE trigger.

Before write API exposure: use explicit command endpoints, define permitted state
transitions, and prove atomic reschedule/restore behavior in disposable PostgreSQL.
Never expose arbitrary entity updates or allow callers to create confirmed rows.
The inspection does not claim full schema, RLS, history/outbox or Auth parity.
