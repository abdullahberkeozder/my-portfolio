# ADR-0001: Use a Modular Monolith for the Ankara Pilot

- Status: Accepted
- Date: 26 August 2026
- Owners: Product and Engineering

## Context

Orkestra must support a public catalog, guided customer requests, tradesperson onboarding, matching, quotes, job tracking, trust evidence, and moderation. The pilot is limited to Ankara and will initially be maintained by a small development team. Premature service separation would add deployment, consistency, tracing, and operational overhead before the domain boundaries are stable.

## Decision

Use one deployable Vinext/Next.js application organized as a modular monolith. Domain modules will expose application use cases and will not import UI components or infrastructure bindings directly.

Initial bounded contexts:

- catalog
- request intake
- identity and tradesperson supply
- matching and quotes
- job execution
- trust and moderation
- platform operations

External systems are accessed through narrow adapters. Domain state changes are validated server-side. Cross-module writes use explicit application services and audit events rather than direct table access from UI code.

## Consequences

- One deployment and one transactional data boundary keep the Ankara pilot understandable.
- Domain boundaries remain extractable if later scale requires separate services.
- Module ownership and dependency direction must be enforced through code review and architecture tests.
- Long-running or retryable work will use queued/outbox-style jobs when that capability is introduced.

## Validation

- No domain module imports from `app/components`.
- Route handlers call application use cases rather than database bindings directly.
- State transitions and authorization decisions have isolated tests.
