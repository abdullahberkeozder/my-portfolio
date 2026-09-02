# Request contract and staging verification

The canonical question source is `app/data/wizardDefinitions.ts` (26 services).
UI and API use the same visible-question traversal. Unknown, hidden and invalid answers are rejected by the API and SQL. Drafts may omit visible answers; submitted requests may not.

SQL is an immutable snapshot generated into a new CLI-created migration:

```sh
node node_modules/supabase/dist/supabase.js migration new unified_request_contract
node scripts/generate-request-contract.mjs supabase/migrations/<new-file>.sql
```

Never rewrite an applied migration. Update the contract parity test to point at the new snapshot. Existing completed records are not rewritten; incompatible old drafts require re-answering the changed questions. This initial snapshot does not provide historical question-version replay.

Timing uses `urgent`, `this_week`, `next_two_weeks`, `flexible`. Legacy labels are accepted at the boundary. Unknown timing is rejected, not silently expanded to 30 days. SQL normalizes new writes; existing rows remain readable by the matching compatibility function.

## Verification status

The unit suite checks every visible answer branch for all 26 services and exact parity with the generated SQL payload. It does not execute PostgreSQL. Apply and validate the migration in staging before production; do not interpret source parity as an RLS test.

`scripts/test-marketplace-journey.mjs` performs a real two-account RPC journey without mocks. It is NOT a browser or Realtime delivery test. It requires a disposable staging database with migrations applied and a customer plus an approved, currently verified provider offering TV mounting in Çankaya with current-week availability.

Required environment variables: `E2E_SUPABASE_URL`, `E2E_SUPABASE_KEY` (publishable key), `E2E_CUSTOMER_EMAIL`, `E2E_CUSTOMER_PASSWORD`, `E2E_TRADESPERSON_EMAIL`, `E2E_TRADESPERSON_PASSWORD`, and `E2E_ALLOW_STAGING_WRITES=true`.

Also set `E2E_STAGING_PROJECT_REF` to the separate staging project reference. The runner rejects the production reference `qzrktfyouloqxjbkhjce`, mismatched endpoints and missing explicit write opt-in before authentication. Store credentials only in an ignored local environment file or CI secrets, never in this document.

Run `node scripts/test-marketplace-journey.mjs`. Missing configuration fails instead of reporting a skipped test as a pass. This test creates persistent test requests/jobs/reviews and may enqueue notifications. Disable external delivery on staging. Audit records are not deleted; reset the disposable database after inspection. Never point it at production or reuse real users.

### Remote verification — 2026-09-02

With explicit user approval, migration `20260902102337_unified_request_contract.sql` was applied through the authenticated Supabase Dashboard to `qzrktfyouloqxjbkhjce` (Production). The connector's permission error was not used as evidence of Dashboard access; Dashboard access was verified separately.

- First executed the migration with SQL assertions inside a transaction ending in `ROLLBACK`.
- PostgreSQL accepted all 988 visible answer combinations across 26 services. For each service, unknown keys and incomplete submissions were rejected.
- Timing assertions covered canonical values and the legacy `Bu hafta içinde` label. Anonymous execution of the contract helper was denied.
- Applied the same migration and assertions in one transaction, registering version, name and original SQL in `supabase_migrations.schema_migrations` before commit.
- A subsequent query independently confirmed 26 services, a seven-day horizon for both week formats, one normalization trigger, the updated matching implementation, and no anonymous execute privilege for the contract helper.
- Local checks: 28 test files / 132 tests passed; TypeScript passed.
- Security Advisor rerun: no errors, eight warnings. Seven concern authenticated execution of existing public dispute SECURITY DEFINER functions (`add_dispute_internal_note`, `add_dispute_statement`, `admin_transition_dispute`, `apply_tradesperson_sanction`, `get_dispute_decisions`, `open_job_dispute`, `submit_dispute_appeal`); the eighth is disabled leaked-password protection. These were not changed by this migration and need a separate authorization review, not blind revocation of required RPC access.

These SQL assertions ran as the Dashboard database role, not as customer/provider JWT sessions. They do not prove RLS, browser behavior, concurrent requests, or Realtime delivery. No customer rows were rewritten and no test jobs or reviews were created. The two-account journey stopped before authentication because all six required connection/account environment variables were absent. A disposable staging environment and dedicated test accounts are still required for that journey. Production had no backup shown in Dashboard; the rollback rehearsal was not a backup.

### Dispute boundary follow-up — 2026-09-02

Applied `20260902192847_harden_dispute_rpc_boundaries` after a rollback rehearsal. Existing seven public definer implementations were copied into the private schema; public RPC signatures and OIDs were preserved as invoker wrappers. Existing actor, participant and operator checks remain in the private implementations. This is exposure hardening, not evidence that all business authorization paths are correct.

`supabase/tests/remote/dispute_rpc_boundaries.sql` passed against PostgreSQL: seven public invoker wrappers exist, anonymous execution is denied, and all seven calls without an Auth identity fail with expected authorization messages. These are database-role tests, not two real authenticated accounts. No test customer records were created.

Security Advisor was rerun: **0 errors, 1 warning**, down from eight warnings. Remaining: leaked password protection disabled. Supabase documents this feature as Pro plan or above; the current organization is Free. No subscription changes were made. Source: https://supabase.com/docs/guides/auth/password-security

Next: provision a separate staging project (without copying production customer data), apply migrations, create dedicated customer/provider accounts, configure provider service/area/availability and verification fixtures, and disable external notification delivery. Then run the RPC journey; browser and Realtime suites remain distinct follow-up checks. Docker was not found on PATH during this session, so no local Supabase alternative was started.
