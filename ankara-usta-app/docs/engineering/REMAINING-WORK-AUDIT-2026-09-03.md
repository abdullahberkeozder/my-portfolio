# Orkestra — remaining work and correction audit

Date: 2026-09-03. Scope: current local working tree, including uncommitted interface/M4 work.
Base HEAD: `ca1db13d326e5f9c6fd72dd19cc0647d64ea3a8b` (not the complete audited source; working tree differs).
Application/database/configuration changes in this audit: **none**. Only this report was added; diagnostic test artifacts were generated locally. No migration, remote account test, activation or deployment occurred.

## Executive assessment

The shared shell is a useful foundation, but it does not complete the redesign. The highest-value remaining work is failure-safe task completion, consistent account/session behavior, and verification of the actual UI rather than further decorative changes. The unit/component suite is green; the full release gate is not. New code and older workspaces still follow different interaction and error-handling contracts.

Evidence classes: **executed** (reproduced by a command/test), **visual** (observed in the targeted test screenshot), **source** (direct code evidence, not a real participant reproduction), **risk** (requires the stated experiment), **deferred** (documented missing verification).

## Checks performed now

| Check | Actual result | Interpretation |
| --- | --- | --- |
| `npm run test:coverage` | 48 files / 244 tests passed; statements 90.73%, branches 85.11%, functions 91.11%, lines 93.76% | Configured thresholds pass |
| Coverage scope | `app/data`, `app/domain`, `app/lib` | Percentages do NOT measure all React components, API routes or SQL |
| `npm run ui-debt:check` | Failed | Mandatory CI step remains red |
| Targeted mobile navigation E2E | 1 failed: waits for `Menüyü aç`; current button is `Menü` | Confirmed test/UI contract drift, not proof that the visible menu button is broken |
| Analytics storage-denial probe | `trackFunnel('service_search')` throws `Storage denied` | Reproduced in-memory from the actual TypeScript source; no app files modified |
| Previous turn lint/type-check/build | Passed previously | Not rerun in this read-only audit; not presented as fresh results |
| Real database authorization/concurrency | Not run | Still deferred; code/mocks cannot substitute for these checks |

The targeted E2E used the local production server on port 4187 and Pixel 7 emulation. Its failure screenshot was inspected. This is **not** a complete 320/390/tablet/desktop audit, real-phone validation, or a test of authenticated screens. There is no evidence here that every function has been clicked or every migration deployed.

## Prioritized findings

### P0 — release and task-completion blockers

**F01 — Analytics can interrupt the core product action.**
- Evidence: `app/lib/analytics.ts:82` reads localStorage without a guard; `app/page.tsx:66` calls it before setting classification/dialog state. The isolated storage-denial probe throws. The same helper runs after request submission, before navigation (`RequestWizard.tsx:333`).
- Surface: service search, wizard entry/completion; any browser restricting storage, or a failing optional analytics transport.
- Impact: an optional measurement dependency can prevent discovery, or make a successful request look unsuccessful.
- Class: executed helper failure + source-proven call order. Effort: small. Business value: high.
- Direction: make the entire telemetry operation best-effort and exception-safe; never synthesize consent. Isolate draft cleanup and telemetry from authoritative submission success.
- Acceptance: storage/getter/beacon failures never prevent search, wizard opening or successful job-request navigation; no event before consent.

**F02 — Work log/review/dispute failures can leave the interface permanently busy.**
- Evidence: `app/components/JobTrustCenter.tsx:18` (`jsonPost`) and `:19` (`upload`) set busy before fetch and clear it only after successful await/JSON parsing. No catch/finally. The upload also calls `event.currentTarget.reset()` after awaits rather than capturing the form synchronously.
- Surface: job detail, all devices; offline, server disconnect, malformed response and successful upload cleanup.
- Impact: controls can remain disabled; failures are not explained; post-upload reset may fail after the event handler has yielded. Users cannot reliably finish the trust workflow.
- Class: source-level defects; no real upload/review/dispute was created. Effort: medium.
- Direction: shared guarded mutation helper, bounded timeout, retained input, try/finally, captured form reference and explicit uncertain-outcome handling. Do not blindly retry non-idempotent mutations.
- Acceptance: failed response restores controls and preserves fields; successful upload clears only the acknowledged submission and refreshes the list.

