# ADR-0002: Separate Identity Authentication from Marketplace Authorization

- Status: Superseded in part by ADR-0004 — Supabase Auth selected for Phase 2
- Date: 26 August 2026
- Owners: Product, Engineering, and Operations

## Context

The final marketplace must support public customers, public tradespeople, and restricted operator roles. ChatGPT sign-in can support a closed workspace beta, but it is not by itself the product identity strategy for a public Ankara marketplace. Authorization also depends on marketplace data such as role, application status, ownership, assignment, and job state.

## Decision

- Keep the public catalog anonymous.
- Require authenticated identity for saved drafts, submissions, quotes, messages, job actions, reviews, and administration.
- Resolve identity through a server-side authentication adapter.
- Store marketplace roles and permissions in the application database; never trust a role supplied by the browser.
- Treat customer, tradesperson, moderator, and administrator authorization as explicit server-side policies.
- Use Supabase Auth for the Phase 2 customer email/password flow. Phone delivery, recovery, abuse controls, and provider portability remain launch-readiness checks.
- ChatGPT/SIWC identity may be used only for a deliberately closed beta or internal operator surface unless the product scope changes.

## Consequences

- The domain remains independent of one identity vendor.
- Public launch is blocked until the provider spike and privacy review are complete.
- Every protected resource needs negative authorization tests, not only authenticated happy-path tests.

## Validation

- API and server actions reject missing identity.
- Ownership and role checks run on the server.
- Cross-role and cross-record access attempts are included in the authorization test matrix.
