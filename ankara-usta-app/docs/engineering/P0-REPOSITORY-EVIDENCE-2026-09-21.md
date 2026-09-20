# P0 — Repository and evidence record

Date: 21 September 2026

Branch: `main`

Candidate base: `186bf2e` (`fix(orkestra): verify U3 auth return and draft isolation`)

Target environment: isolated Supabase project `orkestra-e2e` (`hyuijuafuayzultbjvjb`)

Release status: **Not released. Feature flags remain disabled.**

## Purpose

This record binds the current R2 source, migration inventory, local quality results, isolated multi-account evidence and known limits to one Orkestra-only commit candidate. It excludes `.vscode`, the Umut Usta workflow and all `the-welding-expert-app` artifacts.

## Candidate scope

### R2 runners and configuration

- `package.json`
- `playwright.r2.config.ts`
- `scripts/run-phase65-remote.mjs`
- `scripts/run-phase65-data-concurrency.mjs`
- `scripts/run-r2-contracts-remote.mjs`
- `scripts/run-r2-m2-m4.mjs`
- `scripts/run-r2-realtime-browser.mjs`

### Remote SQL evidence and cleanup

- `supabase/tests/remote/phase65_concurrency_setup.sql`
- `supabase/tests/remote/phase65_hardening.sql`
- `supabase/tests/remote/two_user_rls.sql`
- `supabase/tests/remote/r2_cleanup_orphans.sql`
- `supabase/tests/remote/r2_m2_m4_cleanup.sql`
- `supabase/tests/remote/r2_realtime_cleanup.sql`

These are test/cleanup contracts, not new product migrations. Cleanup derives a bounded UUID set from explicit R2 fixture markers before deleting related rows in the isolated project.

### Current status and product planning

- `README.md`
- `docs/r2-m0-m4-gate.md`
- `docs/engineering/DELIVERY-STATUS.md`
- `docs/engineering/MARKETPLACE-REQUEST-AND-CONVERSATION-PLAN.md`
- `docs/engineering/PRE-RELEASE-VALIDATION-BACKLOG.md`
- `docs/engineering/PREJOB-CONVERSATIONS-M3.md`
- `docs/engineering/QUOTE-REVISIONS-M4.md`
- `docs/engineering/PRODUCT-ROADMAP-2026-09-19.md`
- `docs/engineering/PRODUCT-MATURITY-ROADMAP-2026-09-21.md`
- `docs/engineering/P0-REPOSITORY-EVIDENCE-2026-09-21.md`

## Migration inventory

Supabase CLI `2.115.0` reported **29 local / 29 remote migrations**, with no local-only or remote-only version in `orkestra-e2e`:

1. `20260826114833_customer_request_slice.sql`
2. `20260826120447_harden_customer_request_updates.sql`
3. `20260826121044_tradesperson_accounts_and_verification.sql`
4. `20260827084012_automate_tradesperson_document_expiry.sql`
5. `20260827085002_matching_and_versioned_quotes.sql`
6. `20260827114309_job_lifecycle_messaging_and_outbox.sql`
7. `20260827121027_harden_rpc_and_rls_policies.sql`
8. `20260827122114_prevent_request_match_rls_recursion.sql`
9. `20260827122158_grant_request_policy_helper.sql`
10. `20260827122239_grant_admin_policy_helper.sql`
11. `20260827135042_trust_reviews_and_moderation.sql`
12. `20260827135923_harden_phase6_rpc_boundaries.sql`
13. `20260827140335_phase6_job_media_storage.sql`
14. `20260827144500_fix_atomic_scope_change_approval.sql`
15. `20260827145500_atomic_request_draft_upsert.sql`
16. `20260827152000_dispute_operations.sql`
17. `20260830100322_harden_request_and_tradesperson_mutations.sql`
18. `20260831213639_enable_realtime_product_flows.sql`
19. `20260901130258_email_notification_delivery.sql`
20. `20260902102337_unified_request_contract.sql`
21. `20260902192847_harden_dispute_rpc_boundaries.sql`
22. `20260902200310_directed_request_routing.sql`
23. `20260902202626_direct_invitation_response.sql`
24. `20260902205806_account_registration_intents.sql`
25. `20260902211047_request_conversations.sql`
26. `20260902213412_quote_revision_requests.sql`
27. `20260905152012_scope_review_trust_metric_refresh.sql`
28. `20260907010554_public_verification_summary.sql`
29. `20260919194836_harden_public_verification_projection.sql`