**F03 — Full repository quality gate is red.**
- Evidence: UI debt command: CSS lines **8,287 / 7,252**, `!important` **595 / 569**, media queries **68 / 59**, inline styles **74 / 71**. `../.github/workflows/ankara-usta-ci.yml:51` runs this check.
- Surface: release pipeline, all interfaces indirectly.
- Impact: build/test success alone cannot support a clean release claim. Modules added outside application.css are not included in the CSS-line metric, so measured debt is not the entire stylesheet estate.
- Class: executed. Effort: medium–large.
- Direction: consolidate obsolete layers by component and remove dead selectors; do not simply increase budgets. Re-measure after each coherent consolidation.
- Acceptance: check passes without hiding debt and responsive regression tests remain valid.

**F04 — Browser regression contracts no longer describe the UI.**
- Evidence: executed `home.spec.ts:85` timeout for `Menüyü aç`; current header exposes `Menü`. `p1-design.spec.ts` still expects `.editorial-service-row`; current home uses category details and service buttons. `p2-system-quality.spec.ts` expects old navigation selectors and the removed “26 hizmetin tamamını göster” interaction.
- Impact: CI failures obscure actual regressions. Updating assertions mechanically would also miss changed interaction intent.
- Class: one executed failure; other mismatches identified in source. Effort: medium.
- Direction: rewrite tests around current user tasks, canonical accessible names and service selection, including negative cases. Keep the tests, not stale UI wording.
- Acceptance: current home/menu/category/wizard journeys pass across the configured matrix; intentional UI decisions documented.

### P1 — high user impact and reliability gaps

**F05 — Job message acknowledgement can erase a newer edit.**
- Evidence: `JobWorkspace.tsx:153–164` sends a body snapshot but unconditionally calls `setMessage('')` on success; textarea at `:367` remains editable while the request is pending.
- Reproduction to add: delay message A response, replace composer with B, resolve A; B must remain.
- Impact: lost unsent text during slow connections. Class: source-proven race path; real-session reproduction pending. Effort: small.
- Direction: clear only if current value equals the acknowledged body, or deliberately lock the submitted composer with an accessible pending state. Keep retry key tied to its immutable body.

**F06 — Reconnected job rooms can say “live” while missing events.**
- Evidence: `RealtimeRefresh.tsx:49` sets live on SUBSCRIBED without refreshing; refresh is scheduled only for subsequently received changes (`:42`). No online/focus catch-up exists there. Job details consume server-provided message/event snapshots.
- Contrast: `RequestConversation.tsx` already polls and refreshes on online; the two messaging surfaces have different guarantees.
- Impact: a message, scope proposal or status changed offline may stay absent until another event or manual reload.
- Class: source gap; reconnect race requires real sessions. Effort: medium.
- Direction: catch up on resubscription/online/focus with bounded deduplication, explicit last-synced state and manual refresh.

**F07 — Job confirmation dialog is not keyboard-complete.**
- Evidence: `JobWorkspace.tsx:668` renders an aria-modal div, but no accessible name binding, initial focus, focus containment/restoration, Escape handling or modal hook. The native quote acceptance dialog is stronger and should establish the reusable standard.
- Impact: critical cancel/complete actions are difficult to operate predictably with keyboard/assistive technology.
- Class: source-level accessibility gap, all layouts. Effort: small–medium.
- Acceptance: labelled dialog; initial safe-action focus; Tab/Shift+Tab containment; Escape cancel; restored trigger focus; pending action cannot execute twice.

