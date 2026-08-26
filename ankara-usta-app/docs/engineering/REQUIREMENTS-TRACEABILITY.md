# Requirements and Test Traceability

Version: 1.0  
Date: 26 August 2026

Status values: `verified`, `partial`, and `planned`. A requirement may only move to `verified` when its listed automated and manual evidence exists.

| ID | Requirement | Current status | Implementation evidence | Automated evidence | Target phase |
| --- | --- | --- | --- | --- | --- |
| CAT-001 | The catalog contains six categories and 26 uniquely identified services. | verified | `app/data/serviceTaxonomy.ts` | `tests/unit/serviceTaxonomy.test.ts` | 0 |
| CLS-001 | A customer problem produces at most three ranked service candidates. | partial | `app/lib/classifyService.ts` | `tests/unit/classifyService.test.ts` | 0–1 |
| CLS-002 | Turkish casing, punctuation, and known aliases are normalized consistently. | partial | `app/lib/classifyService.ts` | `tests/unit/classifyService.test.ts` | 0–1 |
| CLS-003 | Top-3 classification accuracy is measured against anonymized customer language. | planned | Evaluation corpus not yet available | Dataset evaluation suite | 1 |
| WIZ-001 | Six representative services use valid service-specific questions. | verified | `app/data/wizardDefinitions.ts` | `tests/unit/wizardDefinitions.test.ts` | 0 |
| WIZ-002 | A customer cannot advance before required scope questions are answered. | verified | `app/components/RequestWizard.tsx` | `tests/component/RequestWizard.test.tsx` | 0 |
| WIZ-003 | All 26 services have reviewed branching question definitions. | planned | Twenty services use the generic fallback | Branch-coverage suite | 1–2 |
| FLOW-001 | A customer can start classification from the homepage search. | verified | `app/page.tsx` | `tests/e2e/home.spec.ts` | 0 |
| REQ-001 | A request draft survives refresh and can be resumed by its owner. | planned | No persistence | Integration and E2E tests | 2 |
| MEDIA-001 | Customer media is type-, size-, ownership-, and permission-validated. | planned | Prototype only counts local files | Storage integration and security tests | 2 |
| AUTH-001 | Customer, tradesperson, moderator, and administrator permissions are enforced server-side. | planned | No authentication | Authorization matrix tests | 2–3 |
| PRO-001 | A tradesperson application follows an auditable review state machine. | planned | Not implemented | State-machine and integration tests | 3 |
| MAT-001 | Matching uses service, area, availability, and verification eligibility rules. | planned | Not implemented | Unit, property, and integration tests | 4 |
| QTE-001 | Accepted quote versions are immutable and comparable by common scope fields. | planned | Not implemented | Concurrency and integration tests | 4 |
| JOB-001 | Invalid job-state transitions are rejected on the server. | planned | Not implemented | State-machine property tests | 5 |
| MSG-001 | Messages belong to one authorized request or job room. | planned | Not implemented | Authorization and E2E tests | 5 |
| REV-001 | Only a completed platform job can receive a verified review. | planned | Not implemented | Integration and abuse-case tests | 6 |
| DSP-001 | Disputes preserve evidence, decisions, actors, timestamps, and reasons. | planned | Not implemented | Audit and workflow tests | 6 |
| OPS-001 | CI blocks changes that fail lint, type-check, unit tests, or build. | verified | `.github/workflows/ankara-usta-ci.yml` | GitHub Actions quality job | 0 |

## Maintenance rule

Every product requirement added to the backlog must receive an ID here before implementation. Pull requests must reference the relevant requirement IDs and add or update the corresponding test evidence.
