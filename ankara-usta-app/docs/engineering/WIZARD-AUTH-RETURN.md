# Wizard authentication return

Implemented locally on 2026-09-02.

- A 401 while saving for submission offers a sign-in/sign-up link carrying a same-origin `next` URL with the service ID only. Answers, location and identifiers are not placed in the URL.
- The wizard persists its step, exact question index, answers, location, timing and idempotency key before leaving. A storage failure prevents navigation and offers separate-tab sign-in instead.
- The home page reopens an unexpired local draft after authentication. A missing/expired draft produces an explicit message. This is same-browser recovery, not cross-device synchronization.
- Registration supplies the return URL through `emailRedirectTo`; callback failures preserve `next` for a retry. Supabase must allow the deployment's callback URL. Email confirmation must be completed in the same browser for local draft recovery.
- Return does not submit automatically. The customer reviews and explicitly submits again. A 401 cannot fall back to a stale remote request ID.
- Selected File objects are not persisted across navigation. The handoff and restored summary explain that media needs re-selection. Account-scoped ownership and explicit transfer/continue/delete choices were subsequently added; see `DRAFT-OWNERSHIP.md`.

Validation: 14 targeted component/unit tests, TypeScript and production build passed. Tests cover summary recovery, stable idempotency, no auto-submit on remount, question position and redirect intent. These use mocked HTTP for the authentication gate; real sign-in/email delivery and two-account E2E have not been executed.
# Final-step membership gate — 2026-09-02

Public discovery and local wizard completion remain available without membership. Guest scope no longer attempts remote draft writes. The summary explicitly asks the visitor to sign in or register instead of showing a publish button; the existing same-tab handoff preserves answers, step, recipient and idempotency key. File objects still require reselection after navigation, disclosed before leaving.

Authenticated members explicitly confirm submission; login never auto-publishes. A 401 during final publication reopens the login-return action and keeps the draft. Existing server-side authentication requirements for draft creation and submission remain unchanged. Real authentication/browser verification remains deferred; this update is locally tested with mocked sessions. No remote migration or release was performed.
