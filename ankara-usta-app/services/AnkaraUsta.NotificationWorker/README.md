# Orkestra Notification Worker

This ASP.NET Core service connects the marketplace's PostgreSQL transactional outbox to the Resend email API. It claims email deliveries through privileged Supabase RPCs using a server-only Secret API key, resolves the recipient through Supabase Auth Admin, sends an idempotent transactional email, and reports success or failure to the existing retry state machine.

## Why a separate service

Email provider latency must not determine whether a job message, appointment, scope change, or status transition commits. PostgreSQL records the domain event and its notification in one transaction. This worker performs network delivery after commit and preserves the database's retry and dead-letter behavior.

## Local run

Requires the .NET 10 SDK. Supply the values from `.env.example` as environment variables; do not commit Supabase Secret API or provider keys.

```powershell
dotnet run --project services/AnkaraUsta.NotificationWorker
```

Health endpoints (no database queries or email sends):

- `GET /health/live`: HTTP 200 while the HTTP process responds.
- `GET /health/ready`: HTTP 503 when required configuration is missing or invalid;
  HTTP 200 with `scope: "configuration"` when configured.
- `GET /health`: compatibility liveness endpoint; its HTTP 200 is not readiness.

Configuration checks require an HTTP(S) URL without embedded credentials, query or
fragment, nonblank service/provider keys and a parseable sender address. They do
not authenticate keys, verify a sender domain, test network access, or prove
delivery. Options are read at startup; restart after configuration changes.
Missing/invalid configuration disables polling but leaves liveness available.

Run `npm run dotnet:check` from the application root. Tests host the production
health endpoint mapping on an ephemeral loopback port with no delivery services
registered. They also cover provider failure, missing recipients and cancellation
using fakes. No external email, paid provider or database is needed.

For a real, read-only connectivity check, run this command interactively. If no
key is set in the process environment, the test prompts for it without echoing
input. The probe is hard-restricted to the isolated `orkestra-e2e` project:

```powershell
dotnet run --project services/AnkaraUsta.NotificationWorker.Tests -- --postgrest-smoke
```

This issues `GET /rest/v1/` with the key in the `apikey` header only. It does not
claim outbox rows, call RPCs, start the hosted worker, or send email. Modern
`sb_secret_...` keys are opaque and must not be sent as `Authorization: Bearer`.

## External contracts

- Supabase Data REST RPC: `claim_email_notification_batch`
- Supabase Auth Admin: recipient lookup by user ID
- Supabase Data REST RPC: `mark_notification_result` with `p_id`, `p_worker_id`,
  `p_attempt`, `p_succeeded`, `p_error`. Requires migration
  `20260922205318_notification_result_lease_fencing.sql`; stop workers during the
  coordinated RPC/client rollout. Old unfenced signature is removed. Failed
  acknowledgements are not retried as delivery failures.
- Resend Email API: `POST /emails` with `Idempotency-Key: ankara_usta_notification_<outbox-id>`

Provider delivery is intentionally at-least-once at the worker boundary and effectively-once within Resend's idempotency window. PostgreSQL remains the authoritative delivery state.
