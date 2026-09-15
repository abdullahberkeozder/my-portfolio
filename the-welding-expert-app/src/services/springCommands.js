export const springCommandsEnabled = import.meta.env.VITE_BOOKING_WRITE_BACKEND === "spring";

export async function createSpringAppointment(request) {
  const response = await fetch("/api/v1/appointments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customer_name: request.customer_name,
      customer_phone: request.customer_phone,
      customer_email: request.customer_email || null,
      service_type: request.service_type,
      requested_date: request.requested_date,
      requested_time: request.requested_time,
      message: request.message || null,
      customer_note: request.customer_note || request.notes || null,
    }),
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) {
    if (response.status === 409) throw new Error("Seçtiğiniz gün veya saat artık müsait değil. Lütfen başka bir aralık seçin.");
    throw new Error("Randevu talebi oluşturulamadı. Lütfen bilgilerinizi kontrol edin.");
  }
  return response.json();
}
