import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_SIZE = 5 * 1024 * 1024;
const BUCKET = "appointment-attachments";

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function detectImageType(bytes: Uint8Array) {
  if (
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) return { mime: "image/jpeg", extension: "jpg" };

  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) return { mime: "image/png", extension: "png" };

  if (
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  ) return { mime: "image/webp", extension: "webp" };

  return null;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return json({ error: "server_configuration" }, 500);

  try {
    const formData = await request.formData();
    const requestId = String(formData.get("request_id") || "");
    const publicToken = String(formData.get("public_token") || "");
    const file = formData.get("file");

    if (!requestId || !publicToken || !(file instanceof File)) {
      return json({ error: "invalid_request" }, 400);
    }
    if (file.size <= 0 || file.size > MAX_SIZE) {
      return json({ error: "invalid_file_size" }, 400);
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const detected = detectImageType(bytes);
    if (!detected || detected.mime !== file.type) {
      return json({ error: "invalid_file_type" }, 400);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });
    const { data: appointment, error: appointmentError } = await supabase
      .from("appointment_requests")
      .select("id")
      .eq("id", requestId)
      .eq("public_token", publicToken)
      .is("archived_at", null)
      .maybeSingle();

    if (appointmentError) {
      console.error("Appointment lookup failed", appointmentError.message);
      return json({ error: "appointment_lookup_failed" }, 500);
    }
    if (!appointment) {
      return json({ error: "appointment_not_found" }, 404);
    }

    const { count, error: countError } = await supabase
      .from("appointment_attachments")
      .select("id", { count: "exact", head: true })
      .eq("appointment_request_id", requestId);

    if (countError) return json({ error: "attachment_check_failed" }, 500);
    if ((count || 0) >= 3) return json({ error: "attachment_limit" }, 409);

    const storagePath =
      `${requestId}/${crypto.randomUUID()}.${detected.extension}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, bytes, {
        contentType: detected.mime,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) return json({ error: "upload_failed" }, 500);

    const { data: attachment, error: insertError } = await supabase
      .from("appointment_attachments")
      .insert({
        appointment_request_id: requestId,
        storage_path: storagePath,
        media_type: detected.mime,
        file_size: file.size,
      })
      .select("id")
      .single();

    if (insertError) {
      await supabase.storage.from(BUCKET).remove([storagePath]);
      return json({ error: "attachment_save_failed" }, 500);
    }

    return json({ id: attachment.id });
  } catch {
    return json({ error: "unexpected_error" }, 500);
  }
});
