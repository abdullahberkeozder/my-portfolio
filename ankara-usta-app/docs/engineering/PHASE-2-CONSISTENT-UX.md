# Phase 2 — Consistent UX/UI

Date: 2026-09-03. Status: implemented and locally verified at component/build level; real-browser visual and assistive-technology verification pending. Not released.

## Changes

- Hero: removed the legacy 145/135dvh zone and 100dvh sticky inner contract, mobile 96px padding and trailing important override. Existing ProductFrame compact spacing and existing brand motion remain the presentation owners; no scroll animation was invented.
- Consent/menu: reduced banner copy, added equally usable accept/reject controls, lowered its layer below the menu and hid it while custom/native modals are open. Banner height reserves bottom document space. Read failures no longer imply accepted consent; failed persistence still permits dismissing the banner for the current component lifetime. This does not grant analytics consent on storage failure.
- Modal behavior: existing shared hook now tracks stacked custom dialogs, skips hidden controls and safely restores scroll/focus. Job confirmation is named/described, starts on Cancel, loops Tab/Shift+Tab, supports Escape and disallows dismissal while a mutation is pending. Failure remains visible inside the confirmation; success closes it.
- Wizard: heading receives focus on initial opening and step/question changes. Current option membership and supported district/neighborhood membership determine completion instead of truthiness. No question contract, SQL or coverage area was expanded.
- Labels: work-log stage/caption/file, review and dispute fields have visible labels, requirements and file guidance. Rating buttons expose the selected value; the existing initial five-star choice is explicitly announced, not silently removed.
- Receipt: removed the idempotency-derived fake receipt number and unused calm prop. Draft is explicitly not submitted; selected scope no longer claims database persistence. Essential text is 14px or larger, line motion is shorter without cumulative delays, summary updates no longer re-announce the whole receipt. Long content can scroll instead of being clipped; mobile summary height is bounded to preserve question space. White/lemonade styling remains.

## Evidence

- `tests/component/Phase2Experience.test.tsx`: 6 tests covering consent persistence/unavailable storage/cross-tab state, confirmation focus/escape/restoration, labels/rating and truthful receipt content.
- `tests/component/RequestWizard.test.tsx`: updated initial-focus expectation, next-question focus assertion, added retired-answer rejection.
- Full local suite: **54 files, 316 tests passed**.
- Type-check, lint, production build and style-entrypoint validation passed.
- Existing local server at `http://localhost:3000/` returned HTTP 200 and was reused. The user's running server was not stopped.
- No screenshots, device geometry measurements, real browser interactions, VoiceOver/TalkBack, remote accounts or database tests were executed in this slice. Component tests are not visual evidence.

## Remaining gates and limitations

- Before/after visual review at 320/390px, tablet, desktop, landscape and 200–400% zoom remains mandatory before claiming responsive completion. Verify banner/menu layering, keyboard-open mobile receipt, long summaries, safe-area insets and preserved hero motion.
- Native quote dialog and custom dialog integration still needs real-browser nested-dialog review. The shared hook does not introduce a general-purpose inert-background framework.
- Receipt does not yet differentiate server-saved draft from device-only draft; it truthfully reports only the common pre-submission state.
- Field-level server error linking and first-invalid-field focus beyond native validation remain follow-up work. Labels do not change backend permissions or review rules.
- UI-debt remains red: CSS 8,295 / 7,252; important 592 / 569; media queries 67 / 59; inline styles 73 / 71. Budgets were not increased. No complete CI/release-readiness claim.
- No package, migration, feature flag, remote database, commit, push or deployment changes. Prior working-tree changes were preserved.

Next: visual/device validation, then the separate Phase 3 release-readiness and CSS consolidation work. Keep deferred multi-account/migration gates intact.

## Follow-up — F04 browser regression contracts (2026-09-03)

Status: locally verified, not released. This follow-up adds browser evidence to the component-only evidence recorded above; it does not replace the remaining real-device or authorization gates.

- Updated `home.spec.ts`, `p1-design.spec.ts` and `p2-system-quality.spec.ts` to follow the current category disclosure, matching dialog, explicit draft-resume choice, current brand and compact navigation contracts. Kept the professional application journey through the document step, without submitting an application.
- The first reruns exposed stale test interactions: a visually hidden radio was covered by its own option-card label, the Back button includes an arrow, and a service checkbox includes its category in its accessible name. Tests now click the visible option label and assert checked state; no forced clicks, sleeps, skipped scenarios or weaker acceptance assertions were introduced. The second-width draft prompt is awaited explicitly.
- Final run: **52 passed**, 13 scenarios across Desktop Chrome, Pixel 7 emulation, 820×1180 tablet emulation and 1920×1080 desktop. Narrow-layout scenarios additionally exercise 320 and 390px widths. Runtime: 36.1 seconds, two workers, separate local production server on port 4187.
- Verified scope: service classification/scope disclosure, wizard opening and question progression, guest draft refresh/resume with retained answers, Escape focus restoration, matching-dialog horizontal bounds, six categories/26 reachable service actions, mouse/keyboard anchor navigation, selected 44px search targets, progressive professional application, current navigation state, privacy/menu exclusion and dismissal persistence, bounded hero/header and reduced-motion logo behavior.
- Lint and type-check passed. This follow-up changes tests/documentation only and reuses the prior production build; it does not claim a new full build or full unit-suite run.
- F03 remains red, measured again without raising budgets: 8,295 CSS lines (budget 7,252), 592 important declarations (569), 67 media queries (59), 73 inline styles (71). These metrics are the existing audit script's scope, not a complete measurement of every CSS module.
- Browser emulation is not physical-device testing or a comprehensive visual audit. Authenticated draft ownership, real multi-account flows, backend concurrency, screen readers, zoom, nested job/quote dialogs and remote migrations remain unverified here. No production data, migrations, flags, commits, pushes or deployments were changed.

Follow-up completed: [F03 CSS consolidation](F03-CSS-CONSOLIDATION.md) records the retired-rule cleanup and a passing unchanged CSS gate. The earlier red metrics above remain historical evidence. Overall CI/release readiness and deferred multi-account gates are still separate.
