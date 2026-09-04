# Ankara pilot account map

## Scope

Customers see the city map on `/taleplerim`, professionals on `/usta/talepler`, and both can manage their city on `/hesap#bolge`. Existing dashboard lists and login destinations are preserved. The public landing page is unchanged.

The account did not have a saved address-city field. This slice adds a city preference, not a full address book: `service_city: Ankara` in the authenticated Supabase user's metadata. Request addresses and professional working districts remain separate. Editable metadata is used only for presentation, never authorization or matching.

## Behavior and integration

- Only Ankara can be saved during the pilot. Missing or unsupported cities have explicit fallback notices.
- The map is an OpenStreetMap iframe with attribution, hide/show controls and an external fallback link. No Google API key or geolocation permission is required.
- No account ID, full address, request data or professional coordinates are sent to the map provider. The provider receives the browser connection when the iframe loads; the UI and privacy page explain this.
- The view is not live professional tracking or a service-coverage boundary. Current pilot districts are listed separately.
- The city endpoint verifies the origin, authenticated user and expected account identity, validates the payload strictly, and returns generic provider errors with no-store responses.
- CSP permits frames from `https://www.openstreetmap.org`. A running development server may need restarting to pick up the configuration change.

## Local verification

- 18 focused unit/component tests cover city states, visibility controls, save feedback, request validation, account-switch rejection, authentication failure and all three page integrations.
- Type-check, lint, build and the unchanged UI debt gate passed during implementation.
- The exact external map embed URL returned HTTP 200. This is provider reachability evidence, not browser rendering evidence.
- No live account metadata was changed. Persistence across real login sessions and signed-in visual checks on real devices remain to be verified.
- No database migration, deployment, commit or push was performed for this slice.

## References

- [Supabase user metadata updates](https://supabase.com/docs/reference/javascript/auth-updateuser)
- [OpenStreetMap embedding](https://wiki.openstreetmap.org/wiki/Export)

## Follow-up

Verify customer and professional sessions independently: save Ankara, reload, sign out/in, and confirm the map reflects the saved city without changing request address or working-area settings. Check narrow mobile layouts and keyboard access to the embedded map and hide control. Additional cities and a structured address book are separate future work.
