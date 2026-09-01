# Orkestra Notification Worker

This ASP.NET Core service connects the marketplace's PostgreSQL transactional outbox to the Resend email API. It claims email deliveries through service-role-only Supabase RPCs, resolves the recipient through Supabase Auth Admin, sends an idempotent transactional email, and reports success or failure to the existing retry state machine.

## Why a separate service

Email provider latency must not determine whether a job message, appointment, scope change, or status transition commits. PostgreSQL records the domain event and its notification in one transaction. This worker performs network delivery after commit and preserves the database's retry and dead-letter behavior.

## Local run

Requires the .NET 10 SDK. Supply the values from `.env.example` as environment variables; do not commit service-role or provider keys.

```powershell
dotnet run --project services/AnkaraUsta.NotificationWorker
```

The service exposes `GET /health`. When required secrets are missing the HTTP health endpoint remains available while delivery polling stays disabled.

## External contracts

- Supabase Data REST RPC: `claim_email_notification_batch`
- Supabase Auth Admin: recipient lookup by user ID
- Supabase Data REST RPC: `mark_notification_result`
- Resend Email API: `POST /emails` with `Idempotency-Key: ankara_usta_notification_<outbox-id>`

Provider delivery is intentionally at-least-once at the worker boundary and effectively-once within Resend's idempotency window. PostgreSQL remains the authoritative delivery state.
