import supabase from "./supabase";

const TABLE_NAME = "appointment_requests";

export async function getAppointmentRequests() {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    throw new Error("Appointment requests could not be loaded");
  }

  return data;
}

export async function createAppointmentRequest(request) {
  const { error } = await supabase
    .from(TABLE_NAME)
    .insert([request]);

  if (error) {
    console.error(error);
    throw new Error("Appointment request could not be created");
  }

  return true;
}
