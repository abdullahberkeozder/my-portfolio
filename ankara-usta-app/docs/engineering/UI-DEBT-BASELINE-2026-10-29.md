# UI debt baseline — 2026-10-29

The former guard was pinned to the pre-rollout baseline of 7,252 CSS lines and 59 media queries. The accepted landing, wizard, discovery, loading and route-surface work changed the measured production scope, so the old threshold no longer described the committed application.

The gate now reads [`UI-DEBT-BASELINE-2026-10-29.json`](./UI-DEBT-BASELINE-2026-10-29.json) and fails on any increase above the measured baseline:

| Metric | Baseline | Meaning |
| --- | ---: | --- |
| `cssLines` | 7,899 | `app/application.css` line count |
| `important` | 380 | `!important` declarations in the global stylesheet |
| `mediaQueries` | 67 | global stylesheet media-query count |
| `inlineStyles` | 53 | inline React style objects in `app/` |

This is a ratchet, not a waiver. The next UI cleanup should reduce these numbers and update the baseline downward only after verification.
