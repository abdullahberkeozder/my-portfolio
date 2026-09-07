# Abdullah Özder | Software Engineering Portfolio

I build web applications and backend services, with a focus on how they behave beyond the happy path: failed requests, conflicting updates, permissions, and recovery.

This repository brings together marketplace and appointment products, a small C# resilience library, and a hotel operations application. Each project has its own setup and documentation.

## Start here

| Project | What to explore | Main technologies |
| --- | --- | --- |
| [Orkestra](./ankara-usta-app/README.md) | Service discovery, request-to-quote journeys, database-enforced transitions, and a transactional email worker | TypeScript, Next.js, React, PostgreSQL, Supabase, C#/ASP.NET Core |
| [Resilience Kit](./resilience-kit/README.md) | Retry policies, backoff, circuit breaking, and the trade-offs of composing them | C#, .NET 10, xUnit |
| [DevTool CLI](./devtool-cli/README.md) | Environment validation, SDK selection diagnostics, and JSON reports for CI | C#, .NET 10, System.Text.Json, xUnit |
| [Umut Usta](./the-welding-expert-app/README.md) | Customer booking, private tracking, team scheduling, and operational analytics | JavaScript, React, TanStack Query, Supabase, Styled Components |
| [The Wild Oasis](./the-wild-oasis/README.md) | Hotel bookings, cabins, guests, and administrative screens | JavaScript, React, TanStack Query, Supabase, React Hook Form |

For backend and reliability work, start with the [notification worker](./ankara-usta-app/services/AnkaraUsta.NotificationWorker/README.md), [Resilience Kit](./resilience-kit/README.md), and [DevTool CLI](./devtool-cli/README.md).
For product flows and interfaces, start with [Orkestra](./ankara-usta-app/README.md) or [Umut Usta](./the-welding-expert-app/README.md).

## Orkestra | Local services marketplace

Orkestra is an Ankara-focused marketplace foundation in active development. Customers describe a problem, select a service, create a request, and compare quotes. Tradespeople manage applications and jobs, while administrators review evidence and moderation cases.

The catalog contains six categories and 26 services, with service-specific question definitions. The request flow supports conditional questions, district and neighborhood selection, private media, draft recovery, and an editable review before submission.

### Engineering work

- Request and job state machines separate domain rules from the interface.
- PostgreSQL functions handle concurrency-sensitive operations such as quote acceptance and job creation.
- Authentication, row-level policies, and private storage define access for customers, tradespeople, and administrators.
- Versioned quotes, scope changes, messaging, and audit events make the job history inspectable.
- A separate ASP.NET Core worker processes a transactional notification outbox and integrates with Resend. Delivery retries and dead-letter state are recorded separately from the business operation.

The email worker has its own deployment and configuration requirements. This repository represents an implemented product foundation; it does not establish live marketplace supply, production traffic, or completed payment integration.

### Design and validation

The customer experience uses a question-first flow, responsive layouts, and a cobalt/yellow visual identity. Domain and component tests cover rules and interactions; Playwright suites exercise browser journeys. Written decisions explain the backend boundaries and delivery model.

[Source](./ankara-usta-app/app/) |
[Tests](./ankara-usta-app/tests/) |
[Architecture decisions](./ankara-usta-app/docs/adr/) |
[Requirements traceability](./ankara-usta-app/docs/engineering/REQUIREMENTS-TRACEABILITY.md) |
[Notification worker](./ankara-usta-app/services/AnkaraUsta.NotificationWorker/)

## Resilience Kit | Retry and circuit breaker

A small .NET 10 library built to understand how retry policies and circuit breakers interact. It supports configurable exception filters, constant and exponential backoff, jitter, cancellation, and policy composition.

The interesting part is the behavior at the boundaries: how each retry contributes to the failure threshold, how an open circuit affects the retry loop, and what recovery means when requests overlap. The README explains these choices and the remaining concurrency and configuration-validation limitations.

The xUnit suite covers retry outcomes, cancellation, callbacks, circuit transitions, and composition. Some recovery tests use real-time waits. This is a separate learning project and is not currently integrated into Orkestra's notification worker.

