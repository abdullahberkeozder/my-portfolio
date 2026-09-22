# Orkestra — current verification evidence

Date: 22 September 2026. Implementation commit:
`75d807f9a8dbbb62818627f1e77ad42a71c2b50b` (includes API commit `1d06a90`).
Results were obtained on the working tree assembled into these commits.
Subsequent changes before committing were comment/whitespace corrections and a
browser test title clarification; no application behavior changed after checks.
The U4 assertion fix was rerun remotely and followed by targeted lint/type checks.
The following documentation-only commit records results against that implementation.

## Changes that improve evidence

- Indexing now requires `NODE_ENV=production`,
  `ORKESTRA_DEPLOYMENT_ENV=production` and `ORKESTRA_INDEXING_ENABLED=true`.
  Preview/staging production builds remain closed. Five negative cases added.
- Classification dialog test actually cycles Tab and Shift+Tab at boundaries
  and requires focus to return to the search input after Escape.
- 320 CSS-pixel reflow is named accurately; no real zoom claim.
- Wizard ARIA test name reflects the attributes it inspects, not screen-reader
  isolation it does not measure.
- U4 no longer expects removed map copy. It verifies the current saved-city text
  and reloads the account page to verify name/city persistence.
- Delivery, auth and accessibility documents separate requirements, mock results,
  historical evidence and current real-account results.

## Commands and results

Working directory: `ankara-usta-app`. Windows; project tools use Node 24.19.0.

| Command | Result |
| --- | --- |
| `npm run quality` | Exit 0: repository/style/debt checks, lint, type-check, coverage, production build and .NET checks passed. |
| `npm run test:e2e -- --workers=4` | Exit 0: 156 passed, 44 remote tests skipped, 200 total. Chromium desktop/mobile/tablet/wide. Server stopped and port 4187 released. |
| `E2E_ALLOW_STAGING_WRITES=true node scripts/run-account-recovery-browser.mjs` | Exit 0: 1 real recovery browser test passed, zero skipped. Password restored; normal local build restored. |
| `E2E_ALLOW_STAGING_WRITES=true node scripts/run-u4-browser.mjs` | First run: 1 passed, 1 failed on obsolete map text. After assertion fix: exit 0, both tests passed, zero skipped; normal local build restored. |
| Targeted ESLint on `tests/staging/account-center-browser.spec.ts` and `tests/e2e/accessibility.spec.ts`, followed by `tsc --noEmit` | Exit 0 after the U4 correction. |
| `git diff --cached --check` | Passed after comment whitespace cleanup. |

Coverage: 91 files / **577 tests**; statements 92.36%, branches 89.04%, functions
93.2%, lines 94.30%. Coverage configuration is selective: these percentages are
for instrumented files, not a claim about the entire application.
Repository check counted 1164 files before this evidence document was added.
Debt: 6837 CSS lines, 363 important declarations, 59 media queries, 41 inline styles.
.NET Release build: 0 errors, 0 warnings; notification contract tests passed.

The general browser run's 44 skips are explicit **missing remote evidence**,
not successful authorization tests. The separate recovery and U4 runs above do
not replace all 44 cases or the full R2/Golden Musluk/admin regression gate.

## Isolated database inventory

Only `orkestra-e2e` (`hyuijuafuayzultbjvjb`) was used for real-account tests.
Production was not mutated. Read-only migration query found **29 applied versions**,
latest `20260919194836`; repository has **30 migration files**.
`private.public_professional_verification(uuid)` exists, but
`public.list_public_verified_professionals(text,text,integer,integer)` is absent.
Migration `20260922161628_public_verified_professional_directory.sql` is authored,
**not remotely applied or validated in this run**. Its transactional fixture also
remains pending. Deployment of the public directory depends on this migration.

## Known limits and unresolved gates

- Vinext logged `ERR_STREAM_UNABLE_TO_PIPE` during recovery and U4. Passing user
  assertions do not make that server error harmless; request-level diagnosis remains open.
- Unit run printed jsdom `Not implemented: navigation to another Document`.
  Unit mocks cannot replace browser navigation evidence.
- NVDA, VoiceOver, TalkBack, physical mobile keyboard, actual 400% browser zoom,
  and 200% text resizing were not exercised. No full AA conformance claim.
- Real signup/email verification and mailbox delivery were not tested here.
  Recovery uses an admin-generated link, not an incoming email.
- Full current R2, Golden Musluk, admin dispute and live Realtime interruption
  regression were not rerun. Their historical evidence remains historical.
- No deployment, feature activation, push or CI run was performed.

## Notification worker preparation after remaining gates

The current `/health` reports HTTP 200 even when `configured` is false. First
slice should separate process liveness from configuration readiness (503 when
unconfigured), with tests. Configuration readiness alone must not claim provider
delivery or database reachability. Next, rehearse retry/dead-letter/lease recovery
using deterministic local fakes, then isolated staging; record correlation IDs
without message bodies, addresses or secrets. Assign an operator and alert path.
No paid service or worker deployment is required for the preparation slice.

Decision: local quality and selected real-account behavior are verified and
committed. **Phase 1–2 fully complete / release-ready is not established.**
