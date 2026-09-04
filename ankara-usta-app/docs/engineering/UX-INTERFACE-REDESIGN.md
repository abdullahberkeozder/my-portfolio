# Interface redesign — shared foundation and core journeys

Date: 2026-09-03
Status: Implemented and locally verified; visual/device and real-participant verification pending.

## Scope and intent

Apply the supplied UX principles without replacing Orkestra's logo, wordmark, white/lemonade palette, domain model or authorization rules. This is the first cross-application implementation slice, not a claim that every screen has been visually audited or fully redesigned. Existing uncommitted M4 work was preserved. Nothing was published, committed or migrated as part of this slice.

## Route inventory and treatment

| Family | Routes | Treatment |
| --- | --- | --- |
| Discovery | `/`, `/ustalar`, `/ustalar/[id]`, `/ustalar/[id]/talep`, `/nasil-calisir` | Shared navigation and spacing; home category/service selection redesigned; directory/profile retain business behavior |
| Identity | `/giris`, `/kayit`, `/usta/giris`, `/usta/kayit`, `/parola-yenile`, `/hesap` | Compact shared shell; clear customer/professional intent selector; return paths preserved |
| Requests/quotes | `/taleplerim`, `/taleplerim/[id]/teklifler`, `/teklifler/[id]` | Shared shell, localized list states and error recovery; existing M4 comparison retained |
| Work/conversations | `/islerim`, `/islerim/[id]`, `/gorusmeler`, `/gorusmeler/[requestId]/[professionalId]` | Shared shell; job tabs and mutation feedback improved; pre-job chat behavior unchanged |
| Professional | `/usta-basvurusu`, `/usta/musaitlik`, `/usta/talepler`, `/usta/teklifler/[requestId]` | Context navigation, common form layout; inline application draft-save feedback |
| Operations | `/yonetim/usta-basvurulari`, `/yonetim/moderasyon`, `/yonetim/uyusmazliklar`, `/yonetim/uyusmazliklar/[id]`, `/uyusmazliklar/[id]` | Compact shell without marketing footer; moderation reason validation and recoverable feedback |
| Information | `/yardim`, `/gizlilik`, `/kullanim-kosullari` | Reading-width layout, contents links and anchor offsets |
| Reference | `/concepts`, `/inspiration`, `/motif-lab` | Excluded from redesigned product shell |

API endpoints and `/auth/callback` are not visual pages. Build route output confirmed compilation, not authenticated access or runtime data correctness. No blog route was found in the compiled inventory.

## Source findings and implemented corrections

| Source finding | Change | Evidence |
| --- | --- | --- |
| Public professional directory could be confused with professional workspace by prefix matching | Exact path-boundary navigation model | `navigationModel.test.ts` |
| Header composition differed between pages | One shared header in ProductFrame; context-specific links | `ProductNavigation.test.tsx`; build |
| Category action selected its first service without an explicit choice | Native expandable categories expose their actual services; service button opens the existing wizard | `app/page.tsx`; compilation only, interaction verification still pending |
| Too many equal-priority discovery prompts | Three search hints and progressive service disclosure | Source review; no conversion measurement claimed |
| Account purpose was insufficiently explicit | Visible service-seeker/professional selector; selected styling and aria-current; retained return URL | `AuthForm.test.tsx` |
| Job tabs lacked complete keyboard behavior | Roving focus, arrow/Home/End navigation and labelled panels | `ProductNavigation.test.tsx` |
| Job network failure could leave controls busy | try/catch/finally, synchronous pending guard, retained input; message retry reuses key for unchanged body | Source review; real concurrency not verified |
| Draft save notification covered content | Inline saved/unavailable status in professional application | Source review and lint |
| Moderation feedback could lose context or leave controls stuck | Visible reason field, minimum-length validation, retained reason and restored controls on network failure | `ModerationFeedback.test.tsx` |
| List errors and empty results needed separate recovery | Client refresh control, meaningful empty-state destination, localized status labels | Source review, type-check and build |
| Marketing footer interrupted task work | Footer limited to public context | Source review |

## UX principles translated into implementation rules

- Hick/chunking/progressive disclosure: category before service, fewer initial suggestions, grouped job tasks. Do not hide essential terms or emergency guidance.
- Fitts: shared controls target 44 px; spacing and wrapping are explicit. This is a product goal, not proof that every rendered control satisfies it.
- Jakob/consistency: labelled menu, predictable account purpose selection, recognizable tabs and form labels.
- Proximity/hierarchy: constrained reading width, consistent section spacing, grouped content/actions and a primary action treatment.
- Feedback/control/recovery: honest pending states, no optimistic claim of database success, retained failed form input, refresh for uncertain results, Escape/focus restoration in mobile menu.
- Progress/recognition: wizard stage names accompany numbers; current location and selected account purpose are explicit.
- Sensible defaults/error prevention: preserve service choice and auth return rather than silently selecting a category's first service; reject incomplete moderation reasons before sending.
- Reduced cognitive load does not justify removing safety information, changing authorization, or making unsupported trust promises.

These are design hypotheses and implementation conventions, not measured psychological effects or conversion gains. The 44 px target is deliberately above the [WCAG 2.2 minimum target-size criterion](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), which has its own spacing rules and exceptions. Keyboard tabs follow the interaction model in the [WAI-ARIA tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/). Focused form tasks and contextual errors are informed by [GOV.UK question pages](https://design-system.service.gov.uk/patterns/question-pages/) and [error summaries](https://design-system.service.gov.uk/components/error-summary/); not every form now implements a complete error-summary pattern.

## Local verification

- `npm run test`: **48 files, 244 tests passed**.
- `npm run type-check`: passed.
- `npm run lint`: passed.
- `npm run build`: passed, including stylesheet entrypoint checks.
- Updated auth/quote tests for current visible labels without dropping their authorization/return/retry assertions.
- New tests cover path classification, mobile-menu Escape/focus restoration, keyboard tabs and moderation error recovery.
- No coverage threshold run, browser E2E, screen-reader, real-device, remote RLS or multi-account test is claimed by these results.

## Remaining verification and subsequent slices

1. Visual review at 320/390 px, tablet and desktop: header/menu, form actions, category expansion, wizard viewport, receipt and consent overlay. Confirm no horizontal overflow and no hidden actions.
2. Inspect legacy `application.css` interactions. Shared CSS modules reduce new coupling but do not remove the large existing stylesheet or all `!important` rules.
3. Exercise actual discovery-to-wizard selection and all wizard conditional branches; inspect focus after each step and validation failure.
4. Verify job-message retry with real participant sessions, and verify uncertain moderation responses before retrying. This UI work does not establish global idempotency.
5. Deep-review authenticated quote, dispute and administrator detail screens. Common styling is not equivalent to end-to-end verification of each privileged action.
6. Check 200–400% zoom, VoiceOver/TalkBack and physical keyboard; assess contrast using rendered combinations rather than palette alone.
7. Preserve the existing deferred M0–M4 migration, authorization, concurrency and release checklist. Feature flags remain unchanged; no activation is implied.

No automatic deployment or unrelated repository cleanup was performed. Commit attribution remains pending a user-authorized, reviewed commit grouping.
