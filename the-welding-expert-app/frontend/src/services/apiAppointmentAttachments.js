import { getSupabaseClient } from "./getSupabaseClient";

const BUCKET_NAME = "appointment-attachments";

export async function uploadAppointmentAttachments({
  requestId,
  publicToken,
  files,
  onProgress,
}) {
  const supabase = await getSupabaseClient();
  const results = [];

  for (let index = 0; index < files.length; index += 1) {
    const formData = new FormData();
    formData.append("request_id", requestId);
    formData.append("public_token", publicToken);
    formData.append("file", files[index]);

    const { data, error } = await supabase.functions.invoke(
      "upload-appointment-attachment",
      { body: formData },
    );
    results.push(error ? { ok: false, error } : { ok: true, data });
    onProgress?.(index + 1, files.length);
  }

  const uploaded = results.filter((result) => result.ok).length;
  return {
    selected: files.length,
    uploaded,
    failed: files.length - uploaded,
  };
}

export async function getAppointmentAttachments(requestIds = []) {
  if (!requestIds.length) return [];
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from("appointment_attachments")
    .select("id, appointment_request_id, storage_path, media_type, file_size, created_at")
    .in("appointment_request_id", requestIds)
    .order("created_at", { ascending: true });

  if (error) throw new Error("Talep fotoğrafları yüklenemedi.");
  if (!data?.length) return [];

  const { data: signedItems, error: signedError } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrls(data.map((item) => item.storage_path), 300);

  if (signedError) throw new Error("Fotoğraf önizlemeleri hazırlanamadı.");

  return data.map((item, index) => ({
    ...item,
    signedUrl: signedItems?.[index]?.signedUrl || null,
  }));
}

