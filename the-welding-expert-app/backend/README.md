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

Current verification: MVC security boundary tests and compilation locally. Existing
database transaction contracts run separately in PostgreSQL CI. Native read query
and JPA mapping integration tests against the deployment schema remain a rollout
gate; do not switch production traffic based solely on MVC tests.

References: https://docs.spring.io/spring-security/reference/6.5/servlet/oauth2/resource-server/jwt.html
