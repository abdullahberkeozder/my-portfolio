# ADR-0003: Use D1 for Pilot Records and R2 for Media

- Status: Accepted for the Ankara pilot; bindings remain disabled until Phase 2
- Date: 26 August 2026
- Owners: Engineering

## Context

The marketplace requires durable relational records, ownership checks, workflow state, audit history, and customer-provided photos or videos. Browser storage is not authoritative enough for these records. Media bytes should not be stored in the relational database.

## Decision

- Use D1 for structured pilot data and R2 for uploaded media.
- Keep D1 and R2 bindings `null` until the first persistent vertical slice is implemented.
- Store media bytes in R2 and searchable ownership, content type, size, status, and permission metadata in D1.
- Place schema definitions under `db/schema.ts` and commit generated migrations.
- Access D1 and R2 through small repository adapters rather than throughout route handlers.
- Use prepared statements and explicit indexes derived from measured query patterns.
- Record immutable audit events for privileged and workflow-changing operations.
- Preserve repository interfaces so migration to PostgreSQL/object storage remains possible if pilot scale or realtime requirements justify it.

## Consequences

- The pilot stays aligned with the existing Sites deployment.
- Messaging initially uses bounded polling; realtime infrastructure is a later measured decision.
- Media lifecycle, deletion, retention, and publication consent must be implemented explicitly.

## Validation

- Migration tests run against an empty database and an upgraded fixture database.
- Ownership checks are exercised through integration tests.
- Upload tests cover allowed types, size limits, metadata, authorization, and denied public access.
- Representative queries are inspected with `EXPLAIN QUERY PLAN` before pilot launch.
