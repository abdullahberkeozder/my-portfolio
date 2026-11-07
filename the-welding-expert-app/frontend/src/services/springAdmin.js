import { getSupabaseClient } from "./getSupabaseClient";

export const springAdminEnabled = import.meta.env.VITE_BOOKING_ADMIN_BACKEND === "spring";

async function adminFetch(path, options = {}) {
  const client = await getSupabaseClient();
  const { data, error } = await client.auth.getSession();
  if (error || !data?.session?.access_token) throw new Error("Oturumunuz sona erdi. Tekrar giriş yapın.");
  const response = await fetch(`/api/v1/admin/appointments${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session.access_token}` },
    signal: AbortSignal.timeout(25000),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const messages = {
      appointment_slot_unavailable: "Seçilen saat artık müsait değil. Güncel listeyi kontrol edip başka bir saat seçin.",
      appointment_retry_required: "İşlem başka bir güncellemeyle çakıştı. Güncel kaydı kontrol edip tekrar deneyin.",
    };
    const failure = new Error(messages[body.code] || ({
      400: "Tarih ve filtre bilgilerini kontrol edin.",
      401: "Oturumunuz sona erdi. Tekrar giriş yapın.",
      403: "Bu işlem için yönetici yetkiniz bulunmuyor.",
      404: "Randevu kaydı bulunamadı.",
      409: "Randevunun durumu değişmiş olabilir. Güncel kaydı kontrol edin.",
    })[response.status] || "İşlem tamamlanamadı. Tekrar denemeden önce güncel kaydı kontrol edin.");
    failure.status = response.status;
    throw failure;
  }
  return response.json();
}

export async function getSpringAdminAppointments({ showArchived = false, page = 1, pageSize = 20,
  fetchAll = false, search = "", status = "", leadQuality = "", createdAfter, createdBefore, from, to } = {}) {
  const params = new URLSearchParams({ archived: String(showArchived), page: String(fetchAll ? 0 : page - 1),
    size: String(fetchAll ? 100 : pageSize), sort: "newest" });
  for (const [key, value] of Object.entries({ search: search.trim(), status: ["all", "archived"].includes(status) ? "" : status,
    leadQuality: leadQuality === "all" ? "" : leadQuality, createdAfter, createdBefore, from, to })) {
    if (value) params.set(key, value);
  }
  const items = [];
  let result;
  do {
    result = await adminFetch(`?${params}`);
    items.push(...result.items);
    params.set("page", String(result.page + 1));
  } while (fetchAll && result.items.length && items.length < result.total);
  if (!items.length) return { data: [], count: result.total };
  // Explicit hybrid read: Spring owns membership/order; RLS-protected Supabase supplies card details.
  const client = await getSupabaseClient();
  const details = [];
  for (let offset = 0; offset < items.length; offset += 100) {
    const { data, error } = await client.from("appointment_requests").select("*")
      .in("id", items.slice(offset, offset + 100).map(item => item.id));
    if (error) throw new Error("Randevu ayrıntıları yüklenemedi.");
    details.push(...data);
  }
  const byId = new Map(details.map(item => [item.id, item]));
  if (items.some(item => !byId.has(item.id))) throw new Error("Liste değişti veya kayıtlara erişilemiyor. Yeniden yükleyin.");
  return { data: items.map(item => ({ ...byId.get(item.id), customer_name: item.customerName,
    service_type: item.serviceType, requested_date: item.date, requested_time: item.time, status: item.status })), count: result.total };
}

export function updateSpringAdminAppointment({ id, updates }) {
  const keys = Object.keys(updates);
  if (keys.length === 1 && ["confirmed", "cancelled"].includes(updates.status)) {
    return adminFetch(`/${encodeURIComponent(id)}/${updates.status === "confirmed" ? "confirm" : "cancel"}`, { method: "POST" });
  }
  if (keys.length === 2 && keys.includes("requested_date") && keys.includes("requested_time")) {
    return adminFetch(`/${encodeURIComponent(id)}/move`, { method: "POST", body: JSON.stringify(updates) });
  }
  if (keys.length === 1 && keys[0] === "archived_at" && updates.archived_at === null) {
    return adminFetch(`/${encodeURIComponent(id)}/restore`, { method: "POST" });
  }
  throw new Error("Bu durum değişikliği Spring üzerinden henüz desteklenmiyor.");
}
