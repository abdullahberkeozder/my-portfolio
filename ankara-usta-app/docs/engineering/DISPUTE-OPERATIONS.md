# Phase 7 — Dispute Operations

## Product flow

`opened → triage → awaiting_evidence → counterparty_response → investigation → resolution_proposed → notified → appealed or closed`

Dismissal is an explicit, reasoned branch. A dismissed case may be appealed during its appeal window or formally closed.

## Security boundaries

- Evidence lives in the private `dispute-evidence` bucket. The path is `{dispute_id}/{submitter_id}/{object}` and Storage RLS verifies both job participation and the authenticated submitter folder.
- Evidence metadata, party statements, timeline events, appeals, decisions, sanctions, and internal notes use separate tables with RLS enabled.
- Participants receive decisions only through `get_dispute_decisions`. It returns the explanation intended for the current party; raw decision rows are not granted to authenticated clients.
- Internal notes are visible only to moderators and administrators.
- State changes, notes, sanctions, and appeals are narrow database operations that derive the actor from `auth.uid()`.
- Evidence, statements, events, decisions, notes, appeals, and sanctions are append-only. Update and delete attempts are rejected by triggers.

This follows Supabase's current guidance that exposed tables need both explicit grants and RLS, and that private Storage objects must be read through an authenticated request or a short-lived signed URL:

- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/storage/security/access-control
- https://supabase.com/docs/guides/storage/buckets/fundamentals

## SLA rules

| Stage | Target |
| --- | --- |
| Opened | Initial handling within 24 hours |
| Triage | Next decision within 4 hours |
| Awaiting evidence | Operator-selected future deadline |
| Counterparty response | Response handling within 24 hours |
| Investigation | Finding within 48 hours |
| Resolution proposed | Notification within 24 hours |
| Notified | 72-hour appeal window |
| Appealed | Re-evaluation within 48 hours |

The UI marks a case `due_soon` during the final four hours and `overdue` after the deadline. Closed and dismissed cases remain in the immutable history but leave the active SLA queue.

## Audit invariants

- Every operator transition contains actor, old status, new status, timestamp, and reason.
- Customer and tradesperson explanations are required for proposal, notification, dismissal, and closure decisions.
- A warning or suspension records the dispute, provider, actor, reason, and effective dates.
- A suspension also moves an approved provider profile to `suspended`, immediately removing quote eligibility.
- An appeal is attributable to one participant and reopens the case as `appealed`.

## Automated evidence

- Pure transition, SLA boundary, and input tests: `tests/unit/disputes.test.ts`
- Two-user RLS, evidence, separate decision projection, internal-note privacy, sanction, appeal, closure, and immutable audit test: `supabase/tests/remote/phase7_dispute_operations.sql`
