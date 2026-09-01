# Abdullah Berke Özder — Software Engineering Portfolio

Selected product-oriented applications covering full-stack web development, secure data workflows, automated testing, responsive interface design, and documented architecture decisions.

## Ankara Usta — Local Services Marketplace

> A production-oriented marketplace foundation built with Next.js, TypeScript, Supabase/PostgreSQL, ASP.NET Core, role-based access, API routes, state machines, automated tests, GitHub Actions, and written architecture decisions.

[Live demo](https://ankara-usta.sevvaltuhafiye154322.chatgpt.site) · [Project documentation](./ankara-usta-app/README.md) · [Architecture decisions](./ankara-usta-app/docs/adr/) · [Requirements traceability](./ankara-usta-app/docs/engineering/REQUIREMENTS-TRACEABILITY.md)

Ankara Usta helps customers describe a household problem, identify the correct service, create a structured request, compare offers, and manage the resulting job. Tradespeople apply with service regions and evidence; administrators review applications, documents, disputes, and moderation decisions.

### Architecture overview

```text
Next.js / React / TypeScript
        │ authenticated API routes
        ▼
Supabase Auth + PostgreSQL RPCs + RLS + private Storage
        │ transactional notification outbox
        ▼
ASP.NET Core notification worker ──► Resend Email API
```

The browser never receives service-role credentials. Critical mutations are performed by validated server routes and database RPCs. PostgreSQL owns concurrency-sensitive decisions, immutable event order, audit records, and row-level authorization.

### Main workflows

- Natural-language service discovery across six categories and 26 services
- Conditional request wizard with media, Ankara district/neighborhood, safety guidance, draft recovery, and idempotent submission
- Tradesperson application, evidence upload, review, expiry, and reassessment
- Explainable service-area matching and versioned quote comparison
- Atomic quote acceptance and job creation
- Ordered messaging, inspection appointments, bilateral scope changes, and job timeline
- Evidence-backed reviews, disputes, sanctions, appeals, and immutable moderation records

### API and integration design

- Next.js server routes define public HTTP boundaries and normalize client-safe errors.
- Supabase PostgreSQL functions enforce state transitions and concurrent writes close to the data.
- RLS and private Storage policies protect customer, tradesperson, document, and media boundaries.
- An ASP.NET Core worker claims email-only outbox rows with `SKIP LOCKED`, resolves recipients through Supabase Auth Admin, and sends idempotent transactional messages through Resend.
- Provider failure never rolls back the domain operation; retry and dead-letter state remain in PostgreSQL.

### Testing strategy

- Vitest for domain rules, state machines, validators, taxonomy integrity, and adapters
- React Testing Library for interactive component behavior
- Playwright for responsive, accessibility, wizard, auth, and cross-role journeys
- ASP.NET Core contract tests for outbox processing and provider idempotency
- Remote Supabase tests for RLS, Storage isolation, concurrency, and multi-user workflows

### Architecture Decision Records

The project documents backend boundaries, authentication, storage, matching, atomic quoting, ordered events, transactional outbox delivery, trust, moderation, and dispute operations under [`ankara-usta-app/docs/adr`](./ankara-usta-app/docs/adr/).

### CI pipeline

GitHub Actions installs pinned Node dependencies, checks repository hygiene, runs lint and TypeScript validation, measures unit/component coverage, creates a production build, builds and tests the .NET integration, and executes Playwright smoke tests. A protected Supabase integration job runs authenticated customer, tradesperson, and administrator journeys on `main` when CI secrets are configured.

### Known limitations

- The public deployment is a product foundation, not an operating marketplace with live Ankara supply.
- Six high-priority services have specialized question trees; the remaining services use a validated generic flow.
- Matching weights require calibration with real supply, completion, and cancellation data.
- The ASP.NET Core email worker is implemented and tested but requires separately deployed infrastructure plus Supabase and Resend server secrets.
- Payment collection and calendar synchronization are intentionally not claimed as current capabilities.

### Next development steps

1. Deploy the notification worker and validate provider delivery in a staging environment.
2. Complete specialized question trees for the remaining service backlog.
3. Add production observability for RPC latency, notification retries, and funnel exits.
4. Calibrate matching with Ankara pilot data and explicit fairness checks.
5. Complete release-grade cross-browser and real-device validation.

## Other projects

| Project | Description | Stack |
| --- | --- | --- |
| [The Welding Expert App](./the-welding-expert-app/) | Appointment, availability, gallery, and administrator workflows for a local welding service. | React, Vite, Supabase, React Query, Styled Components |
| [The Wild Oasis](./the-wild-oasis/) | Hotel and cabin operations with bookings, dashboards, and administrative workflows. | React, Supabase, React Query, Styled Components |

## AI-Assisted Development

OpenAI Codex was used for requirements analysis, implementation alternatives, test-case discovery, debugging, and documentation. Suggestions were reviewed against domain rules, type safety, automated tests, security requirements, and the repository's architecture decisions. Final architecture, source code, and product decisions remain under human review and ownership.

## Repository hygiene

- Real environment files, provider keys, service-role credentials, build output, coverage, and local deployment state are ignored.
- Only `.env.example` templates are versioned.
- CI runs a tracked-file and high-confidence secret check before application tests.
- The private psychology project is maintained in a separate repository and excluded from this public portfolio.

## Local setup

```bash
cd ankara-usta-app
npm ci
npm run dev
```

Use [the project README](./ankara-usta-app/README.md) for environment configuration, Supabase migrations, testing, and the optional ASP.NET Core notification worker.

## Contact

- [GitHub](https://github.com/abdullahberkeozder)
- [LinkedIn](https://www.linkedin.com/in/abdullah-ozder/)
- Email: abdullahberkeozder@gmail.com
