# Wizard prerequisite visibility fix

Date: 2026-09-03. Implemented and locally verified; not released.

## Cause

The service-match dialog closed before AccountDraftBoundary finished resolving identity and draft selection. Only ScopedRequestWizard owned a modal. Loading, failure and existing-draft selection rendered in normal document flow at the end of the landing page. A reproduced Tek Oda Boya draft panel started at 1433px in a 720px viewport, with zero dialogs present. Earlier visibility assertions did not require viewport intersection.

## Change

AccountDraftBoundary accepts an optional renderPending presentation wrapper, used only by RequestWizard. Identity loading, retryable failure and draft choice now use a named, viewport-bounded modal with close, Escape, focus trapping and scroll lock through the existing shared hook. Other boundary consumers retain their existing inline presentation. Routing-conflict errors also use the pending dialog. Ready question content keeps the existing wizard; dialogs are not nested. Ownership, TTL, transfer, authentication and submission rules are unchanged.

## Evidence

- 13 component tests passed across WizardPendingDialog and RequestWizard, including pending lookup, error/retry, no ownership bypass and single-dialog transition.
- 14 Chromium browser tests passed: existing home regressions plus each of Musluk Değişimi, Tek Oda Boya and Avize Montajı at 320/390/1280px. Each new scenario opens, answers, closes, reopens, verifies draft heading/action viewport intersection and horizontal bounds, resumes the answer, and verifies Escape dismissal.
- Type-check, lint, style entrypoints, production build and the unchanged CSS debt gate passed. The new pending-dialog CSS module is additional scoped presentation, not relocation of global CSS debt.
- No remote database mutation, migration, commit, push or deployment. Real-account authorization and physical-device testing remain separate gates.
