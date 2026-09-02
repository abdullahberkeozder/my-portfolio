# Orkestra

Orkestra is a local services marketplace prototype designed to connect customers in Ankara with verified tradespeople. Instead of requiring customers to understand service categories, the product lets them describe a problem in natural language, routes them to the most relevant service, and guides them through a service-specific request flow.

## Current Product Scope

- Ankara-focused service discovery and neighborhood-based matching
- Natural-language classification that turns a customer's problem into relevant service candidates
- A centralized taxonomy containing six main categories and 26 services
- Packaged-service, quote-comparison, and on-site assessment delivery models
- Working scope-question wizards for six representative services
- UI-independent domain models, runtime schemas, and request/job state machines
- Media upload, location selection, and request-summary steps
- Supabase-backed customer registration and sign-in
- Persistent request drafts, idempotent submission, private media, and a customer request list
- Tradesperson applications with service and Ankara district selection
- Private professional-document and reference evidence uploads
- Administrator review queue, controlled application/document transitions, and immutable audit events
- Database-enforced quote eligibility and evidence-backed verification badges
- Daily document-expiry processing and automatic reassessment of affected profiles
- Explainable matching across service, district, availability, and verification
- Explicit no-supply and limited-supply customer states
- Immutable, versioned quotes with labor, material, duration, warranty, inclusions, and exclusions
- Customer comparison of up to three offers and atomic quote acceptance
- Accepted-quote job creation with a backend-enforced lifecycle
- Per-job messaging, inspection appointments, bilateral scope changes, and ordered timelines
- Post-acceptance exact-address disclosure
- Transactional notification outbox with retry, worker leases, and dead-letter state
- Category tabs and popular services generated from the shared taxonomy
- A homepage focused on trust, verification, work evidence, and scope transparency
- Responsive desktop and mobile layouts
- Conditional, data-driven wizard steps with district-dependent neighborhoods and risk guidance
- Account recovery, role-aware redirects, loading/error/empty states, and paginated work surfaces
- Consent-aware funnel instrumentation with sensitive-field masking
- An ASP.NET Core notification worker connected to Supabase's transactional outbox and the Resend Email API

## Product and Design System

The interface combines a focused, question-first marketplace flow with an original modular identity for Orkestra.

- A petrol-green, trust-blue, and warm off-white color palette
- A forest-green, pistachio, trust-blue, warm off-white, and editorial-gray palette
- A six-tile house mark representing an assembled service team and completed work
- Scroll-linked tile separation/reassembly with a reduced-motion fallback
- Typeform-inspired question focus and a restrained physical work-receipt summary
- Explicit mobile layouts for 320 px, 390 px, tablet, and desktop surfaces

## Technology

- Next.js 16
- React 19
- TypeScript
- Vinext and Vite
- Tailwind CSS 4
- OpenAI Sites deployment compatible with Cloudflare Workers
- Supabase Auth, PostgreSQL, Row Level Security, and private Storage
- ASP.NET Core 10 background processing
- Resend transactional email API with provider idempotency

## Running the Project

Requirement: Node.js `22.13.0` or newer.

```bash
npm ci
npm run dev
```

Copy `.env.example` to `.env.local` and set the project URL and publishable key. Never place the database password or a Supabase secret/service-role key in a client environment variable.

Windows users can also use the included helper scripts. They prefer a project-local Node runtime under `.tools/` when available and otherwise use the compatible system installation.

The standard `npm run dev`, `npm run build`, and `npm start` commands also detect this project-local runtime automatically when the system Node.js version is too old.

```powershell
.\install.ps1
.\dev.ps1
```

Production build:

```bash
npm run build
npm run start
```

Code-quality check:

```bash
npm run lint
npm run type-check
npm run test
npm run test:e2e
npm run dotnet:check
```

Run the complete non-browser quality gate:

```bash
npm run quality
```

## Engineering Baseline

- Vitest and Testing Library for unit and component tests
- Playwright for browser-level customer-flow tests
- Coverage thresholds for the taxonomy and classification modules
- GitHub Actions checks for lint, type-check, coverage, build, and E2E smoke tests
- Shared fixtures under `tests/fixtures/`
- Domain glossary and requirements-to-test traceability under `docs/engineering/`
- Backend, authentication, and storage decisions under `docs/adr/`

