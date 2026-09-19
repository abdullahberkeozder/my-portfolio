# U3 isolated personas

Target: `orkestra-e2e` (`hyuijuafuayzultbjvjb`). Production connection and linked project are unchanged.

On 2026-09-06, the user approved preparing test credentials and example professional profiles. On 2026-09-19 the same isolated fixture set was extended with a second customer for account-switch isolation. Five dedicated `u3-` accounts now exist: two customers, one administrator and two professionals. Existing unrelated personas were not modified. Credentials are generated randomly and retained only in Git-ignored `.env.e2e.local`; service-role keys are obtained in memory through the CLI and not persisted or logged.

Run `node scripts/prepare-u3-personas.mjs --apply` only when deliberately provisioning this named environment. It refuses any other project and unrelated configured account email. It reuses the repository's existing persona provisioner. Reruns retain the generated passwords, but reapply account/profile fixtures. The test admin and customer are shared by the two profile fixtures.

Profiles:
- `TEST PROFİLİ · Montaj Ustası`: TV mounting, Çankaya/Ayrancı.
- `TEST PROFİLİ · Uzun İsimli Tesisat ve Ev Bakım Hizmetleri Ustası`: additionally faucet replacement and Sincan/Törekent; inherits baseline TV mounting and Çankaya coverage from the existing provisioner.

These are synthetic test records, not real providers. The existing provisioner inserts synthetic verification metadata, not an actual uploaded certificate. Document download/upload testing remains separate. No reviews, fake customer ratings or live-location pins were created.

Verification: provisioning authenticated both professional accounts. Independent `check-e2e-connection.mjs` authenticated and signed out both customers, the primary professional and the admin. The final browser package passed 6/6, including directed-request auth return, one submission and same-browser A → B → A draft isolation. Feature flags were enabled only inside the staging runner process and were not changed in normal local or production configuration.
