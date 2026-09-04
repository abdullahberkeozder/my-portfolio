# Deferred pre-release validation

Decision date: 2026-09-02
Status: Deferred by the user until the final validation stage; not waived or passed.
Scope: Marketplace M0/M1 directed requests, M2 invitations and their interaction with existing open requests.

Continue product implementation without provisioning Docker, a test project or test accounts for this checklist now. Run this checklist after the planned development work and before enabling or releasing the affected flow. This decision concerns the integration/browser/release checks below, not a blanket removal of targeted unit tests, lint, type-check or build checks during development.

Existing evidence remains historical: 33 unit/component test files, 167 tests passed at the M0/M1 checkpoint. Rerun relevant checks against the actual release candidate; those results do not prove database authorization or real browser behavior.

## Required final-stage checklist

- [ ] **V1 — Isolated database and migration.** Obtain an explicitly approved isolated environment. Verify previous migrations and deployed function definitions, then apply `supabase/migrations/20260902200310_directed_request_routing.sql`. Record environment, migration history and execution results. Local Docker/Podman was unavailable at deferral; no alternative environment has been provisioned.
- [ ] **V2 — Database authorization and fixtures.** Complete and run positive/negative fixtures for owner vs another customer, target vs another professional, draft vs submitted, invalid/suspended/expired-verification targets, reused keys across targets/services, direct-to-open attempts, direct matches/quotes and media access. Run `supabase/tests/remote/directed_request_contract.sql` as well; it is only a limited rollback contract check, not the complete fixture suite.
- [ ] **V3 — Real browser journey and accessibility.** Verify login/signup return, explicit same-tab guest claim, account switching, remote restoration and single submission using real test sessions. Inspect 320 px, 390 px, tablet and desktop layouts, plus keyboard navigation. Preserve evidence of expected state and actual behavior; mocked sessions do not satisfy this item.
- [ ] **V4 — Open-flow regression and concurrency.** Confirm open request publication, matching and quoting still work. Exercise concurrent submissions and verify idempotency, request count and recipients. Ensure direct requests never broaden their audience automatically.
- [ ] **V5 — Security and release evidence.** Review database advisors, migration rollback/roll-forward procedure and unresolved findings. Record the actual implementation/release-candidate commit, test commands, results and remaining limitations. Do not drop audience constraints or convert direct records to open records as a rollback shortcut.
- [ ] **V6 — Controlled activation and release.** Only after V1–V5 pass, enable `ORKESTRA_DIRECT_REQUESTS_ENABLED=true` in the verified environment and perform the deliberate release and smoke check. Record environment, commit, date and outcome. Keep the flag disabled while these gates are pending.

## Evidence record to complete later

| Item | Status | Environment / commit | Evidence / result |
| --- | --- | --- | --- |
| V1 | Deferred; not run | Not selected | Migration authored only |
| V2 | Deferred; not run | Not selected | Limited contract script authored; comprehensive fixtures pending |
| V3 | Deferred; not run | Not selected | Real sessions and responsive/browser checks pending |
| V4 | Deferred; not run | Not selected | Real database concurrency and open-flow regression pending |
| V5 | Deferred; not run | No implementation commit yet | New migration advisor review and release evidence pending |
| V6 | Deferred; not released | No release candidate | Direct-request feature remains gated off |

Do not mark M0/M1 fully locally verified, multi-account verified or released merely because further features have been implemented. Track newly discovered release-blocking checks here as subsequent slices are developed.

Related: [Marketplace plan](MARKETPLACE-REQUEST-AND-CONVERSATION-PLAN.md) · [M0/M1 implementation evidence](DIRECTED-REQUESTS-M0-M1.md).

## M2 additions — also deferred, not passed

- [ ] Apply `20260902202626_direct_invitation_response.sql` after M0/M1 in the approved isolated database; inspect deployed helper definitions first. Confirm failure on pre-existing submitted direct records; prepare a separately reviewed backfill if necessary.
- [ ] Verify invitation/event participant RLS, denied direct table mutations, append-only event history, selected-professional scope access without a match, and quote eligibility after approval/verification/availability changes.
- [ ] Exercise decline vs quote, expiry vs quote, repeated decline, repeated/concurrent broaden, wrong owner/target and missing consent. Confirm one successor draft, unchanged original audience, no media/reason/message copying and no automatic submission. Test deletion of the successor draft without reopening the original invitation.
- [ ] Test real two-session delivery and Realtime changes, disconnected/reconnected clients, manual refresh, server deadline enforcement with client clock skew, and accepted/closed request states.
- [ ] Review the complete customer/professional journey at 320/390 px, tablet and desktop with keyboard: inspect scope, quote/decline, status, consent, resume new draft and submit. Confirm current open publication/matching/quoting behavior remains unchanged under concurrency.
- [ ] Review advisors and roll-forward/rollback on the real candidate; keep private histories and record the actual implementation commit. Enable the flag only after all M0–M2 gates pass.

Local-only M2 evidence: [M2 implementation log](REQUEST-INVITATIONS-M2.md). No staging infrastructure, accounts or remote writes were performed for this slice.

## Account entry points — deferred verification

