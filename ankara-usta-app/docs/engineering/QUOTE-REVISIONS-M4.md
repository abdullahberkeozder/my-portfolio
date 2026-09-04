# M4 — Revision request → next quote version → change summary

Date: 2026-09-03
Status: **First slice implemented; local application checks passed. SQL execution and multi-account verification pending. Not released.**

## Scope and existing foundation

The existing `quotes` table already has `version` and `supersedes_quote_id`. `private.create_quote_version` expires the previous submitted quote, inserts its successor and checks matching/eligibility. Existing acceptance locks the request, accepts only the current submitted version and creates one job. This slice reuses that engine; it does not introduce a second offer store or change acceptance/job creation.

Implemented:

- A customer can select revision topics (labor price, materials, duration, scope, warranty) and explain the desired change against the current submitted quote.
- One immutable feedback record per base quote. Repeating the same feedback returns the existing record; different feedback on the same version conflicts instead of silently overwriting it.
- A shared participant-only `/teklifler/[id]` detail page shows terms, feedback, the preceding-version comparison and links to the latest 20 versions. Older viewed versions are read-only and point to the current version.
- The professional edits the existing `QuoteForm`, prefilled with previous terms. A live before/after summary covers labor, material, total, duration, warranty, included/excluded scope and notes, preserving kuruş precision.
- A guarded revision RPC checks the base quote, then calls the existing version engine. Lock order remains **pair advisory lock → request row**, matching legacy quote creation.
- Retrying the exact immediate-successor payload returns that quote rather than creating another version. A different payload from a stale base fails. Failed acknowledgements keep the form values frozen for an exact retry; refreshing lets the user inspect the authoritative current version.
- Customer comparison cards link to details/revision requests; professional request pages link to their current quote and feedback. Initial quote creation still uses `/api/quotes`.

Feedback is a request, not a promise or accepted contract. A successor version indicates a response was published, not that every requested change was fulfilled; the customer must inspect the terms.

## Migration and boundaries

Authored migration: `supabase/migrations/20260902213412_quote_revision_requests.sql`.

- `quote_revision_requests`: quote reference, server-derived customer/professional identities, selected topics, reason and timestamp.
- Participant-only SELECT RLS and explicit grants. No direct authenticated INSERT/UPDATE/DELETE. An immutable trigger prevents rewriting feedback.
- `request_quote_revision`: verifies authenticated request owner, locks the request and re-reads quote status/version before recording feedback.
- `revise_quote_version`: verifies quote author, acquires the existing quote engine's locks, rejects stale bases and reuses `private.create_quote_version`. Existing direct invitation/recipient guards continue to run.
- Public RPC wrappers use invoker security; private implementations have an empty search path and explicit actor checks.
- The API validates inputs, checks the expected UI account against `getUser()`, sanitizes errors and returns no-store responses. It does not accept a caller-defined sender, target professional, new version number or request ID for revisions.

