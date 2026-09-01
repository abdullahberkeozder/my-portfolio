# Phase 6 — Trust, Reviews, and Moderation

## Invariants

- A review belongs to exactly one completed platform job and is authored only by that job's customer.
- Work-log media becomes public only when customer publication consent and moderator approval are both present.
- A completion transition creates one customer acceptance and one workmanship certificate with the accepted quote scope frozen as JSON.
- A job has at most one active dispute. Participants may open it; resolution remains a moderated operation.
- Moderation decisions are append-only and always include actor, action, timestamp, target, and a meaningful reason.
- District trust metrics exclude cohorts smaller than five approved reviews to avoid misleading and identifying signals.

## Data ownership

| Record | Write authority | Read authority |
| --- | --- | --- |
| Work log | Job participants | Participants/admin; public only after both gates |
| Review | Completed job customer through RPC | Participants/admin; public after approval |
| Acceptance/certificate | Completion trigger | Job participants/admin |
| Dispute | Job participants | Job participants/admin |
| Moderation decision | Administrator through RPC | Administrators |
| District metric | Database aggregation trigger | Public, after minimum cohort threshold |

## Moderation flow

`pending → approved/rejected → hidden/restored`

Every action creates both a domain-specific `moderation_decisions` record and a general `admin_audit_log` record. Neither decision history nor issued certificates has a client mutation policy.

## Remaining integration evidence

- Run anonymous versus participant media visibility tests against the linked Supabase project.
- Verify duplicate and non-completed-job review rejection with two authenticated users.
- Verify moderation decision immutability and actor/reason audit values with an administrator session.
- Verify the district aggregation boundary at four and five approved reviews.