**F08 — Query failures still masquerade as empty data.**
- Evidence: `app/islerim/[id]/page.tsx:14` ignores the initial jobs query error and returns notFound when data is absent. Only events/messages are treated as critical errors; appointment, scope, address, work log, review, certificate and dispute results fall through to empty/null values.
- Impact: a database failure can look like no appointment/no review/no address, prompting conflicting user action.
- Class: source. Effort: medium.
- Direction: distinguish denied/missing/error and provide section-specific recovery; do not widen RLS to fix a read failure.

**F09 — Privacy banner still dominates mobile discovery; menu layering is inconsistent.**
- Evidence: the inspected Pixel 7 failure screenshot shows the bottom banner covering search suggestions and roughly the bottom quarter of the viewport. CSS gives it z-index 999 (`application.css:5785`); new mobile menu backdrop uses 120 (`appHeader.module.css`). The hide rule only recognizes `.dialog-backdrop`, not the CSS-module menu backdrop.
- Impact: first-use discovery is obscured; consent can sit above the modal menu even though focus is trapped in that menu.
- Class: visual coverage on home; source-based menu stacking risk, menu-open reproduction still pending. Effort: medium.
- Direction: one overlay/layer contract, shorter consent copy with details link, accessible decline choice and protected content space; verify before/after consent and during modal opening.

**F10 — Compact hero overrides do not fully replace the old hero layout.**
- Evidence: new module reduces outer hero padding/height but does not reset inner sticky positioning or `min-height:100dvh` (`application.css:7015`). At <=768px a trailing important rule forces inner padding to `96px 20px 48px` (`:8285`). The screenshot retains a large gap between header and emblem.
- Impact: the primary task is unnecessarily low; different widths use different competing layout contracts.
- Class: source conflict + one mobile visual observation, not measured for every viewport. Effort: medium.
- Direction: choose a single hero owner and explicit desktop/tablet/mobile rules. Preserve intentional logo motion, but bound it to a task-oriented layout.

**F11 — Job and pre-job messaging have different account-change protections.**
- Evidence: RequestConversation sends expectedUserId and closes on auth change. JobWorkspace has currentUserId but does not bind mutations to that identity or reset its local composer on identity change. `api/jobs/[id]/messages/route.ts:7` verifies the currently authenticated user but not the UI's expected user.
- Impact: stale UI/composer may survive a same-device account change. This is not proof of an RLS bypass: the RPC still runs under the actual authenticated session.
- Class: security-sensitive risk requiring two real accounts. Effort: medium.
- Direction: share expected-identity and state-reset behavior across authenticated workspaces; test another account that is itself an authorized participant as well as an unrelated account.

**F12 — Trust-center forms still lack visible labels and complete selection semantics.**
- Evidence: `JobTrustCenter.tsx:25–28`: work-log kind/file/caption and dispute category rely on surrounding context or placeholders; review stars use a visual active class without aria-pressed/radio selection semantics. Default rating is five.
- Impact: harder comprehension and screen-reader use; a preselected maximum rating may bias input.
- Class: source usability/accessibility gap. Effort: small–medium.
- Direction: visible labels/hints/errors, explicit rating choice or clearly announced default, labelled group and selected state, nearest-field focus on error.

**F13 — Wizard step changes reset scrolling, not focus.**
- Evidence: `RequestWizard.tsx:149` changes scrollTop on question/step changes; StepScreen h2 is not focusable and no step-focus effect is present. Completion checks use truthiness (`:139–142`) rather than current option membership.
- Impact: focus can be lost when a question subtree unmounts; restored old answers/location can appear complete while no current option is selected.
- Class: source gap; keyboard and stale-draft scenarios need reproduction. Effort: medium.
- Direction: focus/announce each new step, validate restored values against the current service/location contract, and preserve legitimate existing progress.

