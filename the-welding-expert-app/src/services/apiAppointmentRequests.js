import { getSupabaseClient } from "./getSupabaseClient";

const TABLE_NAME = "appointment_requests";

const APPOINTMENT_REQUEST_ERROR_MESSAGES = {
  invalid_customer_details:
    "Ad, telefon veya hizmet bilgilerini kontrol edin.",
  invalid_customer_email: "E-posta adresi izin verilen uzunluğu aşıyor.",
  appointment_text_too_long: "Müşteri notu izin verilen uzunluğu aşıyor.",
  appointment_date_unavailable: "Geçmiş bir tarih için talep oluşturulamaz.",
  invalid_appointment_time: "Seçtiğiniz saat randevu aralıklarına uygun değil.",
  appointment_slot_unavailable:
    "Seçtiğiniz gün veya saat artık müsait değil. Lütfen başka bir aralık seçin.",
};

function getAppointmentRequestError(
  error,
  fallbackMessage = "Randevu talebi oluşturulamadı. Lütfen tekrar deneyin.",
) {
  const databaseMessage = error?.message?.toLowerCase() || "";
  const matchedError = Object.entries(
    APPOINTMENT_REQUEST_ERROR_MESSAGES,
  ).find(([errorKey]) => databaseMessage.includes(errorKey));

  if (matchedError) return matchedError[1];

  if (error?.code === "PGRST202") {
    return "Randevu güvenlik fonksiyonu bulunamadı. Supabase kurulumunu kontrol edin.";
  }

  return fallbackMessage;
}

export async function getAppointmentRequests({
  showArchived = false,
  page = 1,
  pageSize = 20,
  fetchAll = false,
  createdAfter = null,
  search = "",
  status = "",
  leadQuality = "",
} = {}) {
  const supabase = await getSupabaseClient();
  let query = supabase
    .from(TABLE_NAME)
    .select("*", { count: "exact" });

  if (showArchived) {
    query = query.not("archived_at", "is", null);
  } else {
    query = query.is("archived_at", null);
  }

  if (createdAfter) {
    query = query.gte("created_at", createdAfter);
  }

  if (status && status !== "all" && status !== "archived") {
    query = query.eq("status", status);
  }

  if (leadQuality && leadQuality !== "all") {
    query = leadQuality === "untagged"
      ? query.is("lead_quality", null)
      : query.eq("lead_quality", leadQuality);
  }

  if (search) {
    const cleanSearch = search.trim();
    if (cleanSearch) {
      query = query.or(
        `customer_name.ilike.%${cleanSearch}%,` +
        `customer_phone.ilike.%${cleanSearch}%,` +
        `customer_email.ilike.%${cleanSearch}%,` +
        `customer_note.ilike.%${cleanSearch}%,` +
        `notes.ilike.%${cleanSearch}%,` +
        `admin_note.ilike.%${cleanSearch}%,` +
        `customer_action_note.ilike.%${cleanSearch}%,` +
        `cancellation_reason.ilike.%${cleanSearch}%,` +
        `customer_feedback.ilike.%${cleanSearch}%,` +
        `lead_quality.ilike.%${cleanSearch}%,` +
        `service_type.ilike.%${cleanSearch}%`
      );
    }
  }

  query = query.order("created_at", { ascending: false });

  // Arama aktifken veya fetchAll=true olduğunda tüm kayıtları çek
  if (!fetchAll) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error(error);
    throw new Error("Randevu talepleri yüklenemedi.");
  }

  return { data: data ?? [], count: count ?? 0 };
}

export async function createAppointmentRequest(request) {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase.rpc(
    "create_appointment_request",
    {
      p_customer_name: request.customer_name,
      p_customer_phone: request.customer_phone,
      p_service_type: request.service_type,
      p_requested_date: request.requested_date,
      p_requested_time: request.requested_time,
      p_customer_email: request.customer_email || null,
      p_message: request.message || null,
      // The RPC keeps its legacy parameter name for a zero-downtime rollout.
      p_notes: request.customer_note || request.notes || null,
    },
  );

  if (error) {
    console.error(error);
    throw new Error(getAppointmentRequestError(error));
  }

  return data;
}

export async function getPublicAppointmentRequest(publicToken) {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase.rpc(
    "get_public_appointment_request",
    {
      p_public_token: publicToken,
    },
  );

  if (error) {
    console.error(error);
    throw new Error("Randevu takip bilgisi yüklenemedi.");
  }

  const request = Array.isArray(data) ? data[0] : data;

  if (!request) {
    throw new Error("Randevu takip kaydı bulunamadı.");
  }

  return request;
}

export async function submitAppointmentCustomerAction({
  publicToken,
  action,
  note,
  requestedDate,
  requestedTime,
  cancellationReason,
  feedback,
}) {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase.rpc(
    "submit_appointment_customer_action",
    {
      p_public_token: publicToken,
      p_customer_action: action,
      p_customer_action_note: note || null,
      p_customer_requested_date: requestedDate || null,
      p_customer_requested_time: requestedTime || null,
      p_cancellation_reason: cancellationReason || null,
      p_customer_feedback: feedback || null,
    },
  );

  if (error) {
    console.error(error);
    throw new Error(
      getAppointmentRequestError(
        error,
        "Randevu talebiniz güncellenemedi. Lütfen tekrar deneyin.",
      ),
    );
  }

  return data === true ? { submitted: true } : data;
}

export async function updateAppointmentRequest({ id, updates }) {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error(error);
    throw new Error(
      getAppointmentRequestError(
        error,
        "Randevu talebi güncellenemedi. Lütfen tekrar deneyin.",
      ),
    );
  }

  return data;
}

export async function deleteAppointmentRequest(id) {
  const supabase = await getSupabaseClient();
  const { error } = await supabase
    .from(TABLE_NAME)
    .update({ archived_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error(error);
    throw new Error("Randevu talebi arşivlenemedi.");
  }

  return true;
}

export async function restoreAppointmentRequest(id) {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update({ archived_at: null })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error(error);
    throw new Error("Randevu talebi arşivden çıkarılamadı.");
  }

  return data;
}