- [ ] Apply `20260902205806_account_registration_intents.sql` in the approved isolated environment. Check existing Auth provisioning triggers first; verify signup rollback on trigger failure and no privileged role assignment from metadata.
- [ ] Test both customer and professional registration, existing-email login, email confirmation/callback URLs, password reset, cross-user intent RLS, and wizard return after registration in real sessions. Check mobile/keyboard layouts.
- [ ] Review advisors and record actual implementation commit before release. See [account entry points](ACCOUNT-ENTRYPOINTS.md) for local-only evidence and limitations.

## M3 — Private text conversations: deferred verification

- [ ] Verify M1/M2 dependencies and current function definitions, then apply `20260902211047_request_conversations.sql` only to an explicitly approved isolated environment. Execute positive/negative fixtures for owner vs another customer, selected/matched vs unrelated professional, draft vs submitted, suspended/expired verification, expired/declined invitation and closed request.
- [ ] Exercise RLS through direct table SELECT and direct RPC calls as well as application APIs. Confirm anonymous users, other bidders and nonparticipant admins cannot read message bodies or read markers. Confirm direct table writes and message edits/deletes fail. The application feature flag is not database authorization.
- [ ] Race first messages to prove a single pair room, simultaneous sends to prove unique sequence order, identical retries to prove one row, and reused keys with different bodies to prove rejection. Race send against quote acceptance and invitation decline/broadening; no post-closure new messages.
- [ ] Test two browser sessions: missed-page catch-up, offline/online recovery, pending retry, read markers, auth expiry and account switch (including switching between two participants on one device). Inspect 320/390 px, tablet, desktop, keyboard focus, reachable composer and long message wrapping.
- [ ] Accept a quote and confirm only its pair receives a job link. Losing conversations remain private and independently readable. Broadening creates no conversation/media copies; open request publication, matching, quoting and job messaging remain unchanged.
- [ ] Review advisors, abuse/rate controls, retention and polling contention. Record the implementation commit and evidence; only then enable `ORKESTRA_PREJOB_CHAT_ENABLED` in the verified environment and deliberately release. No staging accounts, SQL execution or activation occurred in this slice.

Evidence and limits: [M3 implementation log](PREJOB-CONVERSATIONS-M3.md). Pending unsent text is memory-only; reload recovery is not implemented. Attachments remain out of scope.

## M4 — Quote revision first slice: deferred verification

- [ ] Inspect current quote/version, invitation and acceptance definitions, then apply `20260902213412_quote_revision_requests.sql` in an explicitly approved isolated environment. No SQL application occurred in this slice.
- [ ] Verify customer owner vs another customer, author vs another professional, nonparticipant admin, anonymous, direct/open request, stale/accepted quote, closed request and suspended/expired-verification author. Test both API and direct RPC/table access. Feedback must remain immutable and private.
- [ ] Repeat identical feedback and reject a conflicting reason/topics on the same quote. Race feedback against next-version creation and acceptance. Verify no revision is recorded against a quote that became stale while waiting for the request lock.
- [ ] Race two revisions from the same base: identical payloads return one successor, different payloads produce one success and one conflict. Retry after lost acknowledgement, after acceptance and after another successor. Verify the advisory→request lock order alongside legacy creation and acceptance; inspect deadlocks and unchanged accepted terms.
- [ ] Test customer feedback → professional prefilled edit → new version → customer change summary in two sessions, including auth return/account switch, network failure, current-version refresh, lost matching/history access and direct invitation expiry. Verify original open matching/quoting and max-three comparison behavior.
- [ ] Test 320/390 px, tablet, desktop and keyboard, long scope lists and exact currency precision. Review advisors, rollback/revocation and retention; record actual commit and results before enabling `ORKESTRA_QUOTE_REVISIONS_ENABLED` or releasing.

Evidence and limits: [M4 implementation log](QUOTE-REVISIONS-M4.md). The second slice now implements acceptance/handoff UX; real concurrency and browser proof remain pending, not completed by passing mocked local tests.

## M4 — Acceptance continuation: deferred verification

- [ ] Verify actual `accept_quote` and quote mutation definitions, current participant jobs SELECT policies and unique job constraints before activation. No schema was applied in this continuation.
- [ ] Race same-quote HTTP retries, different-professional acceptances, acceptance vs revision, and direct RPC callers. Only one job may exist; a losing different quote must never receive the winning job as its own successful acceptance.
- [ ] Simulate lost response after commit and failed post-commit job SELECT. Exact-quote retries must recover only the authenticated customer's job. Test another customer, switched account, expired session, suspended/expired-verification professional and stale/closed quote.
- [ ] Confirm accepted terms remain immutable, unrelated conversations remain private, and the final job link uses the winning job ID. Do not enable flags based on application mocks.
- [ ] Inspect native modal focus trapping, initial cancel focus, Escape, restoration after version replacement/removal, loading/error announcements, 320/390 px/tablet/desktop, zoom, long scope and visible actions. Verify max-three selection survives realtime refresh.
- [ ] Reconcile existing stale AuthForm/QuoteRevision test label expectations and the pre-existing usta-basvurusu effect lint failure before claiming a green quality gate. Record exact implementation commit and build/test evidence.