[Usage and design notes](./resilience-kit/README.md) |
[Source](./resilience-kit/src/ResilienceKit/) |
[Tests](./resilience-kit/tests/ResilienceKit.Tests/)

## DevTool CLI | Configuration validation and project info

A .NET 10 command-line tool for checking environment configuration and inspecting project SDK requirements. It uses a small argument parser and System.Text.Json, with no third-party runtime dependencies. Text and JSON reports include meaningful exit codes for local use and CI.

The `check` command validates required variables and supported formats without printing their values. Typed schema deserialization rejects unsupported fields; it does not validate credentials against external services.

The `info` command reports the SDK selected by dotnet in the project directory, including global.json resolution. Its target-framework comparison is a preliminary major-version check, not a guarantee that restore or build will succeed.

[Usage and source](./devtool-cli/README.md) |
[Tests](./devtool-cli/tests/DevTool.Tests/)

## Umut Usta | Appointment and service operations

Umut Usta connects customer appointment requests with a protected workspace for a local welding and maintenance business. Customers choose a service and time, submit contact details, and use a private link for tracking and self-service changes.

The project includes availability management, role-based team access, a work gallery, and operational dashboards. Database-backed slot locking handles scheduling conflicts, while analytics capture booking and self-service activity.

The interface work includes a three-step booking flow, mobile layouts, keyboard interaction, and explicit loading, validation, and submission states. Vitest, Testing Library, and Playwright support the critical journeys.

[Project documentation and screenshots](./the-welding-expert-app/README.md) |
[Source](./the-welding-expert-app/src/) |
[Browser tests](./the-welding-expert-app/e2e/)

## The Wild Oasis | Hotel operations

A React application for managing bookings, cabins, guests, and hotel settings. It brings together protected routes, server-state management, forms, and reusable administrative interfaces.

[Project documentation](./the-wild-oasis/README.md) |
[Source](./the-wild-oasis/src/)

## Development and delivery

These are independent projects rather than a single application. Dependencies, environment variables, and commands belong to each project directory.

| Project | Getting started |
| --- | --- |
| Orkestra | Node.js 22.13+; see its README for environment setup, then run `npm ci` and `npm run dev` in `ankara-usta-app`. The worker requires .NET 10. |
| Resilience Kit | Install the .NET 10 SDK, then run `dotnet test resilience-kit/ResilienceKit.slnx` from the repository root. |
| DevTool CLI | Install the .NET 10 SDK, then run `dotnet test devtool-cli/DevTool.slnx`. You can pack it via `dotnet pack devtool-cli/src/DevTool/DevTool.csproj --configuration Release`. |
| Umut Usta | Configure the project environment, then run `npm ci` and `npm run dev` in `the-welding-expert-app`. |
| The Wild Oasis | Follow its README for database and environment setup, then run `npm ci` and `npm run dev` in `the-wild-oasis`. |

The [Orkestra CI workflow](./.github/workflows/ankara-usta-ci.yml) runs repository checks, lint, TypeScript validation, unit/component coverage, a production build, .NET worker checks, and browser tests. Its authenticated integration job requires configured credentials; a skipped job is not evidence that those scenarios passed.

Umut Usta has a [separate workflow](./.github/workflows/welding-app-ci.yml). The [.NET tools workflow](./.github/workflows/dotnet-tools-ci.yml) builds and tests Resilience Kit and DevTool CLI on Windows and Linux, then packs and locally installs DevTool for a command smoke check. Test boundaries are documented in each project README.

## How I work

I use AI coding tools to explore implementation options, inspect unfamiliar code, draft tests, and investigate failures. I review the output against the intended behavior and use type checks, tests, and written decisions to evaluate changes. The project documentation records limitations as well as implemented features.

This public repository contains selected work. Private client projects, including the psychology platform, are not included here. Follow each project's environment template; private credentials and deployment secrets do not belong in commits.

## Contact

- [GitHub](https://github.com/abdullahberkeozder)
- [LinkedIn](https://www.linkedin.com/in/abdullah-ozder/)
- Email: abdullahberkeozder@gmail.com

