# Ankara Usta

Ankara Usta is a local services marketplace prototype designed to connect customers in Ankara with verified tradespeople. Instead of requiring customers to understand service categories, the product lets them describe a problem in natural language, routes them to the most relevant service, and guides them through a service-specific request flow.

Live preview: [ankara-usta.sevvaltuhafiye154322.chatgpt.site](https://ankara-usta.sevvaltuhafiye154322.chatgpt.site)

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

## Design System

The interface draws inspiration from Taskrabbit's straightforward task-creation experience while developing a distinct identity for Ankara Usta.

- A petrol-green, trust-blue, and warm off-white color palette
- The original **Mahalle Bağı** (Neighborhood Bond) brand motif from Figma frame `10:749`
- A two-color ring representing the connection between customer, tradesperson, and neighborhood
- A modular tile structure combining house, Tetris, and LEGO-inspired visual language
- A low-density modular rhythm that continues along the page edges
- Controlled repetition and quiet surfaces that support rather than compete with the content

## Technology

- Next.js 16
- React 19
- TypeScript
- Vinext and Vite
- Tailwind CSS 4
- OpenAI Sites deployment compatible with Cloudflare Workers
- Supabase Auth, PostgreSQL, Row Level Security, and private Storage

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
  globals.css          Design system and responsive rules
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
```

## Next Steps

- Bootstrap the first administrator from a known Supabase Auth identity
- Add authenticated cross-role RLS and Storage integration tests
- Matching quality calibration with real Ankara supply and demand data
- Production notification channel workers and delivery-provider integration
- Reviews, complaints, and dispute management
- Cross-user RLS integration tests and production email delivery configuration

This version is now an early full-stack marketplace foundation: the public discovery experience is connected to Supabase-backed customer identity, durable requests, private media, tradesperson onboarding, evidence review, and an administrator queue. Matching, the complete quoting experience, messaging, jobs, and dispute operations remain planned phases.
