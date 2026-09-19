# Umut Usta read API - initial implementation

Java 17 / Spring Boot / JPA. The React application is not switched over yet.
Write endpoints are opt-in and disabled by default; no automatic schema migrations are included.

Endpoints:
- GET /api/v1/services: active services in stable display order.
- GET /api/v1/availability?from=YYYY-MM-DD&to=YYYY-MM-DD: visible slots,
  past days omitted using Europe/Istanbul; closed days and confirmed slots unavailable.
- GET /api/v1/admin/appointments?from=YYYY-MM-DD&to=YYYY-MM-DD&status=new&page=0&size=20:
  authenticated, active owner/admin/operator only; archived rows excluded.
  Filters use appointment date, not record creation date. Max size 100; max date
  difference 90 days. DTOs omit public tokens, phone numbers and internal notes.

Run tests: mvn -B -f the-welding-expert-app/backend/pom.xml verify

To start with an explicitly configured development database, set
BOOKING_DATABASE_URL (JDBC PostgreSQL URL), BOOKING_DATABASE_USER,
BOOKING_DATABASE_PASSWORD, BOOKING_JWT_ISSUER and BOOKING_JWKS_URI, then run
mvn -f the-welding-expert-app/backend/pom.xml spring-boot:run.
Default port is 8080. Do not put credentials in source files or command arguments.

Use a dedicated least-privilege database reader for deployment. Hibernate validates
the mapped schema and the pool defaults to read-only. Read-only transactions are
not a substitute for database grants. JDBC does not inherit Supabase user identity;
admin access is checked using verified JWT subject plus current admin_profiles.
Issuer, signature, expiry and authenticated audience are required. JWKS supports
RS256/ES256; legacy HS256 is not configured. Confirm project signing mode before rollout.

Testing commands:
- `mvn -f the-welding-expert-app/backend/pom.xml test`: MVC tests; no Docker.
- `mvn -f the-welding-expert-app/backend/pom.xml verify`: MVC and real PostgreSQL
  integration tests through Failsafe; requires Docker. Missing Docker fails the run.
- `mvn -f the-welding-expert-app/backend/pom.xml verify -DskipITs`: explicitly skip
  integration execution for a local compilation/package check; not a database pass.

BookingReadPostgresIT starts disposable PostgreSQL 17.6, loads the repository base
schema, service configuration migration, role migration and the reservation
transition migration (`20260910150437_appointment_reservation_transitions.sql`), then starts the actual
Spring context with Hibernate schema validation. It exercises native queries and
JPQL through the transactional service proxy, without mocking EntityManager.
Fixtures use separate committed JDBC connections, outside the read-only service.
It covers ordering, nullable DTO fields, SQL date/time conversion, visibility,
past dates, closed and confirmed slots, archive exclusion, pagination totals,
current database roles and invalid query bounds. Reports: target/failsafe-reports.

The Supabase auth catalog is a test shim. Integration tests now serve ephemeral
RSA public keys from a loopback JWKS server and send signed Bearer tokens through
MockMvc and the actual auto-configured JWT decoder. They cover invalid signature,
expired tokens beyond clock skew, wrong issuer/audience, malformed/unknown subjects,
and role revocation with the same valid token. No decoder or service is mocked.

Spring uses a separate non-owner, non-superuser, NOBYPASSRLS reader. Fixture-only
SELECT policies and grants cover the five read tables. PUBLIC function execution
is revoked in the disposable database to prevent SECURITY DEFINER write RPC access.
Direct JDBC tests disable reliance on read-only transactions and assert SQLSTATE
42501 for writes, truncate, write RPC calls and auth.users access. Owner connections
are used only for fixture setup. These fixture grants are not a deployment migration;
production RLS/grants and ES256/key rotation still require separate validation.
No external database URL is accepted by the fixture. Production traffic is unchanged.

References: https://docs.spring.io/spring-security/reference/6.5/servlet/oauth2/resource-server/jwt.html

Admin filter compatibility (opt-in React adapter):
- `archived=true` selects archived rows only; default selects active rows.
- Optional `from`/`to` must be supplied together and filter appointment dates.
- `createdAfter` is inclusive and `createdBefore` exclusive, using ISO instants.
- `search` matches the existing eleven text fields, with literal `%`, `_`, `!`.
  Search is trimmed and limited to 200 characters; query values are bound.
