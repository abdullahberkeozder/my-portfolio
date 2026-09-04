# Account panel and request-first layout

## Scope
- Desktop account popover: bounded width and viewport height; mobile drawer: full viewport height, fixed close/header area and independently scrollable body.
- Preserve account identity, settings, neutral logout and existing authentication behavior.
- Customer requests (including empty/error states and pagination) precede the auxiliary city map. The customer map starts collapsed and mounts the external iframe only after expansion.
- Map: loading feedback, 12-second slow-connection notice, retry, hide and external-map fallback. No private location or authentication changes.

## Evidence
- Component coverage: identity/settings/logout order, long unbroken name preservation, Tab/Shift+Tab focus loop, Escape focus return, map expansion, load event, timeout, retry and hide cleanup; populated/empty/error request ordering.
- Browser: signed-out desktop panel at 1440×900 (360px wide); mobile drawers at 320×740 and 390×844, no horizontal drawer overflow. Mobile reverse-tab stayed inside, Escape restored menu-trigger focus.
- Initial browser account-fixture interception was unsuccessful and cleared. A subsequent real-session check used the existing signed-in Chrome customer session without mocking responses or changing account data.
- Real-session follow-up: customer requests route rendered its empty state before the initially collapsed map; desktop account panel measured 360×425.5px, with no horizontal overflow and transparent logout background. Identity/settings/logout hierarchy was present.
- Signed-in drawer at 320×740: no horizontal overflow; Shift+Tab from Close reached logout; Escape returned focus to the menu trigger. The existing account name was used, not an artificially extended name.
- OpenStreetMap tiles visibly rendered Ankara on desktop and 390×844 mobile. Mobile iframe measured 309×240px with no page overflow. Retry rendered the map controls again; hiding removed the iframe; reopening visibly rendered tiles again. Temporary viewport override removed after checks and map returned to collapsed state.
- TypeScript and production build passed. No database mutations, deployment or commit.

## Limits
- Cross-origin iframe load events do not prove successful tile rendering; an error page can also dispatch load. Therefore no “map loaded successfully” claim is shown. External link and retry remain available even after load.
- Artificially long names in a real signed-in session, blocked/slow network simulation and physical-device testing remain unverified. Long-name and timeout behavior have component coverage only. The tested real account had no saved city and no requests; populated-request ordering and saved-city states remain covered by component tests, not this real-session check.
