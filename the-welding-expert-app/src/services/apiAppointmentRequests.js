import supabase from "./supabase";

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

export async function getAppointmentRequests({ showArchived = false } = {}) {
  let query = supabase
    .from(TABLE_NAME)
    .select("*");

  if (showArchived) {
    query = query.not("archived_at", "is", null);
  } else {
    query = query.is("archived_at", null);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    throw new Error("Randevu talepleri yüklenemedi.");
  }

  return data;
}

export async function createAppointmentRequest(request) {
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

export async function updateAppointmentRequest({ id, updates }) {
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
