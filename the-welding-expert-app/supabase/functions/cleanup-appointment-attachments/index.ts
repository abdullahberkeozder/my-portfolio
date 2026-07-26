import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BUCKET = "appointment-attachments";
const RETENTION_DAYS = 90;

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authorization = request.headers.get("Authorization");
  if (
    !supabaseUrl ||
    !serviceRoleKey ||
    authorization !== `Bearer ${serviceRoleKey}`
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
  const cutoff = new Date(
    Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data: expired, error } = await supabase
    .from("appointment_attachments")
    .select("id, storage_path, appointment_requests!inner(archived_at)")
    .not("appointment_requests.archived_at", "is", null)
    .lte("appointment_requests.archived_at", cutoff)
    .limit(500);

  if (error) {
    return Response.json({ error: "query_failed" }, { status: 500 });
  }
  if (!expired?.length) return Response.json({ removed: 0 });

  const paths = expired.map((attachment) => attachment.storage_path);
  const { error: storageError } = await supabase.storage
    .from(BUCKET)
    .remove(paths);
  if (storageError) {
    return Response.json({ error: "storage_cleanup_failed" }, { status: 500 });
  }

  const { error: deleteError } = await supabase
    .from("appointment_attachments")
    .delete()
    .in("id", expired.map((attachment) => attachment.id));
  if (deleteError) {
    return Response.json({ error: "metadata_cleanup_failed" }, { status: 500 });
  }

  return Response.json({ removed: expired.length });
});

