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
  'wizard_started',
  'wizard_completed',
  'draft_resumed',
  'quote_profile_opened',

  // Quote lifecycle (client-observable)
  'quote_accepted',
  'quote_rejected',
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

    // Send to external endpoint when configured
    if (endpoint) {
      navigator.sendBeacon(endpoint, new Blob([payload], { type: 'application/json' }));
    }
  } catch {
    // Optional measurement must never change the outcome of a product action.
    // Storage denial is not consent; do not queue or retry these events.
  }
}
