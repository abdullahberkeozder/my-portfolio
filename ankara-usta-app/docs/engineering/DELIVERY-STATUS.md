# Orkestra delivery status

Updated: 21 September 2026

This file is the canonical status summary. Detailed evidence remains in the linked implementation logs and the deferred validation backlog.

## Status contract

| Status | Meaning |
| --- | --- |
| Planned | Scope and acceptance criteria exist; product code is not complete. |
| Implemented | Source and any required migration are authored. |
| Locally verified | Relevant local lint, type, unit/component or mocked browser checks pass. |
| Multi-account verified | The real customer, professional and/or administrator personas required by the slice pass isolated Auth, RLS, Realtime and concurrency checks. |
| Released | The verified commit, migrations and flags are deliberately deployed and smoke-tested. |

No lower status implies a higher one. In particular, local verification is not evidence of database authorization in a remote environment.

## Current slices

| Slice | Planned | Implemented | Locally verified | Multi-account verified | Released | Evidence and limits |
| --- | --- | --- | --- | --- | --- | --- |
| M0, contracts | Yes | Yes | Yes | Yes | No | Core owner/participant, direct-table/RPC and negative boundaries passed in `orkestra-e2e`; [R2 gate](../r2-m0-m4-gate.md) |
| M1, directed requests | Yes | Yes | Yes | Yes | No | Directed audience and open-flow isolation passed; feature flag remains deliberately disabled |
| M2, invitations and explicit broadening | Yes | Yes | Yes | Yes | No | Decline, expiry/eligibility boundaries and explicit broaden flow passed; [M2 evidence](REQUEST-INVITATIONS-M2.md) |
| Account entry points | Yes | Yes | Yes | No | No | [Account evidence](ACCOUNT-ENTRYPOINTS.md) |
| M3, private pre-job text conversations | Yes | Yes | Yes | Yes | No | Participant access, idempotency, sequence and simultaneous browser messages passed; attachments remain out of scope; [M3 evidence](PREJOB-CONVERSATIONS-M3.md) |
| M4, quote feedback and revision | Yes | Yes | Yes | Yes | No | Revision, stale-base, retry and live scope-change checks passed; [M4 evidence](QUOTE-REVISIONS-M4.md) |
| M4, acceptance continuation | Yes | Yes | Yes | Yes | No | Competing acceptance and single-authoritative-result contract passed; final product UI/accessibility remains in the maturity roadmap |
| M5, inquiry and operational inbox | Yes | No | No | No | No | Planned in [marketplace plan](MARKETPLACE-REQUEST-AND-CONVERSATION-PLAN.md) |
| Wizard R0/R1 baseline | Yes | Yes | Yes | Not run | No | Single task surface and editable final summary; [wizard research](WIZARD-REDESIGN-RESEARCH-2026-09-04.md) |
| Golden vertical slice: Musluk Değişimi | Yes | Yes | Yes | Yes | No | Deterministic RPC, real-browser customer–professional happy path and independent customer–professional–admin dispute path passed with scoped cleanup; [P1 inventory](P1-GOLDEN-MUSLUK-INVENTORY-2026-09-21.md) |
| Wizard R2 completion receipt | Yes | Yes | Yes | Not required | No | Rendered only after authoritative submission success; [R2 evidence](WIZARD-R2-SUCCESS-RECEIPT-2026-09-04.md) |
| U1, service discovery | Yes | Yes | Yes | Not required | No | Local task-focused browser evidence exists; no release record |
| U2, request preparation | Yes | Yes | Yes | Partial | No | Wizard, editable review and success receipt are present; complete role/device evidence remains open |
| U3, professional selection | Yes | Yes | Yes | Yes | No | Final staging run: 6/6 Chromium scenarios passed across 320/390/820/1440, mobile auth return and same-browser A → B → A draft isolation |
| Isolated `orkestra-e2e` environment | Yes | Yes | Yes | Yes | No | Two customers, admin and two synthetic professional personas support U3 and R2 evidence; this is test infrastructure, not live supply |
| R0, source and evidence freeze | Yes | Yes | Yes | Partial | No | Migration history, RPC grants, targeted quality gates and post-migration U3 browser package recorded in [R0 evidence](R0-SOURCE-AND-EVIDENCE-2026-09-19.md) |
| R2, M0–M4 core gate | Yes | Yes | Yes | Yes | No | Authorization/concurrency, M2/M4 fixtures, cleanup and 4/4 Realtime browser scenarios passed; clean Orkestra staged candidate recorded in [P0 evidence](P0-REPOSITORY-EVIDENCE-2026-09-21.md) |
| P0, repository and evidence truth | Yes | Yes | Yes | Yes | No | 29/29 migrations, 398 local tests, production build and remote R2 rerun recorded; commit/push and release remain separate |

## Rollout flags

| Flag | Default | Activation gate |
| --- | --- | --- |
| `ORKESTRA_DIRECT_REQUESTS_ENABLED` | `false` | Core technical gate passed; keep disabled until golden-path, UX/accessibility and explicit product activation decision |
| `ORKESTRA_PREJOB_CHAT_ENABLED` | `false` | Core technical gate passed; keep disabled until conversation recovery/operational UX and explicit activation decision |
| `ORKESTRA_QUOTE_REVISIONS_ENABLED` | `false` | Core technical gate passed; keep disabled until comparison/acceptance UI and explicit activation decision |

## Current release decision

Continue local product development, but do not mark M0–M4 as released and do not enable their flags. The isolated technical gate has passed; the next constraint is product maturity rather than environment availability.

The R2 source and evidence are consolidated. Both the customer–professional `Musluk Değişimi` happy path and its independent administrator dispute fixture now pass in the isolated environment. P1 is multi-account verified but not released. The next product gate is the remaining wizard/accessibility and account/recovery matrix. Release-stage advisor, rollback, offline/accessibility and controlled-activation checks remain in [Deferred pre-release validation](PRE-RELEASE-VALIDATION-BACKLOG.md).

The current sequencing decision is recorded in [Product maturity roadmap, 21 September 2026](PRODUCT-MATURITY-ROADMAP-2026-09-21.md). The 19 September roadmap is retained only as historical context.
