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
schema, service configuration migration and role migration, then starts the actual
Spring context with Hibernate schema validation. It exercises native queries and
JPQL through the transactional service proxy, without mocking EntityManager.
Fixtures use separate committed JDBC connections, outside the read-only service.
It covers ordering, nullable DTO fields, SQL date/time conversion, visibility,
past dates, closed and confirmed slots, archive exclusion, pagination totals,
current database roles and invalid query bounds. Reports: target/failsafe-reports.

The Supabase auth catalog is a test shim. These tests do not prove JWT signatures,
production RLS, or deployment reader grants. No external database URL is accepted
by the integration fixture. Production traffic remains on the existing frontend.

References: https://docs.spring.io/spring-security/reference/6.5/servlet/oauth2/resource-server/jwt.html
