# ADR-0007: Order Job Events and Decouple Notifications

- Status: Accepted
- Date: 27 August 2026
- Owners: Product and Engineering

## Context

Messages, appointments, scope decisions, and status changes may arrive concurrently. Client timestamps cannot establish an authoritative order. External notification providers are slower and less reliable than the primary database and must not determine whether a business operation commits.

## Decision

- Serialize each job's event sequence through its database row.
- Append immutable events for all user-visible workflow mutations.
- Keep message bodies, exact addresses, and scope records in participant-protected tables while timeline payloads remain minimal.
- Enforce role-aware state transitions inside one database operation.
- Require both participants to approve scope changes.
- Store notification work in a transactional outbox and deliver it after commit.
- Use `SKIP LOCKED`, bounded exponential retry, worker-lease recovery, and a terminal dead state.

## Consequences

- Timeline order is authoritative and auditable.
- Notification delivery can lag without corrupting job state.
- A delivery worker and channel providers remain deployment concerns, not domain transaction dependencies.
- Database concurrency and cross-participant RLS tests are required before production.

## Validation

- Unit tests cover actor-specific state transitions, payload validation, and retry intervals.
- Integration tests must run simultaneous messages, denied transitions, bilateral scope approval, address access before/after selection, and worker failure recovery.