**F14 — Geographic completion is limited to a hardcoded subset.**
- Evidence: `app/data/ankaraLocations.ts` has nine districts and short neighborhood lists; wizard requires selection from those lists with no unsupported-area path.
- Impact: someone outside listed neighborhoods cannot accurately complete a request. Whether this is intentional pilot coverage is a product decision, not a verified claim that all Ankara must be supported.
- Class: verified model limitation / product decision. Effort: small for honest scope messaging; larger for validated geographic expansion.
- Direction: explicitly present supported coverage before form investment; choose curated expansion or a verified “not listed” process. Do not accept arbitrary values contrary to SQL validation.

### P2 — consistency, maintainability and scale

**F15 — Workspace navigation changes by URL, not active persona.** `navigationModel.ts:11–12` treats shared `/islerim` and `/hesap` as customer context, even for professionals. A professional following İşlerim loses top-level opportunity/availability navigation; mobile adds a route back. This is presentation inconsistency, not privilege escalation. Establish active workspace context from verified identity/preferences without changing server permissions.

**F16 — Receipt presentation still contains technical/noisy details.** `WorkReceipt.tsx` shows a local idempotency-key suffix as “Fiş no”, labels answered scope “KAYITLI” without persistence acknowledgement, and accepts an unused `calm` prop. `application.css:6840–6863` retains many 10–12px receipt details and hardcoded green shades. Distinguish local draft, server-saved draft and submitted request; make essential scope readable, subordinate technical reference, and remove the unused variation contract after review.

**F17 — Growing job histories have no bounded read strategy.** `islerim/[id]/page.tsx` retrieves all message/event/work-log rows with no range/cursor and signs all work-log media URLs on each render. Top-level request/job/directory lists already use range pagination; do not misreport all lists as unpaginated. Introduce cursor pages and stable sequence ordering for detail history, then test missed-page recovery.

**F18 — Test false positives and limited coverage interpretation.** `p1-design.spec.ts` loops through `.pill-row button, .icon-tabs button, .hamburger` without asserting count > 0. Zero matches pass. `vitest.config.ts` excludes components/API/SQL from aggregate coverage. Require expected controls to exist; separate domain, component interaction, API, SQL and browser evidence. New `presentationLabels.ts` currently has 0% coverage.

**F19 — Optional analytics privacy enforcement is a denylist.** `analytics.ts:51` strips known keys, but arbitrary property names remain possible and full route pathname is sent. There is no demonstrated leak in the reviewed call sites. Prefer per-event schemas and route templates; test unexpected aliases and resource IDs. ConsentBanner also returns “accepted” on read failure and silently ignores write failure: use a neutral unavailable state and an in-memory choice, not implied permission.

**F20 — Repeated mutation conventions need consolidation.** JobWorkspace, JobTrustCenter, ModerationQueue and quote/pre-job components have different timeout, error, account, retry and status behaviors. The job messages endpoint maps exceptions to 400 with no common correlation/error-code contract; Error messages can pass through unsanitized while plain Supabase error objects take the generic fallback. Do not claim every database error is currently exposed. Standardize public error handling and mutation acknowledgement without erasing domain-specific idempotency rules.

## Existing strengths — do not rebuild these unnecessarily

- Shared header, exact `/usta` versus `/ustalar` path matching and labelled menu.
- Native category disclosure and explicit service selection instead of silently taking the first service.
- Account-scoped draft storage, same-tab guest handoff and seven-day expiry already exist; do not describe draft ownership or TTL as absent.
- Conditional-question definitions, pruning and timing normalization already exist.
- Quote comparison keeps the latest version per professional, at most three selections and explicit acceptance confirmation; local tests cover stale/retry behavior.
- Pre-job conversation has identity checks, stable pending payload and catch-up behavior that can guide the older job-room implementation.
- Top-level pagination, reduced-motion rules and English architecture/release documentation are present.

## Deferred functionality and activation evidence

