# M3 — Request-bound private text conversations

Date: 2026-09-03
Status: **Implemented; local application checks passed. Database and multi-account verification pending. Not released.**

## Scope and product behavior

- One room per request/professional pair; customer identity comes from the request, never a client-supplied sender.
- Direct requests can start a conversation only with the selected professional while the invitation accepts a response. Open requests require an existing professional match. Professional approval, service/area coverage and an unexpired verified professional certificate are checked for new messages.
- Draft requests cannot start conversations. A first successful message creates the room; opening a screen does not create data.
- Existing participants retain read access after invitation expiry/rejection, loss of eligibility or request closure. These states stop new messages.
- Customer offer screens and professional request screens link to the private room. Both request lists link to `/gorusmeler`, a paginated participant inbox, so history remains reachable even after a match disappears.
- Sending, failed send, retry, unread count and explicit “mark read” states are implemented. The form retains the same UUID and text until the server acknowledges the message.
- Browser fetches have a 15-second timeout so a stalled request cannot hold the sending/catch-up lock indefinitely. A timed-out send retains its retry key.
- Polling every five seconds, manual refresh and the browser online event use a monotonic server cursor. Each fetch retrieves at most 100 messages, with up to ten batches per refresh. A longer catch-up continues on the next refresh. This is polling, **not WebSocket Realtime**.
- On acceptance, the request state closes pre-job writing. The winning pair receives its job link; other rooms remain separate and read-only. Messages are not copied into job rooms or broadened requests.
- Message text is rendered as text, never HTML. No attachments, rich text, payment operations or implicit contractual acceptance.

## Security and persistence implementation

Migration: `supabase/migrations/20260902211047_request_conversations.sql` (**authored, not applied**).

Prerequisites: directed routing M1 and invitation M2 migrations. Inspect deployed function definitions and migration ordering before applying it.

- `request_conversations`: unique `(request_id, professional_id)`, explicit customer/professional read positions and server sequence counter.
- `request_conversation_messages`: append-only messages; unique conversation sequence and unique `(conversation_id, sender_id, idempotency_key)`.
- Participant-only SELECT policies. Authenticated clients have no direct INSERT/UPDATE/DELETE grants. No administrator role bypass is added.
- `public.request_conversation` is an invoker wrapper around a private definer function with empty search path and explicit actor checks. Operations: `fetch`, `send`, `read`.
- Every operation locks the request before the conversation, matching the existing quote acceptance/invitation lock order. This is intended to serialize acceptance against sends; **real concurrent execution is not yet verified**.
- Retrying a previously acknowledged key returns its acknowledgement, even after closure. Reusing that key with different text is rejected. Keys are scoped to the conversation and sender.
- Job lookup requires both the request customer and that room's professional, not merely the request ID.
- API uses verified `getUser()`, validates inputs, sanitizes errors, returns `private, no-store`, and checks the expected UI account before any RPC. Auth changes close the client view, preventing pending text from being sent under a different account.
- Chat content is not written to browser persistent storage or analytics by this implementation.

## Local evidence

| Check | Result |
| --- | --- |
| `npm run test` | 41 test files, 210 tests passed |
| `npm run type-check` | Passed |
| `npm run lint` | Passed |
| `npm run build` | Passed, including style entrypoint verification and new routes |
| Follow-up after adding fetch timeouts | 7 conversation component tests and type-check passed; actual stalled-network timing remains a browser validation item |
| Domain/API/component tests added | 18 tests covering validation, cursor merging, feature gate, identity mismatch, sanitized errors, same-key retries, pending send, paged catch-up/reconnect, read cursor, history preservation and job link visibility |
| PostgreSQL migration / RLS / race fixtures | Not run; deferred |
| Real browser sessions, mobile/keyboard visual verification | Not run in this slice; deferred |

Mocks establish client/API behavior, not database authorization, atomicity or production readiness. The passing suite also emits an existing jsdom “navigation to another Document” diagnostic. Build reports some routes as statically unclassifiable; compilation succeeds.

Implementation commit: none; this is uncommitted work on top of `51d7e252ab8638beee4d7ffe064671edc48a9da3`. No commit, push, remote environment change or deployment was performed.

## Known limits and release gates

- `ORKESTRA_PREJOB_CHAT_ENABLED=false` is documented in `.env.example`; no real environment flag was enabled. Missing/unverified schema must never be exposed by enabling the UI alone.
- Pending retry state is in memory only. A reload/closed tab loses an unacknowledged local draft; the UI warns the user to retry before leaving. Server-acknowledged history remains queryable. Cross-reload outbox recovery is a later reliability slice.
- No push/email notifications, typing indicators, online presence, automatic viewport read receipts, attachments, message editing, blocking/reporting UI or rate-limiting infrastructure in this slice. Review abuse controls before public rollout.
- Polling holds a short request lock in the RPC; measure contention and polling load before scaling. Incremental fetch is bounded, but the client keeps fetched history in memory; very long threads need windowing.
- Inbox order is conversation creation order, not a live notification feed. Unread counts are available inside the conversation.
- No actual browser/device or SQL execution evidence is claimed. Complete the M3 section in [deferred validation](PRE-RELEASE-VALIDATION-BACKLOG.md).

## Rollout and rollback

1. Use an explicitly approved isolated environment, verify M1/M2 prerequisites and function definitions, apply the migration, then run the full participant/race test matrix.
2. Verify open-request publication, matching, quoting and job-room behavior have not regressed. Inspect advisors and real responsive/keyboard behavior.
3. Record the implementation commit and results, then enable the flag only in the verified environment. Release requires a separate deliberate action.
4. First UI/API rollback action is disabling `ORKESTRA_PREJOB_CHAT_ENABLED` and redeploying. This does not disable direct Supabase RPC access: for a security rollback, also revoke authenticated execution on both conversation functions in a reviewed migration. Keep stored private rooms/messages and RLS intact. Do not drop tables, remove privacy policies or merge histories. Schema corrections should use a reviewed forward migration; any destructive rollback requires an explicit data-retention decision.
