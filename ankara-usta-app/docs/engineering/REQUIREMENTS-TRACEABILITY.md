# Requirements and Test Traceability

Version: 1.3
Date: 27 August 2026

Status values: `verified`, `partial`, and `planned`. A requirement may only move to `verified` when its listed automated and manual evidence exists.

| ID | Requirement | Current status | Implementation evidence | Automated evidence | Target phase |
| --- | --- | --- | --- | --- | --- |
| CAT-001 | The catalog contains six categories and 26 uniquely identified services. | verified | `app/data/serviceTaxonomy.ts` | `tests/unit/serviceTaxonomy.test.ts` | 0 |
| CAT-002 | Duplicate IDs/slugs, duplicate popular ranks, and missing category references are rejected. | verified | `app/domain/catalog.ts` | `tests/unit/catalogIntegrity.test.ts` | 1 |
| DOM-001 | Service, Request, Quote, Job, and UserRole have UI-independent models and runtime schemas. | verified | `app/domain/models.ts`, `app/domain/schemas.ts` | `tests/unit/domainSchemas.test.ts` | 1 |
| DOM-002 | Invalid request and job state transitions are rejected by pure domain functions. | verified | `app/domain/stateMachines.ts` | `tests/unit/stateMachines.test.ts` | 1 |
| CLS-001 | A customer problem produces at most three ranked service candidates. | partial | `app/lib/classifyService.ts` | `tests/unit/classifyService.test.ts` | 0–1 |
| CLS-002 | Turkish casing, punctuation, and known aliases are normalized consistently. | partial | `app/lib/classifyService.ts` | `tests/unit/classifyService.test.ts` | 0–1 |
| CLS-003 | Top-3 classification accuracy is measured against anonymized customer language. | planned | Evaluation corpus not yet available | Dataset evaluation suite | 1 |
| WIZ-001 | Six representative services use valid service-specific questions. | verified | `app/data/wizardDefinitions.ts` | `tests/unit/wizardDefinitions.test.ts` | 0 |
| WIZ-002 | A customer cannot advance before required scope questions are answered. | verified | `app/components/RequestWizard.tsx` | `tests/component/RequestWizard.test.tsx` | 0 |
| WIZ-003 | All 26 services have reviewed branching question definitions. | planned | Twenty services are specified in `docs/engineering/WIZARD-BACKLOG.md` and use the data-owned fallback | Branch-coverage suite | 2 |
| WIZ-004 | Wizard definitions and their fallback are data-owned and runtime validated outside the UI. | verified | `app/data/wizardDefinitions.ts`, `app/domain/wizard.ts` | `tests/unit/wizardDefinitions.test.ts` | 1 |
| FLOW-001 | A customer can start classification from the homepage search. | verified | `app/page.tsx` | `tests/e2e/home.spec.ts` | 0 |
| REQ-001 | A request draft survives refresh and can be resumed by its owner. | partial | Local recovery plus authenticated Supabase upsert in `app/components/RequestWizard.tsx` and `app/api/requests/draft/route.ts` | Domain tests; refresh E2E pending | 2 |
| REQ-002 | Repeating the same submission does not create a second request. | partial | Stable UUID idempotency key, compound unique constraint, and submit route | Domain tests; database concurrency test pending | 2 |
| MEDIA-001 | Customer media is type-, size-, ownership-, and permission-validated. | partial | Private bucket, RLS folder policy, metadata checks, and server route | Storage integration and cross-user tests pending | 2 |
| AUTH-001 | Customer, tradesperson, moderator, and administrator permissions are enforced server-side. | partial | Database-owned roles, RLS policies, protected server routes, and `docs/engineering/ROLE-PERMISSION-MATRIX.md` | Unit tests pass; authenticated cross-role integration suite pending | 2–3 |
| PRO-001 | A tradesperson application follows an auditable review state machine. | verified | `app/domain/stateMachines.ts`, application API, database transition trigger | `tests/unit/stateMachines.test.ts`, `tests/unit/tradespersonApplication.test.ts` | 3 |
| PRO-002 | An unapproved tradesperson cannot create a quote. | partial | `quotes` insert RLS plus domain eligibility rule require an approved profile and current verified evidence | `tests/unit/verification.test.ts`; authenticated database negative test pending | 3 |
| PRO-003 | A public verification badge is derived only from current verified evidence. | partial | `has_current_professional_verification`, security-invoker directory view, and domain projection rule | Expiry boundary covered by `tests/unit/verification.test.ts`; database integration pending | 3 |
| PRO-004 | Every administrator mutation of a tradesperson application, document, or reference creates an audit event. | partial | Database audit triggers and administrator review APIs with required reasons | Database triggers installed; authenticated actor/reason integration test pending | 3 |
| PRO-005 | Tradespeople select valid services and Ankara districts and submit private documents/references. | partial | Tradesperson application UI/API, catalog validation, private Storage bucket and RLS | Domain tests pass; authenticated upload E2E pending | 3 |
| PRO-006 | Expired professional evidence triggers reassessment and removes effective eligibility. | partial | Daily Supabase Cron function, system audit events, partial expiry index | Domain expiry-boundary test passes; scheduled database-run verification pending | 3 |
| MAT-001 | Matching uses service, area, availability, and verification eligibility rules. | partial | Domain scorer, `match_request` RPC, matching snapshots, and customer/provider screens | `tests/unit/matching.test.ts`; authenticated database integration pending | 4 |
| MAT-002 | Every match exposes its score components and human-readable reasons. | partial | Stored `score_components`/`reasons` and matching explanation UI | Deterministic score unit tests pass; database projection test pending | 4 |
| MAT-003 | Insufficient supply produces an explicit customer state and recovery action. | partial | `no_supply`, `limited_supply`, `healthy` run states and customer copy | Boundary unit tests pass; E2E pending | 4 |
| QTE-001 | Accepted quote versions are immutable and comparable by common scope fields. | partial | Version RPC, mutation guard, labor/material/duration/warranty/scope UI | `tests/unit/quotes.test.ts`; database immutability integration pending | 4 |
| QTE-002 | A customer compares at most three current quotes. | partial | Client comparison selector enforces a three-quote maximum | Unit test passes; component test pending | 4 |
| QTE-003 | Parallel acceptance attempts can produce only one accepted quote per request. | partial | Row-locking acceptance RPC and partial unique index | Database concurrency test pending | 4 |
| JOB-001 | Invalid job-state transitions are rejected in the domain before persistence. | verified | `app/domain/stateMachines.ts` | `tests/unit/stateMachines.test.ts` | 1 |
| JOB-002 | Role-inappropriate and invalid job transitions are rejected by the backend. | partial | Domain actor matrix and `transition_job` database operation | `tests/unit/jobLifecycle.test.ts`; authenticated database integration pending | 5 |
| JOB-003 | Messages and workflow changes share one monotonic, immutable timeline. | partial | Job-row sequence counter, `job_events`, message RPC, and timeline UI | Domain tests pass; concurrent sequence integration test pending | 5 |
| JOB-004 | Scope changes require both customer and tradesperson approval. | partial | Scope proposal/response RPCs and pending-change uniqueness | Input tests pass; two-user integration test pending | 5 |
| JOB-005 | Exact address is disclosed only after provider selection creates a job. | partial | Job-owned address table, customer-only write RPC, participant RLS | Cross-stage RLS integration test pending | 5 |
| MSG-001 | Messages belong to one authorized job room. | partial | Participant RLS, idempotent message RPC, and job-room UI | Validation tests pass; cross-user integration test pending | 5 |
| NTF-001 | Notification delivery failures do not roll back the triggering domain operation. | partial | Transactional outbox, separate service-role worker functions, exponential retry, lease recovery, and dead state | Retry timing unit test passes; worker integration test pending | 5 |
| REV-001 | Only the customer of a completed platform job can create one verified review. | verified | `app/domain/trust.ts`, private implementation + invoker RPC, unique job constraint and review API | `tests/unit/trust.test.ts`, `supabase/tests/remote/phase6_trust_rls.sql` | 6 |
| MEDIA-002 | Work-log media is public only after customer publication consent and moderator approval. | verified | `work_log_entries` dual-gate RLS and partial public index | Unit and anonymous/participant remote RLS tests pass | 6 |
| CERT-001 | Customer acceptance creates one immutable digital workmanship certificate with a scope snapshot. | verified | Completion trigger, `job_acceptances`, `workmanship_certificates` | Remote completion/certificate test passes | 6 |
| DSP-001 | Disputes preserve participants, evidence context, decisions, actors, timestamps, and reasons. | partial | `dispute_cases`, participant RLS and dispute API | Domain validation passes; workflow integration pending | 6 |
| MOD-001 | Every moderation decision is append-only and records its actor, timestamp, action and reason. | verified | Private implementation + invoker RPC, immutable decision trigger and `admin_audit_log` projection | Unit and authenticated administrator remote tests pass | 6 |
| TRUST-001 | District trust metrics publish only cohorts with at least five approved completed-job reviews. | partial | Trigger-maintained `district_trust_metrics` table with public read-only RLS | Threshold unit test passes; aggregation integration pending | 6 |
| OPS-001 | CI blocks changes that fail lint, type-check, unit tests, or build. | verified | `.github/workflows/ankara-usta-ci.yml` | GitHub Actions quality job | 0 |

## Maintenance rule

Every product requirement added to the backlog must receive an ID here before implementation. Pull requests must reference the relevant requirement IDs and add or update the corresponding test evidence.