M0/M1 directed requests, M2 invitations, account registration intents, M3 conversations and M4 quote revisions have authored migrations and local implementation evidence. `PRE-RELEASE-VALIDATION-BACKLOG.md` explicitly records missing isolated-environment migration/fixture, real authorization, concurrency, browser and advisor evidence. Runtime deployment state was not inspected here. Do not enable a feature or mark it released based on the green local suite. Application flags do not revoke RPC permissions; direct RPC/table access must be included in the final suite.

M3 attachments and pending-text reload recovery remain out of scope/unimplemented. M4 feedback rejection/cancellation, revision notifications/realtime, and account-scoped pending-edit restoration remain documented next slices. These are feature opportunities, not reasons to bypass the existing authorization/release gates.

The old backlog entry about stale AuthForm/QuoteRevision assertions and application lint failure is historical: later local evidence supersedes it. Reconcile evidence dates instead of continuing to report already-fixed problems.

## Proposed next implementation phases

Implementation follow-up (2026-09-03): the bounded Phase 1 job-room reliability slice is implemented and locally verified. See [Phase 1 evidence and remaining limits](PHASE-1-RELIABLE-TASK-COMPLETION.md). Original findings below remain the audit baseline; this update does not mark remote authorization, UI debt or release gates complete.

These phases are newly defined by this audit, not the historical product roadmap's Phase 1–3.

### Phase 1 — Reliable task completion

F01, F02, F05, F06, F08, F11, F20. Make optional telemetry harmless; repair work-log/review/dispute failure paths; protect newly typed messages; restore missing events; separate error/empty states; bind workspaces to the active account. Exit: network, malformed response, delayed acknowledgement and identity-change component/API tests pass. Real RLS/concurrency evidence remains mandatory before activation.

### Phase 2 — Focused and accessible interfaces

Implementation follow-up: see [Phase 2 changes, local tests and remaining visual gates](PHASE-2-CONSISTENT-UX.md). Component/build verification does not close responsive or assistive-technology evidence requirements.

F07, F09, F10, F12–F16. Resolve overlay layers and hero ownership; standardize modal focus; label trust forms; stabilize wizard focus/restoration; clarify coverage and receipt persistence state. Exit: 320/390/820/1440/1920 layouts, landscape, keyboard, 200–400% zoom, long content and consent-on/off scenarios have evidence. Preserve current brand colors/logo; evaluate actual contrast without wholesale recoloring.

### Phase 3 — Verifiable release readiness

F03, F04, F17–F19 and deferred release checklist. Consolidate CSS, rebuild meaningful E2E contracts, eliminate zero-target passes, bound histories and validate event schemas. Exit: all required quality commands pass against an identified commit; approved isolated real-account fixtures and advisors recorded before feature activation. No forced merge, threshold weakening or unreviewed remote mutation.

Quick wins: telemetry exception isolation; capture form before await; add try/finally; preserve newer composer text; label/bind confirmation dialog; assert nonzero E2E targets; correct stale menu assertions; reconcile historical test notes. Quick wins still need targeted tests.

## Evidence paths

- Previous implementation report: `docs/engineering/UX-INTERFACE-REDESIGN.md`.
- Deferred release contract: `docs/engineering/PRE-RELEASE-VALIDATION-BACKLOG.md`.
- M4 evidence/limits: `docs/engineering/QUOTE-REVISIONS-M4.md`.
- Generated coverage: `coverage/coverage-summary.json` (local artifact, not product coverage of all layers).
- Mobile screenshot: `test-results/home-mobile-navigation-ope-a0215--and-exposes-product-routes-mobile-chromium/test-failed-1.png` (ephemeral diagnostic artifact).
- Supabase changelog was checked via [official changelog](https://supabase.com/changelog) after the markdown endpoint rejected the fetch. No dependency/schema update was implemented or inferred from it.

## Limits

No remote database inspection, privilege test, production audit, full device matrix, VoiceOver/TalkBack session, load test or every-page visual audit was performed. Source findings identify concrete correction paths but do not establish a live exploit. The one screenshot is useful first-use evidence, not a performance measurement. The audit does not promise a delivery estimate without reviewing each slice's dependency scope.
