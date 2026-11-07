import {
  captureAttribution,
  getEventDedupeKey,
  normalizeEvent,
} from "../analytics/events";
import { getSupabaseClient } from "./getSupabaseClient";

const TABLE_NAME = "analytics_events";

export async function logEvent(eventName, properties = {}) {
  const normalized = normalizeEvent(eventName, properties);
  if (!normalized) return false;

  let sessionId = sessionStorage.getItem("uu_session_id");
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem("uu_session_id", sessionId);
  }

  const eventProperties = { ...captureAttribution(), ...normalized.properties };
  const dedupeKey = getEventDedupeKey(eventName, eventProperties);
  const storageKey = dedupeKey ? `uu_event_${dedupeKey}` : null;

  if (storageKey && sessionStorage.getItem(storageKey)) return false;
  if (storageKey) sessionStorage.setItem(storageKey, "pending");

  try {
    const supabase = await getSupabaseClient();
    const { error } = await supabase.from(TABLE_NAME).insert({
      event_name: eventName,
      session_id: sessionId,
      properties: Object.keys(eventProperties).length > 0 ? eventProperties : null,
    });

    if (error) throw error;
    if (storageKey) sessionStorage.setItem(storageKey, "sent");
    return true;
  } catch {
    if (storageKey) sessionStorage.removeItem(storageKey);
    return false;
  }
}

export async function getAnalyticsEvents({ days = 30 } = {}) {
  const supabase = await getSupabaseClient();
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("id, created_at, event_name, session_id, properties")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    throw new Error("Analitik verileri yüklenemedi.");
  }

  return data;
}

export async function getAppointmentFunnelData({ days = 30 } = {}) {
  const supabase = await getSupabaseClient();
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from("appointment_requests")
    .select("channel, status, service_type, lead_quality, created_at")
    .gte("created_at", since.toISOString())
    .is("archived_at", null);

  if (error) {
    console.error(error);
    throw new Error("Talep hunisi verileri yüklenemedi.");
  }

  return data ?? [];
}
