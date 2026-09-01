# ADR-0005: Derive Tradesperson Eligibility from Reviewed Evidence

- Status: Accepted
- Date: 26 August 2026
- Owners: Product, Engineering, and Operations

## Context

The marketplace must prevent unapproved or insufficiently verified tradespeople from quoting. A single mutable `verified` flag would hide which evidence was checked, when it expires, and who made the decision. Privileged review actions also need a durable operational trail.

## Decision

- Model the tradesperson application as an explicit, database-enforced state machine.
- Store roles in relational tables and evaluate them through RLS; never authorize from client-editable identity metadata.
- Store services, Ankara service areas, references, and private evidence as separate owned records.
- Review each document with its own status, reviewer, reason, timestamps, and optional expiry.
- Derive the public professional-verification badge from a verified, unexpired professional certificate.
- Require both an approved application and current professional verification in the database quote-insert policy.
- Record administrator changes to applications, documents, and references with database audit triggers.
- Keep verification media in a private bucket with owner-folder and operator-read policies.
- Run a daily database job that expires dated evidence, requests reassessment, and records system audit events.

## Consequences

- Application approval and evidence verification remain distinct facts.
- Expired evidence automatically removes badge and quote eligibility without waiting for a UI update.
- The first administrator must be bootstrapped from a known Auth UUID through a controlled SQL operation.
- A scheduled reassessment process and authenticated cross-role integration suite are required before production launch.

## Validation

- Pure domain tests reject invalid application transitions and invalid service/area selections.
- Database constraints and RLS reject quotes from ineligible providers.
- Directory queries expose only derived verification state.
- Administrator mutations create immutable audit events with the authenticated actor.
- Private evidence cannot be read by another tradesperson.