Security decisions follow the [Supabase function security guidance](https://supabase.com/docs/guides/database/functions) and participant isolation practices. These are implementation choices, **not proof that the unapplied migration passes RLS or race tests**. Changelog was reviewed; no new packages, extensions or Realtime schema changes were introduced.

## Verification record

| Stage | Evidence |
| --- | --- |
| Planned | First slice explicitly limited by the user |
| Implemented | Migration, API, detail page, feedback form, existing-form prefill, change summary and entry links |
| Local application checks | `npm run test`: 44 files / 225 tests passed; type-check, lint and build passed; `git diff --check` passed |
| Targeted new tests | 15 domain/API/component tests: topics/reason validation, precise diffs, auth return, gate, account mismatch, sanitized failures, base-ID dispatch, feedback retry, prefill, unchanged-form prevention and same-payload quote retry |
| Database verification | Not run; no migration applied locally or remotely |
| Multi-account / browser / responsive verification | Not run; deferred |
| Released | No; `ORKESTRA_QUOTE_REVISIONS_ENABLED` remains disabled |

No implementation commit was created. Base HEAD is `51d7e252ab8638beee4d7ffe064671edc48a9da3`; work remains uncommitted alongside preceding slices. No push, remote data change or deployment was performed. The existing jsdom navigation diagnostic and vinext static route-classification notice remain non-failing output.

## Known limits at the end of the first slice

- Migration and real authorization/concurrency evidence are mandatory before activation. The feature flag controls the application surface, not direct Supabase RPC permissions.
- No rejection/cancellation workflow for feedback, attachment support, message-to-feedback conversion, revision notifications or realtime revision subscription yet. Refresh/revisit the detail page to obtain current feedback.
- Revision retry protection applies to the new base-ID path. The legacy initial/unsolicited creation RPC remains available with its existing semantics; this slice does not claim global quote-submission idempotency or global stale-base enforcement.
- Pending form data is memory-only. Reload can lose an unacknowledged local edit; authoritative versions/feedback remain in the database when deployed.
- No new automatic acceptance. The existing max-three comparison and job handoff remain in place, with final acceptance UX, race tests and confirmation/accessibility review reserved for the next M4 slice. Existing comparison selection refresh behavior is not redesigned here.
- The detail page depends on request SELECT access as well as quote access. Verify history navigation after lost matching/eligibility in the real participant suite; do not broaden request visibility as a shortcut.
- Layout uses existing white/lemonade tokens, 44 px controls, wrapped text and single-column mobile comparisons. These are coded styles, not real-device visual evidence.

## Rollout / rollback

1. Inspect actual migration history and current `create_quote_version`, quote mutation, invitation and acceptance function definitions in the approved isolated environment.
2. Apply and test this additive migration along with its prerequisites. Execute the M4 matrix in [deferred validation](PRE-RELEASE-VALIDATION-BACKLOG.md), including direct RPC calls.
3. Record the implementation commit and evidence before enabling the flag in that verified environment. Deployment remains a deliberate separate action.
4. UI rollback: disable the flag and redeploy, leaving versions and feedback intact. For a security rollback, also revoke authenticated execution on both new public/private function pairs. Do not delete feedback, alter accepted terms, drop privacy policies or merge histories. Prefer a reviewed forward migration for schema corrections.

## Second slice — comparison, explicit acceptance and handoff (2026-09-03)

The first-slice limits above are historical. This continuation addresses comparison selection and final acceptance UX only; it does not implement all remaining negotiation features.

- Comparison retains professional selection across quote-ID/version replacement, shows the latest version per professional, and still caps selection at three. Removed professionals no longer consume selection capacity.
- Confirmation displays the exact version, precise currency amounts, duration, warranty, included/excluded scope and note. A changed quote or closed request invalidates the open confirmation; no silent upgrade or automatic acceptance occurs.
- Native modal semantics provide a labelled dialog, background inertness and Escape handling. Initial focus is on cancel; closing restores the invoking control when still present. Scrollable terms and a separate action area use viewport bounds, white/lemonade tokens and 44 px minimum actions. Native focus trapping, screen readers and responsive behavior still need real-browser evidence.
- The acceptance API requires `expectedUserId` and compares it with server-verified `getUser()`. Older bodyless API callers must update; the direct SQL RPC signature is unchanged. Responses are private/no-store and do not expose raw SQL error messages.
- Before accepting, and after an RPC response, the API looks up a job by **both accepted quote ID and authenticated customer ID**. An already-created matching job is returned without creating another. A failed job read after successful RPC returns accepted status with a null job ID and a jobs-page fallback, not a false mutation failure.
- The existing `accept_quote` transaction remains responsible for request locking, latest-version rejection and one-job creation. No SQL, policy, grant, role or feature-flag changes were made. This HTTP response-recovery behavior is not a claim of globally idempotent SQL acceptance or quote creation.
- The UI prevents duplicate pending clicks, keeps the same quote for retry after an uncertain response, blocks already-accepted/closed actions and routes a successful result to its exact job. Errors are announced as errors rather than green success notices.
- Removed unverified blanket approval wording and the assumption that a zero material amount means customer-supplied materials.

### Verification record

Base HEAD: `ca1db13d326e5f9c6fd72dd19cc0647d64ea3a8b`. No implementation commit, push, migration application, activation or release was performed in this continuation. Four unrelated pre-existing modified files were preserved.

| Stage | Evidence |
| --- | --- |
| Implemented | Comparison, confirmation component/styles, parent wiring and existing acceptance API extended |
| Targeted local checks | 12 tests passed across `quoteAcceptApi.test.ts` and `QuoteComparison.test.tsx` (11 new cases plus the existing max-three case) |
| Type-check | Passed |
| Final source build | Passed, including style entry-point validation. Existing vinext unknown-route classification notice remains non-failing. |
| Full unit/component suite | 45 files: 43 passed, 2 failed; 232 tests passed, 4 failed. `AuthForm.test.tsx` and `QuoteRevision.test.tsx` expect old labels such as `Ad soyad` and `İşçilik (TL)`; current source already uses `Ad Soyad` and `İşçilik Ücreti (TL)`. These source-label changes are present in base HEAD, not introduced here. |
| Lint | One remaining pre-existing error: `app/usta-basvurusu/page.tsx:148`, synchronous setState in effect. New acceptance files introduce no remaining lint errors. |
| Whitespace | Scoped acceptance diff passes; whole working tree has existing trailing whitespace at `app/usta-basvurusu/page.tsx:145`. |
| Real database / concurrency / multi-account | Not run. Mocked recovery tests do not prove RLS, transaction races or current deployed SQL. |
| Browser / devices | Not run. jsdom modal methods are stubbed, not evidence of native focus trapping or physical-device layout. |
| Release | Blocked pending the deferred evidence and outstanding repository checks |

### Remaining implementation queue

1. Decide explicit feedback withdrawal/rejection states without rewriting immutable history; implement as a separate migration-backed slice.
2. Revision notifications and realtime/catch-up; keep authoritative reads and participant privacy.
3. Account-scoped pending-edit recovery with expiry; do not place sensitive form data in unscoped browser storage.
4. Global legacy quote idempotency/stale-base contract and history access after eligibility loss: review separately, never broaden request SELECT to make history work.
5. Attachments and message-to-feedback conversion remain outside the text-first scope.

Before activation, run the appended M4 acceptance checklist in the deferred validation backlog, including both direct RPC calls and HTTP callers. Roll back this UI/API slice together if required (the new request body is paired with the new caller); keep jobs and accepted terms intact. Disabling the revision flag alone does **not** disable the existing acceptance API or SQL permissions.
