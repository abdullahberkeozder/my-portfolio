# H1–H2: session-aware navigation and profile editing

Status: **Implemented → Locally verified** (2026-09-03). Multi-account verification and release remain pending. No implementation commit has been created.

## H1

- `/api/account/summary` validates the current Supabase user, reads the display name from `user_profiles` and roles from `user_roles`, and returns a minimal non-cacheable navigation summary. It does not return email, addresses, metadata roles or credentials.
- Navbar links now reflect authenticated roles. Public discovery stays reachable. The existing focus-trapped menu drawer provides account links on desktop and mobile, rather than adding a second modal system.
- Anonymous, loading and lookup-error states are distinct. An upstream failure does not imply successful logout.
- Auth events, successful account mutations, cross-tab BroadcastChannel signals, route changes and window focus trigger summary refreshes. Events carry no personal data. Aborted/stale responses cannot overwrite a newer account summary.
- Local logout explicitly checks the provider result, rejects cross-origin requests and emits generic errors. The client redirects and broadcasts only after confirmed success. Existing draft storage is not broadly cleared or reassigned.
- Navigation is presentation only; existing server authorization, professional approval and quoting checks remain authoritative.

## H2

- `/hesap` has personal-information, region and session/privacy anchors. A role-checked workspace hint preserves professional/operations return destinations; it does not grant a role.
- The display-name form saves only `user_profiles.display_name` and its update timestamp through a same-origin, identity-bound endpoint. It uses the existing owner UPDATE/SELECT policies; there is no second metadata profile or new migration.
- Payloads are strict, names are trimmed and limited to 2–120 characters, and returned-row verification prevents false success for missing profiles.
- Failed edits remain in the form. Cancel restores the last acknowledged value. Reload/close and link navigation warn about unsaved edits. A detected account switch hides the prior profile form.
- Success triggers navbar refresh, including cross-tab notification. Verified professional identity/document data are not changed.
- Full address-book, email-change and password-change workflows remain outside H1/H2; existing city preference and recovery flow are preserved.

## Evidence

- 41 focused tests passed across account API, account components, summary lifecycle, existing AuthForm, navigation and map-page integration tests.
- Type-check, lint and production build passed. The unchanged UI debt gate passed (6108 CSS lines, 359 important rules, 58 media queries, 71 inline styles in its measured scope).
- Anonymous HTTP request to local `/api/account/summary` returned 200, `Cache-Control: no-store`, and `{ "user": null }`.
- No real account profile was edited and no real session was terminated by the agent. No migration, deployment, commit or push was performed.

## Release checks still required

1. Customer, professional and operations accounts: login, home, account menu, return path and logout.
2. Real name update: persistence after re-login and consistent navbar update in two tabs.
3. Owner versus another-account update attempts against the deployed RLS configuration.
4. Account switch during pending requests and logout while another tab is open, including SDK/cookie synchronization.
5. 320/390 px, tablet/desktop, long names, keyboard focus and 200% zoom. Component tests are not real-device visual evidence.
6. Refresh-token/access-token expiry behavior: local logout is not a claim of immediate revocation of every previously issued access token.

## References

- [Supabase auth events](https://supabase.com/docs/reference/javascript/auth-onauthstatechange)
- [Supabase logout scopes](https://supabase.com/docs/reference/javascript/auth-signout)
