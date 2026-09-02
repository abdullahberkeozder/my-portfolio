# M2 — Request delivery and professional responses

Date: 2026-09-02

## Delivery status

**Implemented in the local working tree; verification incomplete; not released.**

Base commit: `51d7e252ab8638beee4d7ffe064671edc48a9da3`. This is the pre-implementation base, not an M2 implementation commit. No commit or push was requested. Existing unrelated changes were preserved.

| Transition | Evidence | Limits |
| --- | --- | --- |
| Planned → Implemented | Opportunity tabs, scope inspection, decline response, customer status, explicit successor-draft consent, RPC and migration authored | Local source only |
| Locally verified | `npm run test`: 36 files / 183 tests passed; lint, type-check and build passed | Unit/component tests use mocks; SQL execution and real responsive/browser checks not performed |
| Multi-account verified | Not run; deferred by user | RLS, concurrency, Realtime delivery and real identities remain release gates |
| Released | Not released | Flag not enabled; remote database unchanged |

Do not promote this slice to fully locally verified until database and browser evidence exists.

## Product contract

- `/usta/talepler`: separate **Bana özel talepler** and **Uygun açık talepler**, each paginated. Direct delivery uses an invitation rather than requiring an existing match; a target can inspect and decline even if availability prevents quoting.
- `/usta/teklifler/[requestId]`: readable scope answers, district/neighborhood and normalized timing. The existing quote form and eligibility rules are reused. No second quoting flow or wizard.
- A direct invitation has a **48-hour response window from submission**. This is not an appointment, job-completion or service guarantee. The wizard discloses it before submission.
- Customer state: awaiting response, quote received, declined with reason, or response deadline expired. Expiry is derived, not a background publication operation.
- Professional decline requires a customer-visible reason of 10–1000 trimmed characters. A submitted quote closes the invitation response stage; later quote revisions remain in the existing versioned flow.
- After decline or expiry, the owner can explicitly approve preparing a **new open draft**. The same wizard is reached through Taleplerim; the customer reviews and separately submits it. There is no audience mutation on the original request.
- Only structured scope answers, service/delivery model, district/neighborhood and timing are copied. No attachments, decline reason or conversation history are copied. The confirmation names the copied fields.
- Repeating the same successful broaden action returns the linked successor instead of creating another. Deleting the successor draft clears its link but does not recreate it automatically.
- An unmatched direct request offers a customer-triggered suitability refresh. A professional can update availability; no replacement professional is selected automatically.

## Code map

- Domain: `app/domain/requestInvitation.ts` (state derivation and action validation).
- UI: `app/components/RequestInvitationPanel.tsx`, `app/usta/talepler/page.tsx`, `app/usta/teklifler/[requestId]/page.tsx`, `app/taleplerim/page.tsx`, `app/taleplerim/[id]/teklifler/page.tsx`.
- API: `POST /api/requests/[id]/invitation`; identity comes from the authenticated session, not request JSON. Errors use the existing public-error mapping.
- Migration: `supabase/migrations/20260902202626_direct_invitation_response.sql`, created with the Supabase CLI. **Not applied.** Depends on `20260902200310_directed_request_routing.sql`, also pending.
- Tests: `tests/unit/requestInvitation.test.ts`, `tests/unit/requestInvitationApi.test.ts`, `tests/component/RequestInvitationPanel.test.tsx`.

## Database design and boundaries (authored, not execution-verified)

Invitation and event tables use participant-only RLS and no authenticated client write grants. A private transactional RPC implements decline and consented successor creation. Events record actor/time and status changes; UPDATE/DELETE are rejected by a trigger. The migration adds invitations to the existing Realtime publication when present.

Quote submission, decline and broadening serialize on the original request then invitation locks. Quote triggers reject declined, broadened or unanswered expired invitations; M1 eligibility checks remain authoritative. UI clock checks only improve feedback; the database deadline decides validity. Open requests bypass invitation-specific guards and keep existing matching/quote RPCs.

The migration deliberately aborts if previously submitted direct records exist: they require an explicitly reviewed backfill rather than fabricated invitation history/deadlines. Inspect function definitions and migration history before applying. Do not overwrite a populated deployment blindly.

## Remaining checks and known limits

- All isolated database, real-session/browser, multi-account, media and race checks remain in [the deferred checklist](PRE-RELEASE-VALIDATION-BACKLOG.md). Passing mocked tests does not prove RLS or lock behavior.
- Realtime subscriptions and manual refresh are wired. Actual event publication, reconnect recovery, clock skew and 320/390 px/tablet/desktop layouts remain unverified.
- This slice delivers in-app opportunities and status changes, not email/SMS/push delivery or automatic escalation. No response-rate/service guarantee is made.
- Declined/broadened original requests retain their original request state/history; the invitation gives the additional response state. The successor has its own lifecycle.
- Feature flag remains `ORKESTRA_DIRECT_REQUESTS_ENABLED=false`. It is a rollout guard, not a substitute for database permissions. Only activate in a verified environment after the deferred gates pass.
- Rollback: disable feature entry points, preserve private records and event history, investigate and roll forward with a reviewed migration. Do not drop audience restrictions, rewrite direct records as open or delete production invitation history. Reverting UI alone does not remove the database contract.

Next planned slice: **M3 — private request-bound pre-job conversations**, separate from accepted-job messaging.
