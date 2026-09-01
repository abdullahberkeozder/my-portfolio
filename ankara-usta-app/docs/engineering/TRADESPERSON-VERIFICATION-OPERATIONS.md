# Tradesperson Verification Operations

Version: 1.0  
Date: 26 August 2026

## First administrator bootstrap

Create the first administrator only after the person has registered through Supabase Auth and their exact user UUID has been confirmed. Run this once in the Supabase SQL editor, replacing the placeholder with that UUID:

```sql
insert into public.user_roles (user_id, role)
values ('00000000-0000-0000-0000-000000000000', 'admin')
on conflict (user_id, role) do nothing;
```

`Administrator` is the product-language name; its canonical database value is `admin`.

Do not place this UUID, a database password, or a service-role key in source control or client environment variables.

## Review procedure

1. Open the administrator review queue and start review.
2. Compare declared services and districts with submitted evidence.
3. Review each document independently and record a concise, factual reason.
4. Approve the application only when identity and professional evidence are coherent.
5. Use `needs_changes` when the applicant can correct missing or unreadable evidence; use `rejected` for an ineligible application.
6. Use `suspended` for a currently approved provider who must immediately stop quoting.

Approval alone does not grant the public badge or quote eligibility. Both require a verified, unexpired `professional_certificate` record.

## Expiry and reassessment

- The `tradesperson-document-expiry` Supabase Cron job runs daily at 00:15 UTC (03:15 Europe/Istanbul).
- The job marks expired documents, moves approved profiles without another current professional certificate to `reassessment_required`, and writes system audit events.
- Reassessment removes effective quote eligibility immediately because the quote policy evaluates current evidence at insert time.
- Historical documents and audit events are retained; replacement evidence creates a new reviewable record.

## Audit expectations

- Application, document, and reference administrator mutations generate immutable rows in `admin_audit_log`.
- Human audit entries contain actor, action, subject, timestamp, prior/new values, and the required operation reason. Scheduled expiry entries use the explicit `system` actor type.
- Operators must not edit or delete audit rows through the application.
- Before production launch, export retention, incident review, and personal-data deletion procedures must be agreed with legal and operations owners.
