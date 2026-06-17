import supabase from "./supabase";

export async function getAvailabilityDays({ startDate, endDate } = {}) {
  const today = new Date().toISOString().slice(0, 10);
  const fromDate = startDate || today;
  const toDate = endDate || fromDate;

  const { data, error } = await supabase
    .from("appointment_availability_days")
    .select(
      "id, work_date, status, note, appointment_availability_slots(id, slot_time, is_available, note)",
    )
    .gte("work_date", fromDate)
    .lte("work_date", toDate)
    .eq("is_visible", true)
    .order("work_date", { ascending: true });

  if (error) {
    console.error(error);
    throw new Error("Availability could not be loaded");
  }

  return data;
}

export async function updateAvailabilitySlot({ slotId, isAvailable }) {
  const { data, error } = await supabase
    .from("appointment_availability_slots")
    .update({ is_available: isAvailable })
    .eq("id", slotId)
    .select("id, is_available")
    .single();

  if (error) {
    console.error(error);
    throw new Error("Availability slot could not be updated");
  }

  return data;
}