- `leadQuality`: qualified, unqualified, outside_area, spam, untagged (SQL NULL).
- `sort=newest` uses createdAt descending with id tie-break; default remains appointment.
- Pages remain zero-based, size 1..100. The opt-in React adapter subtracts one
  from the existing one-based page and omits `all` filter sentinels.
- Items/count share all predicates. The limited DTO is unchanged: the adapter
  explicitly reads card details through the existing authenticated Supabase/RLS
  integration. This hybrid boundary needs real Auth/RLS browser acceptance before rollout.
- Deployment now also requires the existing lead-quality migration. Tests load
  analytics_events_migration.sql before sprint_6_measurement_release.sql.

## Ephemeral CI staging

The database-contract workflow installs Chromium and sets CI_BROWSER=true.
The PostgreSQL integration suite starts Spring on a random loopback port with the
restricted reader, then runs playwright.spring.config.js while its container lives.
Vite proxies /api/v1 to that port. The browser selects a real PostgreSQL slot via
Spring and submits a real pending request at mobile and desktop widths. Admin filtering
is verified separately through authenticated HTTP integration tests.

No repository secrets or production endpoints are required. Synthetic gallery and
analytics responses are isolated from the real service/availability reads; other
external browser requests are blocked. Creation uses the opt-in Spring command;
production Auth/Storage parity is not claimed. Playwright reports, screenshots, traces on failure and
JUnit reports are uploaded together. The runner is destroyed after the job.

VITE_BOOKING_READ_BACKEND=spring enables only the two public read adapters; omitted
means existing Supabase behavior. Errors do not silently fall back to Supabase.
CI_SPRING_ORIGIN is a server-only Vite proxy target, not a browser credential.
Empty days without slots are omitted by the slot API and remain unavailable in UI.
This is a staging slice, not authorization to switch production.

## Opt-in creation and confirmation

`BOOKING_WRITES_ENABLED=true` registers the following commands:
- POST /api/v1/appointments (public, 201): JSON customer_name, customer_phone,
  service_type, requested_date, requested_time, optional customer_email/message/customer_note.
  Calls the existing create_appointment_request SQL function inside a Spring
  TransactionTemplate. Returns id/public_token; pending requests do not reserve slots.
- POST /api/v1/admin/appointments/{id}/confirm (Bearer JWT): current active
  owner/admin/operator required. Locks the request row, accepts new/contacted,
  rejects archived/terminal records, and treats an already-confirmed request as
  an idempotent success. Updates only status; the existing SQL trigger locks the slot.
  Missing record is 404, forbidden role 403, slot conflict 409 with code
  appointment_slot_unavailable. SQL internals are not returned to clients.
- POST /api/v1/admin/appointments/{id}/cancel (Bearer JWT, 200): current active
  owner/admin/operator required. Locks the request row and allows new/contacted/
  confirmed -> cancelled. An already-cancelled, non-archived request succeeds
  without another update. Archived and completed records return 409; missing
  records return 404. The existing PostgreSQL trigger releases a confirmed slot
  in the same writer transaction. Cancelling a pending request or retrying an old
  cancellation must not release another request's reservation. Customer self-service
  cancellation is not exposed by this endpoint; no tracking token is accepted.

The writer uses BOOKING_WRITER_DATABASE_URL/USER/PASSWORD and a separate pool;
the JPA read datasource remains read-only. Writer SQL is coordinated by Spring's
DataSourceTransactionManager, not a second ORM model or a replacement slot lock.
Fixture permissions allow request/profile reads, status/date/time/archive updates and execution
of the creation function; direct INSERT/DELETE, customer edits and role edits are denied.
These test-only grants are NOT a production provisioning script.

The CI browser enables VITE_BOOKING_WRITE_BACKEND=spring and submits a real request
at both viewport sizes. The test checks both pending rows exist after browser exit.
Tracking-link generation is tested; tracking-page reads, photos and subsequent
self-service changes still use the old integration and are not tested end-to-end here.

