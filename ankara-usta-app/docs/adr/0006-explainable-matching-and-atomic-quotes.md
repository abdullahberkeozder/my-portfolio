# ADR-0006: Explain Matching and Accept Quotes Atomically

- Status: Accepted
- Date: 27 August 2026
- Owners: Product and Engineering

## Context

Customers need to understand why a tradesperson was selected, while providers must receive only relevant requests. Quote revisions must preserve commercial history, and concurrent customer actions must never select two providers for one request.

## Decision

- Treat service, district, availability, and verification as mandatory filters.
- Persist score components and explanation strings with each matching snapshot.
- Express supply shortages as explicit domain states rather than returning an empty list without guidance.
- Create new immutable quote versions instead of updating submitted commercial fields.
- Remove direct quote insert/update privileges from authenticated clients and expose narrowly scoped, identity-checking database functions.
- Serialize acceptance on the request row and enforce one accepted quote with a partial unique index.
- Keep locking transactions short and perform no network operation while a row lock is held.

## Consequences

- Matching can be audited and recalculated from known inputs.
- Weight changes require a versioned product decision and evaluation against real marketplace outcomes.
- Quote history consumes additional rows but preserves the agreed scope and price.
- Database concurrency tests are required before production release.

## Validation

- Unit tests cover scoring, mandatory rejection, deterministic ordering, shortage boundaries, version numbers, and comparison limits.
- Integration tests attempt direct quote mutation, ineligible quote creation, stale-version acceptance, and concurrent acceptance.
