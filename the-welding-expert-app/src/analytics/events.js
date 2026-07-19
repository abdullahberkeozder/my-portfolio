export const ANALYTICS_EVENTS = Object.freeze({
  PUBLIC_PAGE_VIEWED: "public_page_viewed",
  HERO_CTA_CLICKED: "hero_cta_clicked",
  PUBLIC_CHANNEL_CLICKED: "public_channel_clicked",
  NAVIGATION_CTA_CLICKED: "navigation_cta_clicked",
  SERVICE_CATALOG_EXPANDED: "service_catalog_expanded",
  BOOKING_WIZARD_STARTED: "booking_wizard_started",
  BOOKING_SERVICE_GROUP_SELECTED: "booking_service_group_selected",
  BOOKING_SERVICE_GROUP_BACK_CLICKED: "booking_service_group_back_clicked",
  BOOKING_SERVICE_CHANGED: "booking_service_changed",
  BOOKING_DATE_SHORTCUT_SELECTED: "booking_date_shortcut_selected",
  BOOKING_FULL_CALENDAR_OPENED: "booking_full_calendar_opened",
  BOOKING_OPTIONAL_DETAILS_TOGGLED: "booking_optional_details_toggled",
  BOOKING_SLOT_SELECTED: "booking_slot_selected",
  BOOKING_STEP_COMPLETED: "booking_step_completed",
  BOOKING_VALIDATION_FAILED: "booking_validation_failed",
  BOOKING_SUBMISSION_STARTED: "booking_submission_started",
  BOOKING_SUBMITTED: "booking_submitted",
  BOOKING_SUBMISSION_FAILED: "booking_submission_failed",
  BOOKING_SUCCESS_VIEWED: "booking_success_viewed",
  BOOKING_WHATSAPP_CLICKED: "booking_whatsapp_clicked",
  BOOKING_SUCCESS_WHATSAPP_CLICKED: "booking_success_whatsapp_clicked",
  GALLERY_CASE_VIEWED: "gallery_case_viewed",
  GALLERY_FILTER_SELECTED: "gallery_filter_selected",
  GALLERY_BOOKING_CTA_CLICKED: "gallery_booking_cta_clicked",
  SELF_SERVICE_TRACKING_VIEWED: "self_service_tracking_viewed",
  SELF_SERVICE_ACTION_SUBMITTED: "self_service_action_submitted",
  SELF_SERVICE_ACTION_FAILED: "self_service_action_failed",
});

const EVENT_NAMES = new Set(Object.values(ANALYTICS_EVENTS));
const UTM_KEYS = ["source", "medium", "campaign", "content", "term"];
const MAX_PROPERTY_LENGTH = 240;
const SENSITIVE_PROPERTY_PATTERN = /^(customer_)?(name|phone|email|note|notes|message)$/i;

function sanitizeValue(value) {
  if (value == null || typeof value === "boolean" || typeof value === "number") return value;
  if (typeof value === "string") return value.trim().slice(0, MAX_PROPERTY_LENGTH);
  return undefined;
}

export function normalizeEvent(eventName, properties = {}) {
  if (!EVENT_NAMES.has(eventName) || !properties || Array.isArray(properties) || typeof properties !== "object") return null;

  const normalized = Object.fromEntries(
    Object.entries(properties)
      .filter(([key]) => !SENSITIVE_PROPERTY_PATTERN.test(key))
      .map(([key, value]) => [key, sanitizeValue(value)])
      .filter(([, value]) => value !== undefined),
  );

  return { eventName, properties: normalized };
}

export function readUtmParameters(search = window.location.search) {
  const params = new URLSearchParams(search);
  return Object.fromEntries(
    UTM_KEYS
      .map((key) => [key, params.get(`utm_${key}`)?.trim().slice(0, MAX_PROPERTY_LENGTH)])
      .filter(([, value]) => Boolean(value)),
  );
}

export function captureAttribution(search = window.location.search) {
  const incoming = readUtmParameters(search);

  if (Object.keys(incoming).length > 0) {
    sessionStorage.setItem("uu_attribution", JSON.stringify(incoming));
    return incoming;
  }

  try {
    return JSON.parse(sessionStorage.getItem("uu_attribution")) || {};
  } catch {
    return {};
  }
}

export function getEventDedupeKey(eventName, properties = {}) {
  if (!properties.operation_id) return null;
  return `${eventName}:${properties.operation_id}`;
}
