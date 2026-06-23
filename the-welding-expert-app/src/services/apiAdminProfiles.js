import supabase from "./supabase";

const TABLE_NAME = "admin_profiles";

export async function getAdminProfiles() {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("user_id, full_name, email, role, is_active, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    throw new Error("Admin profilleri yüklenemedi.");
  }

  return data;
}

export async function updateAdminProfile({ userId, updates }) {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(updates)
    .eq("user_id", userId)
    .select("user_id, full_name, email, role, is_active, created_at, updated_at")
    .single();

  if (error) {
    console.error(error);
    throw new Error("Admin profili güncellenemedi.");
  }

  return data;
}
