# Orkestra delivery status

Updated: 19 September 2026

This file is the canonical status summary. Detailed evidence remains in the linked implementation logs and the deferred validation backlog.

## Status contract

| Status | Meaning |
| --- | --- |
| Planned | Scope and acceptance criteria exist; product code is not complete. |
| Implemented | Source and any required migration are authored. |
| Locally verified | Relevant local lint, type, unit/component or mocked browser checks pass. |
| Multi-account verified | Real customer, professional and administrator identities pass isolated Auth, RLS, Realtime and concurrency checks. |
| Released | The verified commit, migrations and flags are deliberately deployed and smoke-tested. |

No lower status implies a higher one. In particular, local verification is not evidence of database authorization in a remote environment.

## Current slices

| Slice | Planned | Implemented | Locally verified | Multi-account verified | Released | Evidence and limits |
| --- | --- | --- | --- | --- | --- | --- |
| M0, contracts | Yes | Yes | Yes | No | No | [Directed requests M0/M1](DIRECTED-REQUESTS-M0-M1.md) |
| M1, directed requests | Yes | Yes | Yes | No | No | Feature flag remains disabled; see [pre-release backlog](PRE-RELEASE-VALIDATION-BACKLOG.md) |
| M2, invitations and explicit broadening | Yes | Yes | Yes | No | No | [M2 evidence](REQUEST-INVITATIONS-M2.md) |
| Account entry points | Yes | Yes | Yes | No | No | [Account evidence](ACCOUNT-ENTRYPOINTS.md) |
| M3, private pre-job text conversations | Yes | Yes | Yes | No | No | Attachments are out of scope; [M3 evidence](PREJOB-CONVERSATIONS-M3.md) |
| M4, quote feedback and revision | Yes | Yes | Targeted checks | No | No | Final concurrency proof is pending; [M4 evidence](QUOTE-REVISIONS-M4.md) |
| M4, acceptance continuation | Yes | Yes | Targeted checks | No | No | Same-job recovery is locally covered; real race evidence is pending |
| M5, inquiry and operational inbox | Yes | No | No | No | No | Planned in [marketplace plan](MARKETPLACE-REQUEST-AND-CONVERSATION-PLAN.md) |
| Wizard R0/R1 baseline | Yes | Yes | Yes | Not run | No | Single task surface and editable final summary; [wizard research](WIZARD-REDESIGN-RESEARCH-2026-09-04.md) |
| Golden vertical slice: Musluk Değişimi | Yes | Yes | Yes | No | No | Submission-to-workspace continuity and shared scope are locally covered; [slice evidence](GOLDEN-VERTICAL-SLICE-MUSLUK-2026-09-04.md) |
| Wizard R2 completion receipt | Yes | Yes | Yes | Not required | No | Rendered only after authoritative submission success; [R2 evidence](WIZARD-R2-SUCCESS-RECEIPT-2026-09-04.md) |
| U1, service discovery | Yes | Yes | Yes | Not required | No | Local task-focused browser evidence exists; no release record |
| U2, request preparation | Yes | Yes | Yes | Partial | No | Wizard, editable review and success receipt are present; complete role/device evidence remains open |
| U3, professional selection | Yes | Yes | Yes | Partial | No | Final staging run: 6/6 Chromium scenarios passed across 320/390/820/1440, mobile auth return and same-browser A → B → A draft isolation; full M0–M4 role matrix remains open |
| Isolated `orkestra-e2e` environment | Yes | Yes | Yes | Partial | No | Two customers, admin and two synthetic professional personas exist; this is not the full M0–M4 authorization/concurrency gate |
| R0, source and evidence freeze | Yes | Yes | Yes | Partial | No | Migration history, RPC grants, targeted quality gates and post-migration U3 browser package recorded in [R0 evidence](R0-SOURCE-AND-EVIDENCE-2026-09-19.md) |

## Rollout flags

| Flag | Default | Activation gate |
| --- | --- | --- |
| `ORKESTRA_DIRECT_REQUESTS_ENABLED` | `false` | M0-M2 isolated authorization, open-flow regression and concurrency suite |
| `ORKESTRA_PREJOB_CHAT_ENABLED` | `false` | M3 participant RLS, idempotency, sequence and reconnect suite |
| `ORKESTRA_QUOTE_REVISIONS_ENABLED` | `false` | M4 stale-version, retry, acceptance and concurrency suite |

## Current release decision

Continue local product development as previously agreed, but do not mark M0-M4 as released and do not enable their flags. Before activation, complete every open item in [Deferred pre-release validation](PRE-RELEASE-VALIDATION-BACKLOG.md) against an explicitly approved isolated Supabase environment.

The isolated environment is no longer hypothetical: `orkestra-e2e` and dedicated synthetic U3 personas were prepared after the original deferred-validation decision. Directed-request auth return, responsive U3 and same-browser customer account-switch isolation have passed there. Complete M0–M4 authorization, Realtime and concurrency evidence remain open. Historical backlog statements saying that no environment or personas exist must therefore be read as superseded, not as current status.

The current sequencing decision is recorded in [Product roadmap, 19 September 2026](PRODUCT-ROADMAP-2026-09-19.md): with U3 account-switch evidence complete, pass the M0–M4 multi-account release gate, then prove the `Musluk Değişimi` golden vertical slice before any new horizontal feature family.
