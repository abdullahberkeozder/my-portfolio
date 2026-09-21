# P1 — Musluk Değişimi golden-path inventory

Date: 21 September 2026

Status: **Customer–professional happy path and independent customer–professional–administrator dispute path passed in `orkestra-e2e`. Not released.**

## Product contract

The golden service uses the existing shared marketplace lifecycle. It does not introduce a second wizard, quote store, conversation model or job state machine.

`Discovery → wizard → auth → request → matching/invitation → conversation → quote/revision → acceptance → job → completion → review or dispute`

## Current evidence map

| Transition | Screen / source | API or RPC | Data proof | Status |
| --- | --- | --- | --- | --- |
| Discovery → wizard | Home search and `RequestWizard` | Shared taxonomy/definition | `musluk-degisimi` has three validated answers | Local browser coverage |
| Wizard → auth → exact request | Wizard auth-return and draft owner contract | `upsert_request_draft`, `submit_request` | One owned request; answers and location preserved | P1 browser evidence passed |
| Request → eligible professional | Customer workspace / professional opportunities | `match_request` | `request_matches` contains the Sincan/Törekent test professional | P1 RPC evidence added |
| Scope parity | Customer and professional request workspaces | Participant SELECT policies | Both roles read the same service, answers, location and timing | P1 RPC evidence added |
| Quote → acceptance | Professional quote form / customer comparison | `create_quote_version`, `accept_quote` | Accepted quote ID is fixed on exactly one job | RPC and P1 browser evidence passed |
| Job communication | Job workspace | `send_job_message` | Both sessions receive each exact message once | RPC and two-session browser evidence passed |
| Completion | Job workspace status actions | `transition_job` | `scheduled → in_progress → awaiting_customer_approval → completed` | RPC and two-session browser evidence passed |
| Trust result | Trust center | `create_job_review`; certificate trigger | Review event and certificate reference the accepted quote | RPC and browser review evidence passed |
| Dispute/admin branch | Participant and admin dispute screens | `open_job_dispute`, `admin_transition_dispute`, `get_dispute_decisions` | Participant-created case, four admin transitions and role-specific Realtime decision projection | P1 browser evidence passed |

## Deterministic remote runner

`npm run test:remote:p1:musluk`:

- fails closed unless `assertStagingTarget` accepts the isolated project and writes are explicitly enabled;
- uses the existing customer and the dedicated second professional that offers `musluk-degisimi` in Sincan/Törekent;
- submits the exact three-answer Musluk contract;
- verifies matching and cross-role scope parity;
- quotes, accepts, sends a message, completes the job and creates a review;
- verifies a contiguous job-event sequence and workmanship certificate snapshot;
- cleans only requests derived from the `P1 MUSLUK GOLDEN` quote marker before and after the run.

### Verification result

- Local ESLint and Node syntax checks passed for both runners.
- Request journey, request contract, wizard definition and shared scope tests passed: 4 files / 43 tests.
- Remote happy path passed with the dedicated customer and Musluk professional.
- Pre-run and post-run fixture cleanup passed.
- The completed job referenced the accepted quote, the certificate snapshot used that quote and the ordered event stream contained the review event.

## Browser evidence

The browser happy path now runs with `npm run test:remote:p1:browser`. It fails closed outside the isolated project, builds with staging credentials, drives the product in Chromium, removes only the scoped Musluk fixture and restores a normal local build.

Passed browser contract:

1. Guest Musluk discovery and wizard completion.
2. Same-tab authentication, explicit draft claim and exact scope restoration.
3. One request submission and professional quote creation from the UI.
4. Customer comparison, confirmation and acceptance from the UI.
5. Two-session messages and live job status transitions through completion.
6. Customer review plus final database read verification.

The independent administrator branch runs with `npm run test:remote:p1:dispute`. It prepares its own participant-owned job through authenticated public RPCs, then uses real browser surfaces to open the case, discover it in the administrator queue and transition it through `triage → investigation → resolution_proposed → notified`. The customer and professional sessions each receive only their role-specific decision explanation. A final authenticated database read verifies the notified case and decision while confirming that dispute operations did not implicitly mutate the independent job lifecycle. Pre-run and post-run cleanup delete only fixtures carrying the `P1 ADMIN DISPUTE` quote marker.

The run also exposed and fixed a real acceptance-navigation race: a successful `router.push` was immediately followed by `router.refresh`, leaving the customer on the comparison page. Job navigation and same-page refresh are now mutually exclusive and covered by the component test. Vinext still logs `ERR_STREAM_UNABLE_TO_PIPE` for aborted responses during browser navigation; the test, cleanup and server shutdown succeed, but the runner log remains a known infrastructure warning.

Vinext production preview also leaves client-side `Link` navigation pending after its current RSC prefetch error. The dispute test still proves administrator queue discovery, validates the exact discovered `href`, and performs a full browser navigation to that route so the product contract is deterministic without concealing the infrastructure warning.
