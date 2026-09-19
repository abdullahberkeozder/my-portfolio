# U3 browser auth return — 2026-09-06

## R0 final verification — PASS, 2026-09-19

The canonical staging run passed all six Chromium scenarios in 30.6 seconds.
The selected-professional auth return submitted exactly one row,
and the 320, 390, 820 and 1440 px directory journeys passed filtering, keyboard
entry, profile navigation, wizard target preservation, empty-state recovery and
sample-map disclosure checks. A separate same-browser scenario proved customer
A → customer B → customer A draft isolation: B received a fresh wizard, could
not select A's server draft through RLS, and A resumed the same draft identity.
The runner restored a normal credential-free
production build and released port 4187. `.last-run.json` now records `passed`.

Two real navigation defects were found before the green run. Keyboard activation
of the profile card and the empty-state filter reset did not complete through the
Vinext client router. These task and recovery links now use document navigation.
The failed runs remain described in the R0 evidence instead of being treated as
obsolete without a passing rerun.

Migration `20260919194836_harden_public_verification_projection.sql` was applied
only to `orkestra-e2e` after a one-file dry-run. It removes direct anon and
authenticated execution from the private helper while retaining the intentionally
public, fixed-search-path boolean wrapper. A final browser rerun passed after the
migration. Security advisors report zero errors and three warnings: two expected
warnings for the public boolean definer entry point, plus disabled leaked-password
protection in staging.

Commands, source boundary, SQL privilege evidence and remaining limits are
recorded in `docs/engineering/R0-SOURCE-AND-EVIDENCE-2026-09-19.md`. No production
database/configuration change occurred. The R0 source boundary is committed
separately from unrelated workspace files; no push is part of this pass.

## Latest result — PASS, 2026-09-07

The staging Chromium journey passed (1 test, 6.0s total; runner exit 0).
Actual token response succeeded, the existing explicit guest-to-account draft
claim was selected, summary answers and target professional were retained, and
submission succeeded. A customer-authenticated query confirmed a non-draft row
for the selected professional in Çankaya/Ayrancı and exactly one row for its
idempotency key. One synthetic submitted request remains in staging.

AuthForm now disables controlled fields until hydration completes using
useSyncExternalStore server/client snapshots. Before this fix the email value
was lost before submission. The test also now follows the required draft claim
instead of assuming automatic ownership transfer, compares rendered summary
text consistently, and clears inputs in teardown before failure artifacts.

Type-check, targeted ESLint and 10 AuthForm component tests passed. Build and
normal-build restoration passed; port 4187 released. A Vinext
ERR_STREAM_UNABLE_TO_PIPE log still occurred: the passing scenario does not
claim a clean server log or fix that independent stream-lifecycle issue.

Scope remains one desktop Chromium customer journey, not the entire E2E suite,
concurrent submission tests, mobile coverage or a production release. No new
database changes in this follow-up. No commit/push.

Earlier failure records below are retained as chronological evidence and are
superseded by this result for the tested journey.

## Login-link follow-up

The wizard auth handoff now uses a native anchor instead of a client-router Link.
It still writes the scoped draft and same-tab handoff before leaving and cancels
navigation if persistence fails. The return URL is unchanged.

The real staging Chromium rerun reached the login page and filled the login form;
the previous wait for the email field no longer failed. It subsequently failed
waiting for the summary after clicking login. Successful authentication and draft
return are therefore still **unverified**; the cause of this next failure is not
established. No submission was reached. Normal build restoration completed and
the owned server released port 4187. Type-check and build passed.

This proves the document-navigation fix works for the outgoing link, not the
entire authentication journey or the underlying client-router failure's cause.

Status (2026-09-07): **Profile contract fixed; rerun reaches wizard summary but login navigation is blocked. Not verified end to end.**

## Follow-up implementation — 2026-09-07

- Both profile and directed entry now call `get_public_professional_verification`.
- Migration `20260907010554_public_verification_summary.sql` applied only to staging; its history entry was recorded after application.
- The public invoker wrapper is statically bound with `BEGIN ATOMIC` to a private, fixed-search-path definer function. This intentionally publishes only a boolean for approved profiles with a current professional certificate. No document fields, files, schema usage grants or table permissions were added. The existing internal helper remains uncallable by visitors/customers.
- Read-only `anon` check: synthetic verified profile true, missing UUID false, old helper EXECUTE false.
- Security advisor: no error returned; one warning for disabled leaked-password protection. This does not substitute for a complete authorization fixture suite.
- Type-check passed; staging build and normal-build restoration passed.
- Same Chromium scenario now opened the directed wizard, answered all three questions, chose Çankaya/Ayrancı and reached the summary with the selected professional preserved.
- Clicking the login link did not display the login form; timeout at `getByLabel('E-posta Adresi')`, screenshot still showed wizard summary. The cause of that separate navigation issue has not yet been determined. No request was submitted. Runner exit 1; owned server stopped and port 4187 released.
- Next: diagnose login navigation without bypassing the actual link, then rerun through same draft and one submission. Do not claim auth return success from this run.

Rollback direction: revert the two frontend callers and drop the public wrapper before its private dependency; the earlier unavailable-entry behavior would return. Do not grant access to the old helper. Forward deployment requires applying this migration before the updated callers. Production was not deployed or modified.

Guidance used: Supabase and Supabase Postgres Best Practices skills; [Supabase RLS documentation](https://supabase.com/docs/guides/database/postgres/row-level-security). Permission boundaries were kept separate from UI eligibility.

## Scope

Isolated `orkestra-e2e` (`hyuijuafuayzultbjvjb`) only. Production environment file and database were not changed. The runner temporarily builds against staging and restores the normal local build in `finally`. No commit or push.

## Evidence

- Chromium opened the actual synthetic Montaj Ustası profile from staging.
- Services and Çankaya/Ayrancı area were rendered.
- The page displayed “Bazı profil kanıtları şu anda yüklenemedi.” and did not render “Bu ustadan teklif al”.
- The test timed out waiting for that button. No wizard submission occurred.
- A read-only staging query confirmed `has_function_privilege` for `public.has_current_professional_verification(uuid)` is false for both `anon` and `authenticated`.
- `app/ustalar/[id]/page.tsx` calls that RPC and requires its result to be true to render the directed-request entry.
- Migration `20260827121027_harden_rpc_and_rls_policies.sql` revokes those execute permissions. This is a frontend/database contract mismatch, not evidence that the synthetic professional lacks verification.
- Both staging build and normal-build restoration completed. The overall runner exited 1: this is not a passing E2E result.

## Next bounded fix

Inspect the existing public verification projection and its access contract. Use an intentionally public, minimal verification result for approved professionals; do not re-expose an internal security helper or bypass RLS simply to pass the test. Then rerun the browser journey unchanged in intent.

Still unverified: login return, answer/step/target preservation, successful submission and single database row. The test contains assertions for these stages but did not reach them. Responsive and multi-account authorization checks are separate work.
