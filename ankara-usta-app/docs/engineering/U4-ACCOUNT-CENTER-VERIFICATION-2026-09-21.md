# U4 Account Center Verification

Date: 2026-09-21

Status: Implemented, locally verified and multi-account verified in `orkestra-e2e`. Not released.

## Scope

- Authenticated return to `/hesap` with the requested workspace query retained.
- Display-name edit with immediate account-menu refresh.
- Ankara city preference save and refreshed map summary.
- Current-browser sign-out with no false success on provider failure.
- Customer A to customer B switch in one browser.
- Local and remote draft ownership isolation.

## Product boundary

The account center stores only the service city. It does not become an address book. District and neighborhood belong to a request; the full address belongs to the restricted request or job location record and must not be exposed in the public account summary or navbar.

## Before, after and reason

| Before | After | Why |
| --- | --- | --- |
| A valid `/hesap?workspace=…` return was rejected after sign-in and fell back to the role landing page | `/hesap` is an allowed return only when the verified database role list is non-empty; the query string is retained | Restores the user's explicit task without making the account route public |
| Profile, city, navbar and sign-out behavior had separate unit/component evidence | One real-browser scenario changes and restores the name, saves Ankara, observes the new navbar identity, signs out and switches accounts | Proves the composed behavior rather than isolated handlers |
| Draft ownership was locally tested and had an earlier staging scenario | The customer A to customer B browser scenario was rerun in the same U4 gate | Prevents stale proof from being treated as current evidence |

## Verification evidence

- `51/51` targeted unit and component tests passed.
- Targeted ESLint passed.
- TypeScript `--noEmit` passed.
- U4 Playwright package: `2/2` passed.
- Staging build passed before the browser run.
- Normal local build was restored after test credentials were removed.
- The original display name and Auth metadata were restored in `finally` with the staging service role.

Command:

```powershell
$env:E2E_ALLOW_STAGING_WRITES='true'
node scripts/run-u4-browser.mjs
```

## Known limit

Vinext still logs `ERR_STREAM_UNABLE_TO_PIPE` when Playwright navigation closes an in-flight response. Both browser scenarios and controlled server shutdown completed successfully. The log remains visible and is not classified as fixed by this slice.
