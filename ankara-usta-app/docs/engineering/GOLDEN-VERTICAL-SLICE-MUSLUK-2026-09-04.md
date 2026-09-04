# Golden vertical slice — Musluk Değişimi

Date: 4 September 2026

## Product objective

Use one ordinary, high-frequency service to prove a coherent request journey before expanding polish across the marketplace. The customer must be able to describe the work, submit once, land in the exact request workspace, understand what happens next and see the same scope that the professional quotes against.

## Implemented path

1. `musluk-degisimi` uses its service-specific questions from the shared, runtime-validated 26-service contract.
2. The existing owned draft and atomic submission route remain unchanged.
3. A successful submission routes directly to `/taleplerim/{requestId}/teklifler?created=1`; it no longer drops the customer into a generic list.
4. The request workspace provides one four-stage journey: request, professional response, quote decision and job.
5. Customer and professional surfaces render the same answered scope, location and normalized timing labels through one component.
6. Once a provider is selected, the workspace exposes the existing job-room handoff rather than creating a second lifecycle.

## Local evidence

- `tests/unit/requestJourney.test.ts`: state-to-stage and next-action contract.
- `tests/component/RequestScopeSummary.test.tsx`: shared scope, unanswered-value omission, timing and job handoff.
- `tests/component/DirectedRequestWizard.test.tsx`: authoritative submission redirects to the exact request workspace.
- Existing `tests/unit/wizardDefinitions.test.ts` and `tests/unit/requestContract.test.ts`: all 26 definitions and SQL contract alignment.

## Status

| Transition | State | Evidence |
| --- | --- | --- |
| Planned | Complete | Golden vertical slice was selected in the product path. |
| Implemented | Complete | Request workspace continuity and shared scope are in source. |
| Locally verified | Complete | Targeted tests, type-check and repository quality gate. |
| Multi-account verified | Pending | Reserved for the approved isolated Supabase validation stage. |
| Released | Pending | No remote migration, flag activation, push or deployment is claimed here. |

## Known limits

- This slice does not replace the existing draft, matching, quote, acceptance, messaging or job RPCs.
- Real customer–professional–administrator authorization, Realtime and acceptance races remain in the deferred pre-release suite.
- The 26 service definitions are technically complete, but language quality and conditional branches still need anonymized request-data calibration.
- The R2 completion receipt is implemented locally and renders only after an authoritative successful submission; release evidence remains pending.
