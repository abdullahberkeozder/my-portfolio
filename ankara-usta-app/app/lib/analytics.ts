/**
 * Client-side funnel analytics
 *
 * Design decisions:
 *  - allowedEvents is the single source of truth for what can be tracked.
 *    Any call with an event name outside this set is a no-op; this acts as
 *    both a privacy gate and a typo guard.
 *  - sanitizeProperties strips PII keys before the payload is dispatched or
 *    sent to the external endpoint. The list mirrors the SENSITIVE_KEYS set
 *    tested in analytics-events.spec.ts — keep them in sync.
 *  - Consent check: events are only sent when the user has explicitly
 *    accepted analytics (localStorage key 'ankara_analytics_consent').
 *  - Server-side: use `trackServerEvent` (see analytics-server.ts) for
 *    lifecycle events (job_completed, dispute_opened) that must be recorded
 *    reliably regardless of browser session state.
 */

// ---------------------------------------------------------------------------
// Allowed events — add here before calling trackFunnel anywhere
// ---------------------------------------------------------------------------

export const ALLOWED_EVENTS = new Set([
  // Discovery & wizard
  'service_search',
  'service_selected',
  'catalog_category_opened',
  'discovery_map_opened',
  'wizard_started',
  'wizard_completed',
  'wizard_abandoned',
  'draft_resumed',
  'quote_profile_opened',
  'profile_opened',
  'filter_applied',
  'map_pin_selected',
  'directory_view_changed',
  'directory_sort_changed',
  'directory_availability_viewed',
  'map_region_filter_changed',
  'mobile_drawer_changed',
  'request_started',

  // Authentication return
  'auth_return_completed',
  'auth_return_failed',

  // Reliability & duplicates
  'duplicate_submission_blocked',
  'realtime_reconnected',
  'realtime_disconnected',

  // Quote lifecycle (client-observable)
  'quote_accepted',
  'quote_rejected',
  'quote_revision_requested',
  'first_quote_received',
  'first_qualified_quote_received',

  // Job lifecycle (supplement server events)
  'job_completed',
  'job_cancelled',
  'dispute_opened',

  // Scope negotiation
  'scope_change_proposed',
  'scope_change_accepted',
  'scope_change_rejected',
]);

// ---------------------------------------------------------------------------
// PII filter — must match the set tested in analytics-events.spec.ts
// ---------------------------------------------------------------------------

const SENSITIVE_KEYS = new Set([
  'email',
  'phone',
  'address_line',
  'body',
  'password',
  'token',
  'full_name',
  'name',
  'display_name',
  'tc_no',
  'details',
  'notes',
  'description',
  'original_name',
  'storage_path',
  'answers',
]);

function sanitizeProperties(
  props: Record<string, string | number | boolean>,
): Record<string, string | number | boolean> {
  return Object.fromEntries(
    Object.entries(props).filter(([key]) => !SENSITIVE_KEYS.has(key)),
  );
}

// ---------------------------------------------------------------------------
// Public tracking function
// ---------------------------------------------------------------------------

export function trackFunnel(
  eventName: string,
  properties: Record<string, string | number | boolean> = {},
): void {
  if (typeof window === 'undefined') return;
  if (!ALLOWED_EVENTS.has(eventName)) return;
  try {
    if (localStorage.getItem('ankara_analytics_consent') !== 'accepted') return;

    const safe = sanitizeProperties(properties);
    const endpoint = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT;

    const payload = JSON.stringify({
      eventName,
      path: window.location.pathname,
      properties: safe,
      occurredAt: new Date().toISOString(),
    });

    // Dispatch to same-page listeners (used by E2E tests and dev tooling)
    window.dispatchEvent(
      new CustomEvent('orkestra:analytics', { detail: JSON.parse(payload) }),
    );

    // Keep a small, consent-gated local buffer for the internal diagnostics
    // panel. It is deliberately capped and contains only the already-sanitized
    // payload; no identity or free-form user text is persisted here.
    const localKey = 'orkestra_analytics_events';
    const existing = JSON.parse(localStorage.getItem(localKey) ?? '[]') as unknown;
    const events = Array.isArray(existing) ? existing : [];
    events.push(JSON.parse(payload));
    localStorage.setItem(localKey, JSON.stringify(events.slice(-500)));

    // Send to external endpoint when configured
    if (endpoint) {
      navigator.sendBeacon(endpoint, new Blob([payload], { type: 'application/json' }));
    }
  } catch {
    // Optional measurement must never change the outcome of a product action.
    // Storage denial is not consent; do not queue or retry these events.
  }
}
