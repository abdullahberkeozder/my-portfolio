# Account registration feedback

## Decision

Supabase Auth remains responsible for account uniqueness. Do not create a parallel email registry, query `auth.users` from a public endpoint, expose an `emailExists` result, or infer account existence from obfuscated signup identities.

The client explicitly handles `user_already_exists` and `email_exists`. Both use the same neutral next-step message and recovery controls as a confirmation-required signup. An unauthenticated visitor is not told whether a third party has an account. This intentionally does not implement an availability check while typing.

## Changes

- Remove the unconditional claim that a verification email was delivered.
- Offer existing-account login and password recovery directly after registration; keep the entered email, audience and wizard return destination.
- Clear the registration password before switching to login. Disable repeat registration until the user changes email or mode.
- Preserve provider-side uniqueness and rate limits; guard concurrent client submissions and disable inputs while a request is pending.
- Keep password recovery responses conditional and validate email before requesting recovery.
- Editing the email clears obsolete feedback. No email is sent on typing or blur.

## Verification and limitations

Ten mocked component tests passed, including duplicate error codes, obfuscated signup responses, recovery, navigation and no lookup on typing. Type-check and production build passed. No remote Auth settings, email templates, users or database schema were changed. These tests do not establish actual email delivery or uniqueness behavior for the deployed provider configuration; those require controlled real-account verification.

This is safe duplicate-response handling and recovery UX, not a new server-side pre-registration lookup. Existing provider endpoint responses remain subject to the project's Auth configuration; the UI alone does not guarantee resistance to all account enumeration.

Reference: [Supabase signUp documentation](https://supabase.com/docs/reference/javascript/auth-signup).