## Project Structure

```text
app/
  api/                 Customer, tradesperson, document, and administrator routes
  components/          Request-wizard and brand components
  data/                Service taxonomy and question definitions
  domain/              Models, validation, state machines, and integrity rules
  lib/                 Classification and Supabase client adapters
  page.tsx             Main product surface
  application.css      Consolidated design system and responsive rules
public/
  mahalle-bagi-figma-frame.png
docs/
  adr/                 Architecture decision records
  engineering/         Glossary, role matrix, operations, and requirements traceability
tests/
  fixtures/            Deterministic domain and UI test data
  unit/                Domain, catalog, classifier, and wizard tests
  component/           React behavior tests
  e2e/                 Browser-level customer-flow tests
supabase/
  migrations/          PostgreSQL schema, constraints, RLS, and Storage policies
services/
  AnkaraUsta.NotificationWorker/        ASP.NET Core outbox delivery worker
  AnkaraUsta.NotificationWorker.Tests/  Provider and processing contract tests
```

## API and Integration Design

- Client writes cross a Next.js server-route boundary and are validated again before database mutation.
- Concurrency-sensitive operations use PostgreSQL RPCs rather than read-then-write client sequences.
- Supabase RLS and private Storage policies enforce customer, tradesperson, and administrator boundaries.
- Job events enqueue durable notifications in the same database transaction.
- The ASP.NET Core worker claims email-only batches with a service-role-only RPC, resolves recipients through Supabase Auth Admin, and sends through Resend using a stable idempotency key.
- Email failures update the existing retry/dead-letter state and never roll back the business operation.

Provider setup and operational details are documented in [`services/AnkaraUsta.NotificationWorker`](./services/AnkaraUsta.NotificationWorker/README.md).

## Testing Strategy

- Vitest covers pure domain rules, schemas, state transitions, taxonomy integrity, auth helpers, error normalization, and analytics privacy.
- React Testing Library covers component behavior and keyboard interaction.
- Playwright covers responsive layouts, accessibility, wizard persistence, authentication preflight, and cross-role workflows.
- The .NET contract suite verifies outbox delivery and Resend idempotency headers without sending a real email.
- The `supabase-integration` CI job runs authenticated role-routing journeys on `main` when all eight required environment secrets are configured: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and the `E2E_CUSTOMER`, `E2E_TRADESPERSON`, and `E2E_ADMIN` email/password pairs.
- Temporarily, missing integration credentials skip that suite with an explicit workflow warning and summary. This is not a passing authenticated test result. Once configured, strict preflight and test failures remain blocking; lint, type-check, unit tests, build, and smoke tests remain unchanged.

## Known Limitations

- The hosted demo does not yet operate with a live pool of Ankara tradespeople.
- Six high-priority services have specialized question trees; the remaining catalog uses a validated generic flow.
- Matching weights are explainable but not yet calibrated with production completion data.
- The notification worker needs separate deployment and server-only Supabase/Resend configuration.
- Payments and calendar synchronization are not implemented and are not presented as current capabilities.

## AI-Assisted Development

OpenAI Codex was used for requirements analysis, implementation alternatives, test-case discovery, debugging, and documentation. Suggestions were reviewed against domain rules, type safety, automated tests, security requirements, and the project's architecture decisions. Final architecture and source changes remain under human review and ownership.

## Next Steps

- Matching quality calibration with real Ankara supply and demand data
- Deploy and observe the ASP.NET Core notification worker in staging
- Complete specialized question trees for the remaining service backlog
- Add operational dashboards for RPC latency, outbox retry depth, and funnel exits
- Validate production email delivery, domain authentication, and unsubscribe boundaries

This repository is a full-stack marketplace foundation rather than a static concept: public discovery is connected to identity, durable requests, private media, tradesperson onboarding, evidence review, matching, versioned quotes, ordered job operations, disputes, and a decoupled external-notification integration.
