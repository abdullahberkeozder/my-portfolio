import supabase from "./supabase";

const TABLE_NAME = "admin_profiles";

export async function getAdminProfiles() {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select(
      "user_id, full_name, email, role, status, approved_by, approved_at, created_at, updated_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    throw new Error("Ekip üyeleri yüklenemedi.");
  }

  return data;
}

export async function manageTeamMember({ userId, role, status }) {
  const { error } = await supabase.rpc("manage_team_member", {
    p_user_id: userId,
    p_role: role,
    p_status: status,
  });

  if (error) {
    console.error(error);

    const messages = {
      owner_access_required:
        "Bu işlem yalnızca işletme sahibi tarafından yapılabilir.",
      owner_cannot_remove_own_access:
        "Kendi işletme sahibi erişiminizi kaldıramazsınız.",
      last_active_owner_required:
        "Sistemde en az bir aktif işletme sahibi bulunmalıdır.",
      team_member_not_found: "Ekip üyesi bulunamadı.",
    };
    const translatedMessage = Object.entries(messages).find(([key]) =>
      error.message?.includes(key),
    )?.[1];

    throw new Error(translatedMessage || "Ekip üyesi güncellenemedi.");
  }
}
