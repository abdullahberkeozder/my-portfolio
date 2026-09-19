import { execFileSync, spawn } from "node:child_process";
import { generateKeyPairSync, randomUUID } from "node:crypto";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { apiOrigin, springOrigin, requireIsolatedCI, sql } from "./isolation.mjs";

requireIsolatedCI();
const root = resolve(import.meta.dirname, "../..");
const workdir = mkdtempSync(join(tmpdir(), "umut-admin-ci-"));
const secret = randomUUID();
const password = randomUUID();
let spring;
let springExit;
const cli = (...args) => execFileSync("supabase", [...args, "--workdir", workdir,
  "--agent", "no", "--output-format", "text"],
{ encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: 360000 });

async function waitForSpring() {
  for (let attempt = 0; attempt < 90; attempt++) {
    if (spring.exitCode !== null) throw new Error("Spring exited before readiness");
    const response = await fetch(`${springOrigin}/api/v1/services`).catch(() => null);
    if (response?.ok) return;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error("Spring readiness timed out");
}

try {
  mkdirSync(join(workdir, "supabase"));
  const { privateKey } = generateKeyPairSync("ec", { namedCurve: "prime256v1" });
  writeFileSync(join(workdir, "supabase/signing_keys.json"), JSON.stringify([
    { ...privateKey.export({ format: "jwk" }), kid: randomUUID(), alg: "ES256", use: "sig", key_ops: ["sign", "verify"] },
  ]), { mode: 0o600 });
  writeFileSync(join(workdir, "supabase/config.toml"), `project_id = "umut-admin-ci"
[api]
enabled = true
port = 54321
schemas = ["public", "graphql_public"]
extra_search_path = ["public", "extensions"]
[db]
port = 54322
major_version = 17
[db.seed]
enabled = false
[studio]
enabled = false
[analytics]
enabled = false
[auth]
enabled = true
site_url = "http://127.0.0.1:5294"
jwt_issuer = "${apiOrigin}/auth/v1"
signing_keys_path = "./signing_keys.json"
enable_signup = false
[auth.email]
enable_signup = false
enable_confirmations = false
`);
  console.log("Starting disposable Supabase Auth/PostgreSQL/PostgREST stack");
  cli("start", "--exclude", "studio,postgres-meta,imgproxy,edge-runtime,logflare,vector,supavisor");
  const status = JSON.parse(cli("status", "-o", "json"));
  if (status.API_URL !== apiOrigin || !status.ANON_KEY || !status.SERVICE_ROLE_KEY) {
    throw new Error("Unexpected isolated Supabase status");
  }
  for (const file of ["welding_appointments_schema.sql", "service_configs_migration.sql",
    "role_based_access_control.sql", "analytics_events_migration.sql", "sprint_6_measurement_release.sql",
    "sprint_9_appointment_attachments.sql", "migrations/20260910150437_appointment_reservation_transitions.sql"]) {
    console.log(`Applying isolated fixture schema: ${file}`);
    sql(readFileSync(join(root, "supabase", file), "utf8"));
  }
  sql(readFileSync(join(root, "e2e/admin-ci/grants.sql"), "utf8"));
  sql(`alter role booking_reader password '${secret}'; alter role booking_writer password '${secret}';`);
  const email = "admin-acceptance@example.invalid";
  const response = await fetch(`${apiOrigin}/auth/v1/admin/users`, {
    method: "POST", headers: { apikey: status.SERVICE_ROLE_KEY,
      Authorization: `Bearer ${status.SERVICE_ROLE_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  if (!response.ok) throw new Error(`Test user provisioning failed (${response.status})`);
  const user = await response.json();
  if (!/^[0-9a-f-]{36}$/.test(user.id)) throw new Error("Invalid test user id");
  sql(`update public.admin_profiles set status='active', role='admin' where user_id='${user.id}';`);
  if (sql(`select count(*) from public.admin_profiles where user_id='${user.id}' and status='active' and role='admin'`) !== "1") {
    throw new Error("Test administrator profile was not provisioned");
  }
  const target = join(root, "backend/target");
  const jar = readdirSync(target).find(file => file.endsWith(".jar"));
  if (!jar) throw new Error("Build Spring jar before acceptance");
  console.log("Starting Spring with restricted fixture database roles");
  spring = spawn("java", ["-jar", join(target, jar)], { cwd: root, stdio: "ignore", env: {
    ...process.env, PORT: "18080", BOOKING_DATABASE_URL: "jdbc:postgresql://127.0.0.1:54322/postgres",
    BOOKING_DATABASE_USER: "booking_reader", BOOKING_DATABASE_PASSWORD: secret,
    BOOKING_WRITER_DATABASE_URL: "jdbc:postgresql://127.0.0.1:54322/postgres",
    BOOKING_WRITER_DATABASE_USER: "booking_writer", BOOKING_WRITER_DATABASE_PASSWORD: secret,
    BOOKING_WRITES_ENABLED: "true", BOOKING_JWT_ISSUER: `${apiOrigin}/auth/v1`,
    BOOKING_JWKS_URI: `${apiOrigin}/auth/v1/.well-known/jwks.json`,
  } });
  springExit = new Promise(resolve => { spring.once("exit", resolve); spring.once("error", resolve); });
  await waitForSpring();
  const browser = spawn("npx", ["playwright", "test", "--config", "playwright.admin-ci.config.js"], {
    cwd: root, stdio: "inherit", env: { ...process.env,
      CI_SPRING_ORIGIN: springOrigin, UMUT_TEST_EMAIL: email, UMUT_TEST_PASSWORD: password,
      UMUT_TEST_ANON_KEY: status.ANON_KEY },
  });
  const code = await new Promise((resolve, reject) => {
    browser.once("exit", resolve); browser.once("error", reject);
  });
  if (code !== 0) throw new Error("Admin browser acceptance failed");
  console.log("Admin acceptance passed against real Auth, Spring and PostgreSQL");
} catch (error) {
  // Do not print subprocess output: CLI status and Auth responses contain credentials.
  console.error(error?.code ? `Isolated runner failed (${error.code})` : error.message.split("\n")[0]);
  process.exitCode = 1;
} finally {
  if (spring && spring.exitCode === null) spring.kill("SIGTERM");
  if (springExit) await springExit;
  try { cli("stop", "--no-backup"); } catch { console.error("CI stack cleanup failed"); process.exitCode = 1; }
  rmSync(workdir, { recursive: true, force: true });
}
