# Vinext stream experiment — 2026-09-07

## Repeat verification

Two further independent runs after removing the INITIAL_SESSION duplicate:
1 passed in 6.4s and 1 passed in 5.9s. Neither emitted
ERR_STREAM_UNABLE_TO_PIPE. Including the original verification, three consecutive
observed runs are clean for this scenario. Two additional synthetic requests
remain in staging, one per run, with uniqueness assertions passing.

The four account-summary tests and targeted ESLint pass without warnings after
cleaning up the unused mock parameter. This is bounded desktop Chromium evidence,
not a guarantee for all cancellation timing, browsers or network conditions.

## Initial-session duplicate removed

useAccountSummary started a fetch immediately, then restarted/aborted it when
Supabase delivered INITIAL_SESSION for the new subscription. This happened again
when pathname changes recreated the subscription. The initial server-backed
read remains; only INITIAL_SESSION no longer triggers a second reload.
Other auth events, profile notifications, focus refresh, cancellation and
sequence-based stale-response protection remain unchanged.

Four component tests passed, including no initial abort, auth refresh,
stale-response exclusion and cleanup. The real staging U3 scenario passed
(6.7s, runner exit 0), with no ERR_STREAM_UNABLE_TO_PIPE observed in this run.
Build restoration and server teardown succeeded. One synthetic request was
created. This is one clean run, not proof that all disconnect races are fixed.

Supabase skill guided preserving the server as authority while distinguishing
subscription initialization from mutation events. Reference:
https://supabase.com/docs/reference/javascript/auth-onauthstatechange
No dependency patch, production DB change, commit or push.

## Request identified

Temporary instrumentation in the installed Vinext production adapter logged
only method, sanitized pathname, elapsed time and response state. Removed after
the run; no lasting dependency patch or application change.

Observed early closes: GET /api/account/summary at 9, 5, 3 and 4 ms.
Then `sendWebResponse` received GET /api/account/summary with status 200,
`destroyed=true`, `writableEnded=false`, immediately followed by
ERR_STREAM_UNABLE_TO_PIPE. This identifies the response involved, not the
specific browser event that cancelled it (no per-request correlation ID used).

Source: useAccountSummary aborts the preceding request on refresh and on effect
cleanup. Next investigation can distinguish refresh events from unmount; do not
remove cancellation or stale-result protection merely to hide transport logs.

The real staging scenario passed again (1 passed, 12.9s; runner exit 0), one
additional synthetic submitted request created. Server released 4187 and normal
build restored. No production changes, commit or push.

Same isolated U3 Chromium journey and build runner, sequential runs.
Only experimental variable: AuthForm's refresh immediately after push.

| Variant | Browser result | Stream error | Runner |
| --- | --- | --- | --- |
| Existing push + refresh | 1 passed, 6.6s | ERR_STREAM_UNABLE_TO_PIPE | exit 0 |
| Push only | 1 passed, 6.3s | ERR_STREAM_UNABLE_TO_PIPE | exit 0 |

Both verified login, explicit draft claim, preserved answers/target, successful
submission and one row per idempotency key. Two additional synthetic requests
were created in staging. Production data and configuration were not modified.
Both owned servers stopped and released 4187. Logs were not suppressed.

Conclusion: removing refresh does not eliminate the error. This is not proof
that navigation plays no role; one run per variant does not establish causality.
The experimental source change was reverted. No dependency patch or upgrade.

Next bounded diagnostic: correlate request path, response close and pipeline
start timing without logging query strings, cookies, headers or bodies. Separate
prefetch/navigation cancellations from completed API responses. Do not replace
the transport error with blanket log suppression.
