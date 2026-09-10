# Umut Usta read API - initial implementation

Java 17 / Spring Boot / JPA. The React application is not switched over yet.
No write endpoints or automatic schema migrations are included.

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

Admin filter compatibility (not yet wired to React):
- `archived=true` selects archived rows only; default selects active rows.
- Optional `from`/`to` must be supplied together and filter appointment dates.
- `createdAfter` is inclusive and `createdBefore` exclusive, using ISO instants.
- `search` matches the existing eleven text fields, with literal `%`, `_`, `!`.
  Search is trimmed and limited to 200 characters; query values are bound.
- `leadQuality`: qualified, unqualified, outside_area, spam, untagged (SQL NULL).
- `sort=newest` uses createdAt descending with id tie-break; default remains appointment.
- Pages remain zero-based, size 1..100. A React adapter must subtract one from
  the existing one-based page; it must not forward `all` filter sentinels.
- Items/count share all predicates. The limited DTO is unchanged: admin detail
  fields and the React adapter must be completed before switching the admin UI.
- Deployment now also requires the existing lead-quality migration. Tests load
  analytics_events_migration.sql before sprint_6_measurement_release.sql.

## Ephemeral CI staging

The database-contract workflow installs Chromium and sets CI_BROWSER=true.
The PostgreSQL integration suite starts Spring on a random loopback port with the
restricted reader, then runs playwright.spring.config.js while its container lives.
Vite proxies /api/v1 to that port. The browser selects a real PostgreSQL slot via
Spring and reaches the contact step at mobile and desktop widths. Admin filtering
is verified separately through authenticated HTTP integration tests.

No repository secrets or production endpoints are required. Synthetic gallery and
analytics responses are isolated from the real service/availability reads; other
external browser requests are blocked. There is no booking submission or production
Auth/Storage parity claim. Playwright reports, screenshots, traces on failure and
JUnit reports are uploaded together. The runner is destroyed after the job.

VITE_BOOKING_READ_BACKEND=spring enables only the two public read adapters; omitted
means existing Supabase behavior. Errors do not silently fall back to Supabase.
CI_SPRING_ORIGIN is a server-only Vite proxy target, not a browser credential.
Empty days without slots are omitted by the slot API and remain unavailable in UI.
This is a staging slice, not authorization to switch production or expose writes.
