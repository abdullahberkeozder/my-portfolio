# E2E server lifecycle, 2026-09-06

## Observed failure

With `DEBUG=pw:webserver,pw:browser`, all four wizard assertions passed, Chromium exited with code 0, then execution stopped at `Terminating the WebServer`. Installed Playwright's Windows process launcher uses synchronous `taskkill /pid ... /T /F` via a shell. This identifies the stalled teardown path, not why Windows taskkill failed to complete. No claim of a browser or Supabase failure is made.

## Fix

`playwright.config.ts` uses `scripts/playwright-server.ts` as global setup and its returned teardown. It launches the existing Vinext production CLI with the current Node executable, without a shell. Cleanup terminates only that child PID, waits at most five seconds and checks port 4187 was released. Startup still has a 120-second readiness limit. An occupied port fails setup without adopting or terminating another process. Tests and their exit codes are unchanged. This relies on the current Vinext start implementation running the server in one process; revisit if the server command later spawns workers.

## Local evidence

- Four wizard tests at 320/390/820/1440 passed; command completed automatically with exit 0 and port-release log (7.3 seconds reported by Playwright).
- Temporary intentionally failing browser test completed automatically with exit 1 and the same port-release log. The temporary probe was removed after the check; normal tests are not weakened or marked expected-failure.
- TypeScript passed.
- This is Windows local evidence, not a completed Linux CI or full regression run.

Run normally from the app directory: `npm run test:e2e -- tests/e2e/wizard-redesign.spec.ts --project=chromium --workers=1`. Build first when source changed. No database or environment credentials need changes.
