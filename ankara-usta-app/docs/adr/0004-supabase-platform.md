# ADR-0004: Use Supabase for Identity, PostgreSQL, and Private Media

- Status: Accepted; supersedes the provider spike in ADR-0002 and the D1/R2 choice in ADR-0003
- Date: 26 August 2026
- Owners: Product and Engineering

## Context

The customer-request vertical slice needs durable drafts, public customer identity, relational ownership rules, idempotent submission, and private photos or videos. Keeping identity, rows, and object authorization in one policy system reduces the risk of inconsistent access checks during the pilot.

## Decision

- Use Supabase Auth for public customer identity.
- Use Supabase PostgreSQL for marketplace records.
- Use a private Supabase Storage bucket for request media.
- Enforce ownership with Row Level Security and authenticated-user folder prefixes.
- Use the publishable key in browser and server request-scoped clients; never ship a secret or service-role key to the browser.
- Keep migration files under `supabase/migrations/` and explicitly grant Data API privileges.
- Validate taxonomy, wizard answers, location, and status changes in server routes in addition to database constraints.

## Consequences

- The first production slice no longer depends on local browser storage as its source of truth.
- Sites remains the web host while Supabase is reached over HTTPS.
- Cross-user authorization can be tested at the database policy boundary.
- Media lifecycle and orphan cleanup still require a later background process.

## Validation

- Anonymous users have no table access.
- Authenticated users can select and update only their own request rows.
- Storage objects are private and paths begin with the authenticated user ID.
- Duplicate submissions reuse one customer/idempotency-key pair.

