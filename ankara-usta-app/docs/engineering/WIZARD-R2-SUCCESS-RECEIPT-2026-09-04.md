# Wizard R2 success receipt

Date: 4 September 2026

## Decision

The wizard remains a focused modal task surface. A receipt is not displayed beside questions and is not simulated while a request is pending. It appears only after the draft, media and authoritative submit operation succeed.

## Implemented behavior

- The existing modal hook owns body scroll lock, Escape handling, focus trapping and trigger focus restoration.
- The modal owns the only internal vertical scroll surface and keeps the document itself fixed.
- The final step remains an editable scope summary.
- Successful submission clears the scoped local draft, then displays a concise receipt with service, district, neighborhood, timing and a short request reference.
- The receipt distinguishes open and directed visibility. A directed request explicitly states that it will not broaden automatically.
- The result heading receives focus and the customer chooses when to open the request workspace.
- Receipt motion uses only opacity and transform, lasts 560 ms and is removed under `prefers-reduced-motion`.

## Responsive contract

The existing browser matrix checks 320, 390, 820 and 1440 px for wizard containment, absence of document overflow and one focused task surface. The receipt narrows its printer and paper margins at 390 px without adding a second scrollbar.

## Verification

- `tests/component/DirectedRequestWizard.test.tsx`: success-only rendering, request link, local-draft cleanup and failed-auth exclusion.
- `tests/component/WizardSuccessReceipt.test.tsx`: result focus, authoritative fields, workspace URL and directed visibility copy.
- `tests/component/RequestWizard.test.tsx`: body scroll ownership and restoration, Escape and focus behavior, editable steps and validation.
- `tests/e2e/home.spec.ts`: 320, 390, 820 and 1440 px modal containment and document overflow checks.

## Delivery state

Implemented and locally verified. It requires no schema migration and does not replace the deferred real-account authorization and concurrency suite. It is not marked released until a deployment is deliberately recorded.
