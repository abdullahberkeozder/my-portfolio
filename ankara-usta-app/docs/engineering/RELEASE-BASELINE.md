# Release baseline and provenance

Updated: 4 September 2026

## Current local wizard baseline

| Field | Value |
| --- | --- |
| Branch | `main` |
| Base commit | `b707fd4` (`refactor(wizard): establish focused request baseline`) |
| Product | Orkestra |
| Database project | Not recorded here; environment identifiers and secrets must not be copied into release documentation |
| Migration source | 26 ordered SQL migrations through `20260902213412_quote_revision_requests.sql` |
| Directed requests | Disabled by default |
| Pre-job chat | Disabled by default |
| Quote revisions | Disabled by default |
| Remote migration state | Not asserted by this record |
| Live deployment commit | Not established |

## Baseline verification

| Check | Result |
| --- | --- |
| Repository and style entry checks | Passed |
| UI debt guard | Passed at 6,156 CSS lines, 360 `!important`, 58 media queries and 70 inline styles |
| ESLint and TypeScript | Passed |
| Vitest coverage | 62 files and 380 tests passed; 87.11% branch coverage |
| Production build | Passed |
| .NET worker | Build passed with no warnings; contract tests passed |
| Wizard browser matrix | 24 tests passed across desktop, mobile, tablet and wide Chromium projects |
| Remote Supabase and real personas | Not run; remains a release gate |

## Candidate recording rule

For every deliberate staging or production release, append one immutable entry containing:

- Git commit SHA and branch;
- build and test run URL or captured result;
- applied migration versions;
- feature-flag values;
- target environment name, without credentials;
- smoke-test outcome;
- rollback target and known limits;
- release time and responsible reviewer.

Until such an entry exists, the repository state is a local candidate and must not be described as the live release.

## Next candidate

The current candidate contains the reviewed wizard R0/R1 baseline and its research decision. The documentation alignment is recorded separately. Wizard R2, success receipt motion and the golden vertical service slice belong to subsequent commits.