No migration was created or applied during P0.

## Security and environment boundary

- `.env.e2e.local` is ignored by `.gitignore`; no credential value is part of the candidate.
- `assertStagingTarget` requires a 20-character staging ref, exact matching Supabase URL and explicit `E2E_ALLOW_STAGING_WRITES=true`.
- Production ref `qzrktfyouloqxjbkhjce` is explicitly rejected.
- Public and service keys are obtained at runtime and passed only to child processes; the scripts do not print their values.
- Current Supabase breaking-change review found no required migration for this candidate. R2 does not modify the locked `realtime` schema and introduces no new Data API table.

## Local verification

The first attempt used system Node 20 and failed before project execution because the sandbox denied writing/realpath access under the user profile. The authoritative run used the repository runtime Node `24.19.0`.

| Check | Result |
| --- | --- |
| `npm run repository:check` | Passed; 1,097 repository files inspected |
| `npm run styles:check` | Passed |
| `npm run ui-debt:check` | Passed within current budget: 6,156 CSS lines, 360 `!important`, 58 media queries, 37 inline styles |
| `npm run lint` | Passed |
| `npm run type-check` | Passed |
| `npm run test` | Passed; 67 files / 398 tests |
| `npm run build` | Passed; Vinext production build completed |
| `git diff --check` | Passed after documentation updates |

## Isolated remote verification

| Package | Result |
| --- | --- |
| Migration list | Passed; 29/29 local and remote versions match |
| Phase 6.5 hardening | Passed; RLS, eligibility, scope, retry and trust checks |
| Idempotent draft race | Passed; two calls resolved to one request |
| Competing quote acceptance | Passed; one accepted quote and one job |
| M2 invitation/broadening | Passed; non-target denied, target decline recorded, customer-only explicit broaden |
| M3 conversation contract | Passed; participant-only access and idempotent retry |
| M4 revision contract | Passed; unauthorized denial, one stale-base winner and retry of the winning payload |
| Realtime browser package | Passed; 4/4 scenarios |
| Pre/post cleanup | Passed for concurrency, M2–M4 and Realtime fixtures |

The M4 rerun exposed a test-harness nondeterminism: the script retried the first payload even when the competing second payload won. The runner now identifies the winning payload, retries it and asserts that the same quote ID is returned. No product RPC or database schema was changed for this correction.

## Known limits

- M0–M4 are **multi-account verified but not released**. Flags remain off.
- Vinext logs `ERR_STREAM_UNABLE_TO_PIPE` when aborted browser responses close early. The Realtime suite still passes 4/4, the server shuts down and port 4187 is released. The log remains visible technical debt.
- Registration, email confirmation, password reset, broad assistive-technology/offline coverage, advisor/runbook review and controlled activation remain outside this P0 evidence.
- Synthetic test accounts and profiles are not live Ankara supply.
- Supabase CLI `2.117.0` is available; the pinned project candidate uses `2.115.0`. No upgrade was mixed into this evidence commit.

## Candidate transition

This record satisfies **Planned → Implemented → Locally verified → Multi-account verified** for the R2 core gate. It does not satisfy `Released`.

Before committing, verify that the staged set contains only the files listed above. The resulting commit should remain separate from Umut Usta, editor configuration and generated Playwright reports.

Final staging check: **23 Orkestra files** are staged, `git diff --cached --check` passes, and the remaining untracked paths are limited to the excluded Umut Usta workflow, `.vscode` configuration and `the-welding-expert-app` artifacts.
