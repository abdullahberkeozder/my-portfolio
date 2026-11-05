# Gemini implementation task: landing View B editorial composition

## Objective

Adapt the production landing route (`app/page.tsx` and its directly paired styles) to the approved **B / Editoryal vitrin** composition in `prototype.html` in this directory. The visual target is the existing prototype at:

`file:///C:/Users/a-ber/Documents/Git/my-portfolio/ankara-usta-app/docs/design/landing-composition-review/prototype.html?view=b`

This is a bounded visual/layout refinement, not a product rewrite.

## In scope

- `app/page.tsx`
- `app/home.module.css`
- A directly paired landing-only style or component file only if required to preserve the existing route behavior.

## Keep unchanged

- Existing search classification, district selection, wizard opening, analytics events, saved-work persistence, category filtering, discovery modal, map links, district links, loading/error states, and route contracts.
- Existing real image assets and their accessibility text. Do not add remote assets or dependencies.
- All unrelated user changes in the working tree. Do not reset, clean, checkout, stash, commit, push, or deploy.
- All other routes and shared components unless a compile fix is strictly required by an in-scope edit.

## Target composition

- Header stays quiet and compact: brand left, clear route links right.
- Hero is a centered, editorial entrance: “Evin için bir fikir. İşin için bir usta.”, one label, one dominant search row, and a restrained example line. The search remains the primary action.
- Keep the existing green brand accent and navy ink, with an off-white paper surface. Avoid purple, neon, decorative gradients, emoji, fake metrics, or ornamental badges.
- Discovery starts with a simple heading/subtitle and category control, then uses the View B asymmetric bento grid: first discovery work is the lead piece, two supporting pieces beside it, and a quiet final row. On mobile this becomes a single readable column without forced masonry gaps.
- Card metadata is editorial and useful: title, real/representative artisan metadata already in the data model, and one restrained save control. No nested card-within-card treatment.
- Section boundaries should rely on whitespace, typography, and occasional hairline rules, not repeated bordered panels.
- Keep all interactive targets at least 44px and retain visible `:focus-visible` states.
- Preserve modal, filters, saved-only state and map bridge behavior. The visual simplification must not remove these controls or make them undiscoverable.

## Anti-slop constraints

- No emoji icons, fake testimonials, invented statistics, version labels, decorative status dots, gradient text, giant rounded cards, or glassmorphism by default.
- No em dash characters in user-visible copy.
- Do not introduce a new generic three-column feature-card row.
- Do not replace real application behavior with hard-coded prototype alerts.
- Prefer the project’s existing icon language and tokens over hand-rolled decorative illustrations.

## Responsive acceptance criteria

- At 1440px: hero and grid feel like one editorial page; lead card is visibly dominant without a heavy container border.
- At 820px: grid collapses to a balanced two-column flow with no overlap or horizontal scroll.
- At 390px and 320px: title wraps naturally, search controls remain usable, no text or button overflow, and save/modal controls remain reachable.
- `prefers-reduced-motion` remains respected.

## Verification

Run, and report the actual result of:

1. `npm run styles:check`
2. `npm run type-check`
3. The narrowest relevant landing/unit tests available in the repository.

Do not claim visual verification unless a real browser check was run. Report changed files and any unresolved issue, then stop.
