const allowedEvents = new Set([
  'service_search',
  'service_selected',
  'wizard_started',
  'wizard_completed',
  'draft_resumed',
  'quote_profile_opened',
]);

export function trackFunnel(eventName: string, properties: Record<string, string | number | boolean> = {}) {
  if (typeof window === 'undefined' || !allowedEvents.has(eventName)) return;
  if (localStorage.getItem('ankara_analytics_consent') !== 'accepted') return;
  const endpoint = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT;
  const payload = JSON.stringify({eventName, path: window.location.pathname, properties, occurredAt: new Date().toISOString()});
  window.dispatchEvent(new CustomEvent('orkestra:analytics', {detail: JSON.parse(payload)}));
  if (endpoint) navigator.sendBeacon(endpoint, new Blob([payload], {type:'application/json'}));
}
