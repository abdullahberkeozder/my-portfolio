# ADR-0008: Deliver Transactional Email Through an ASP.NET Core Worker

- Status: Accepted
- Date: 1 September 2026
- Owners: Product and Engineering

## Context

PostgreSQL already records job events and notification work atomically. Sending email from a browser request or inside a database transaction would couple core job operations to provider latency and availability. The portfolio also needs a genuine external-system integration that can be built, tested, and explained without overstating deployed capabilities.

## Decision

- Keep PostgreSQL as the source of truth for notification state, retries, leases, and dead-letter outcomes.
- Add a separate ASP.NET Core 10 hosted service that claims only `email` outbox rows through a service-role-only RPC.
- Resolve recipient email addresses through the Supabase Auth Admin API on the server; never copy service-role credentials to Next.js client variables.
- Send transactional email through Resend's HTTP API.
- Derive a stable `Idempotency-Key` from the outbox row ID so retrying a delivery does not create a second provider message within the provider window.
- Report each provider result through the existing `mark_notification_result` RPC.
- Keep the worker disabled when required server-side configuration is absent.

## Consequences

- Domain transactions remain independent from email delivery.
- The service can scale horizontally because claims use `FOR UPDATE SKIP LOCKED` and worker leases.
- Supabase and Resend secrets become deployment-only responsibilities for the worker.
- Recipient lookup and message delivery cross two external HTTP boundaries and therefore require monitoring, bounded errors, retry visibility, and provider-domain configuration.
- The hosted demo does not claim email delivery until this worker is deployed and staging delivery is verified.

## Security

- `claim_email_notification_batch` is revoked from `PUBLIC`, `anon`, and `authenticated`, then granted only to `service_role`.
- The function fixes `search_path` and filters to the email channel.
- Logs contain outbox and provider identifiers, not API keys or message content.
- Environment templates contain placeholders only; CI scans tracked files for high-confidence credentials.

## Validation

- `dotnet build` treats warnings as errors.
- Contract tests verify successful outbox acknowledgement, template selection, bearer authentication, and stable Resend idempotency headers without sending a real email.
- A remote integration test must verify claim isolation, retry transitions, and one real provider sandbox delivery before production activation.
