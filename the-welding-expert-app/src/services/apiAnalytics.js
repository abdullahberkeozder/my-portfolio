import supabase from "./supabase";

const TABLE_NAME = "analytics_events";

/**
 * Bir analitik olayını Supabase'e yazar.
 * Hata durumunda sessizce başarısız olur — analitik loglama
 * uygulama akışını asla kesmemelidir.
 *
 * @param {string} eventName  - Olay adı (ör. "booking_submitted")
 * @param {object} [properties] - Olayla ilgili ek veriler
 */
export async function logEvent(eventName, properties = {}) {
  if (!eventName) return;

  // Session ID: oturum bazlı takip için (localStorage'da saklanır)
  let sessionId = sessionStorage.getItem("uu_session_id");

  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem("uu_session_id", sessionId);
  }

  try {
    await supabase.from(TABLE_NAME).insert({
      event_name: eventName,
      session_id: sessionId,
      properties: Object.keys(properties).length > 0 ? properties : null,
    });
  } catch {
    // Analitik hataları sessizce yutulur
  }
}

/**
 * Son N günlük olayları gruplandırılmış olarak çeker.
 * Sadece admin rolü çağırabilir.
 *
 * @param {number} [days=30] - Kaç günlük verisi
 */
export async function getAnalyticsEvents({ days = 30 } = {}) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceISO = since.toISOString();

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("id, created_at, event_name, session_id")
    .gte("created_at", sinceISO)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    throw new Error("Analitik verileri yüklenemedi.");
  }

  return data;
}
