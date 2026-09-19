import { execFileSync } from "node:child_process";

export const apiOrigin = "http://127.0.0.1:54321";
export const springOrigin = "http://127.0.0.1:18080";
export const databaseContainer = "supabase_db_umut-admin-ci";

export function requireIsolatedCI() {
  if (process.env.GITHUB_ACTIONS !== "true" || process.env.UMUT_ADMIN_CI !== "true") {
    throw new Error("Admin acceptance only runs in the disposable GitHub CI job.");
  }
}

export function sql(query) {
  requireIsolatedCI();
  // No URL/project-ref argument: this helper can only address the named local container.
  return execFileSync("docker", ["exec", "-i", databaseContainer, "psql",
    "-U", "postgres", "-d", "postgres", "-X", "-qAt", "-v", "ON_ERROR_STOP=1"],
  { input: query, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim();
}

export function state(id) {
  if (!/^[0-9a-f-]{36}$/.test(id)) throw new Error("Invalid fixture id");
  return JSON.parse(sql(`select json_build_object('status', status, 'date', requested_date,
    'time', requested_time, 'archived', archived_at is not null,
    'archivedAt', archived_at, 'updatedAt', updated_at)
    from public.appointment_requests where id='${id}'`));
}

export function slotAvailable(date, time) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    throw new Error("Invalid fixture slot");
  }
  return sql(`select s.is_available from public.appointment_availability_slots s
    join public.appointment_availability_days d on d.id=s.day_id
    where d.work_date='${date}' and s.slot_time='${time}'`) === "t";
}
