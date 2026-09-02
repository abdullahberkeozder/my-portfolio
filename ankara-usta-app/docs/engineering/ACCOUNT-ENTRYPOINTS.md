# Customer and professional account entry points

Date: 2026-09-03. Local implementation; database migration and real-account verification pending.

Local evidence: 38 test files / 192 tests passed (`npm run test`), plus type-check, lint and production build. AuthForm tests use mocked Auth/role responses; they do not verify live signup, email delivery or SQL execution.

Visual follow-up: fixed selected-state styling previously missing because CSS expected `.active` rather than `aria-current`/`aria-pressed`. Scoped CSS now differentiates audience and sign-in/signup controls, includes hover/focus and reduced-motion states, and uses 48px selection targets. In-app browser inspection confirmed desktop professional signup and 320px layout without horizontal overflow. Customer-to-professional navigation and signup switching were exercised without submitting credentials. Five AuthForm tests and the production build passed after this styling change. Real Auth/RLS verification remains pending.

- `/giris` and `/kayit`: customer sign-in and registration.
- `/usta/giris` and `/usta/kayit`: professional sign-in and registration.
- All four share `AuthForm`; account-type navigation retains the sanitized wizard return URL. Email confirmation retains it too. Login never submits a request automatically.
- One Supabase Auth identity can be a customer and a professional. Existing customers use professional login and continue to the existing application rather than registering a duplicate identity.
- Default customer destination is Taleplerim. Professional login checks only the signed-in user's database roles and routes to opportunities if a professional role exists, otherwise to the application. The existing professional role is an account capability, NOT approval: application status, document validity and eligibility still govern quotes.
- Signup collects a display name, email and password; sends only an onboarding intent in metadata. No role or approval is accepted from the form. Password storage remains exclusively with Supabase Auth.

## Existing SQL structures reused

`auth.users` owns authentication, `public.user_profiles` owns account display information, `public.user_roles` owns authorization, and `public.tradesperson_profiles` plus its service/area/document tables own professional onboarding. These structures already exist; duplicate customer/worker credentials tables would break identity consistency.

`20260902205806_account_registration_intents.sql` creates a participant-private registration-intent table and insert trigger. It does not replace existing account provisioning, change roles or create an incomplete professional profile. Clients have SELECT on their own intent and no write grant. User-editable metadata is stored as an onboarding preference, never used for authorization. Historical intentions are not guessed or backfilled.

## Release gates

The migration is authored only, not executed remotely. Before release, apply in the approved isolated database; verify customer/professional signup, existing email behavior, confirmation enabled/disabled, email delivery, callback allowlist, role spoofing, anonymous access, cross-account intent reads, application eligibility and existing account regression. Verify mobile/keyboard UI and real same-tab draft return. SQL advisors and rollback review remain deferred with the other release gates.

Rollback should disable new registration entry points if needed while preserving Auth users/profiles. The new intent table is additive; do not delete customer identities to undo onboarding. No commit, push or production release performed in this slice.
