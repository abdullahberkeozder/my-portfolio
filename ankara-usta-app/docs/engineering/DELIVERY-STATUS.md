# Orkestra delivery status

Updated: 4 September 2026

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
| Wizard R2 completion receipt | Yes | No | No | No | No | Receipt must appear only after an authoritative successful submission |

## Rollout flags

| Flag | Default | Activation gate |
| --- | --- | --- |
| `ORKESTRA_DIRECT_REQUESTS_ENABLED` | `false` | M0-M2 isolated authorization, open-flow regression and concurrency suite |
| `ORKESTRA_PREJOB_CHAT_ENABLED` | `false` | M3 participant RLS, idempotency, sequence and reconnect suite |
| `ORKESTRA_QUOTE_REVISIONS_ENABLED` | `false` | M4 stale-version, retry, acceptance and concurrency suite |

## Current release decision

Continue local product development as previously agreed, but do not mark M0-M4 as released and do not enable their flags. Before activation, complete every open item in [Deferred pre-release validation](PRE-RELEASE-VALIDATION-BACKLOG.md) against an explicitly approved isolated Supabase environment.
