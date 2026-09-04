# F03 — Retired CSS cleanup

Date: 2026-09-03. Status: implemented and locally verified; not released.

## Scope and safety

The existing global stylesheet retained several obsolete header, catalog, matching-dialog, wizard and thermal-receipt generations. This slice removes their unreferenced rules rather than increasing budgets, compressing formatting or moving debt into unmeasured CSS modules.

Cleanup was performed in two reviewed passes using a temporary PostCSS transformation: the legacy receipt first, then the retired interface families. A selector was removed only when it required an explicitly selected retired class with no exact-token reference anywhere in app TypeScript/TSX sources. Recognized dynamic prefixes and complex functional selectors were preserved. Shared selector lists retained their live branches; surviving declarations and media-query order were not rearranged. Empty conditional wrappers and unreferenced keyframes were removed. The temporary mutation script was removed after the cleanup; no heuristic CSS deletion was added to CI or build.

- 47 unused legacy receipt classes and 85 unused interface classes accounted for 379 removed rules, plus retired branches in shared selector lists.
- All 41 active `premium-receipt` rules were checked for exact preservation during each pruning pass. The old `.receipt-paper` family is distinct from the active `.premium-receipt-paper` family.
- Separately removed the receipt's zero-millisecond index-based delay and its unnecessary inline custom property. This preserves the effective animation timing.
- Moved the application step-description title's static inline declaration to a named CSS class with identical values.
- Preserved existing dirty-worktree changes, brand tokens, active wizard classes, CSS modules, public/authorized workflows and the user's development server.

## Existing gate — unchanged budgets

| Metric | Before | After | Budget |
| --- | ---: | ---: | ---: |
| Global CSS lines | 8,295 | 6,108 | 7,252 |
| `!important` occurrences | 592 | 359 | 569 |
| Media queries | 67 | 58 | 59 |
| Inline style objects | 73 | 71 | 71 |

`npm run ui-debt:check` passes. `scripts/audit-ui-debt.mjs` is unchanged. Its existing scope measures `application.css` and inline style objects in app sources, not every CSS module; this cleanup did not relocate CSS to escape that scope.

## Local verification

- Production build and style-entrypoint check: passed.
- Lint and TypeScript: passed.
- Phase2Experience, ServiceMatch and RequestWizard: 3 files, 22 tests passed.
- Home, P1 and P2 Playwright regressions against the rebuilt production server: 52 tests passed (36.9 seconds), across desktop Chrome, Pixel 7 emulation, tablet and wide desktop. Narrow cases additionally exercise 320/390px geometry and interaction.
- No real accounts, database mutations, migrations, commits, pushes or deployments were performed.

## Limits and follow-up

F03's existing numeric gate is now green; this is not a claim that all CSS debt or all release gates are resolved. Active override layers and important declarations remain. Physical devices, screenshot-based visual comparison, assistive technology, authenticated workspace layouts and deferred multi-account verification remain separate checks. Further cleanup should consolidate active component ownership with targeted regression evidence, not indiscriminately remove all important declarations or merge media queries across cascade boundaries.