Tests include HTTP parallel confirmations with observable database lock waits,
one 200 and one 409, invalid creation, terminal/archived guards, and rollback of
both create and confirm when a later statement fails in the same Spring transaction.
The raw reader remains unable to write. Default-off endpoint tests run without Docker.

Cancellation integration coverage includes allowed source states, repeated calls,
reservation reuse, cancellation of a pending request sharing an occupied slot,
authorization/state guards and status/slot rollback after a later SQL failure.
The cancellation tests require a new CI run; the earlier create/confirm result
does not verify this addition. No new production grants or migration are included.

Before production: provision/review writer grants and RLS, request size/rate limits,
anti-abuse controls, idempotency for uncertain creation retries, schema parity and
deployment rollback. No automatic retry or Supabase write fallback is implemented.
Authorization uses the current profile at command entry; it does not promise to
abort an already-running operation on a concurrent role revocation.

## Opt-in administrator rescheduling

POST /api/v1/admin/appointments/{id}/move accepts requested_date (ISO date) and
requested_time (local time), and returns id/status/requested_date/requested_time.
It uses the existing writes flag and active owner/admin/operator authorization.
Only non-archived confirmed requests may move. Missing fields or past target days
(Europe/Istanbul) return 400; missing requests return 404; invalid source state or
unavailable target returns 409. Same-slot requests preserve the existing reservation.
There is no new elapsed-hour policy for slots on the current day.

The writer transaction locks the request row and updates date/time together without
changing status. The existing transition trigger locks both slots in stable order,
reserves the target and releases the source. Any failure rolls back all changes.
No Java-side replacement for SQL locking, retry loop or live migration is added.
The isolated fixture now grants UPDATE on requested_date/requested_time in addition
to status. Production writer privileges require separate review before enabling this.

New PostgreSQL tests cover same-day/next-day moves, same-target retries, unavailable
targets, role/state/input guards, rollback and parallel HTTP move/confirmation with
observed lock waits. These additions are pending CI execution; prior green runs do
not verify rescheduling. The browser staging slice still covers creation, not a
rescheduling UI. Customer self-service remains out of scope.

## Opt-in archive restoration

POST /api/v1/admin/appointments/{id}/restore requires the existing writes flag and
an active owner/admin/operator. Only confirmed requests are supported in this slice;
other statuses return 409 without changes. Missing requests return 404. A confirmed
request already outside the archive returns 200 without another update.

The writer locks the request row, then clears only archived_at. The existing SQL
trigger locks/revalidates the slot and restores the reservation in the same transaction.
An occupied, closed, hidden or unavailable slot returns 409 appointment_slot_unavailable;
the original archive timestamp and reservation state remain unchanged. No status,
date or customer data is changed. The response contains id and status only.
Existing SQL rules determine slot eligibility; no new past-date or elapsed-hour
policy is introduced for restoration.

Only the disposable fixture grants the writer UPDATE on archived_at. No production
grant or schema migration is applied. Tests cover restoration/retry, unavailable
targets, exact archive timestamp preservation, rollback and authorization/state
guards. These new PostgreSQL tests are pending CI execution and are not covered by
the previous green cancellation run. Browser restore acceptance is not covered here.

## Administrator adapter and acceptance

`VITE_BOOKING_ADMIN_BACKEND=spring` enables list/confirm/cancel/move/restore routing.
Notes, lead quality and archiving remain on the existing Supabase integration.
Unsupported status transitions are disabled; move is available only for active
confirmed requests. Mutations refresh both requests and availability after success
or failure. Slot conflicts show a 409-specific message without automatic write fallback.
Component/adapter tests cover mapping, pagination/filter reset, supported states,
move submission and refresh after a conflict.

The PostgreSQL lifecycle acceptance test chains HTTP creation, confirmation, move,
restore conflict, retry after cancellation and final cancellation. Archive state
is seeded by fixture SQL because archiving is not a Spring command. This is not a
real Supabase-authenticated administrator browser test.

The separate `umut-admin-acceptance.yml` workflow now prepares real Supabase Auth,
PostgREST and Spring browser acceptance with synthetic mobile/desktop fixtures.
Execution is still pending; see `../docs/Admin_Acceptance_And_Rollout.md` for the
coverage, remaining operational gates and separate rollout approvals. This does
not change production grants or enable any backend/ frontend feature flag.
