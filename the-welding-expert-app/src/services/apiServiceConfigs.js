import { getSupabaseClient } from "./getSupabaseClient";

const TABLE_NAME = "service_configs";

/**
 * Tüm aktif hizmet yapılandırmalarını sıralı olarak çeker.
 * Anon erişime açık — müşteri tarafı için de kullanılabilir.
 */
export async function getServiceConfigs() {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error(error);
    throw new Error("Hizmet yapılandırmaları yüklenemedi.");
  }

  return data;
}

/**
 * Admin panelinden bir hizmet yapılandırmasını günceller.
 *
 * @param {{ id: string, updates: object }} param
 */
export async function updateServiceConfig({ id, updates }) {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error(error);
    throw new Error("Hizmet yapılandırması güncellenemedi. Lütfen tekrar deneyin.");
  }

  return data;
}
