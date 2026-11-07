import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { apiOrigin, springOrigin, requireIsolatedCI, sql, state, slotAvailable } from "./isolation.mjs";

const listPath = "/api/v1/admin/appointments";
const conflictMessage = "Seçilen saat artık müsait değil. Güncel listeyi kontrol edip başka bir saat seçin.";
let fixture;
let external;

async function session(request) {
  const response = await request.post(`${apiOrigin}/auth/v1/token?grant_type=password`, {
    headers: { apikey: process.env.UMUT_TEST_ANON_KEY },
    data: { email: process.env.UMUT_TEST_EMAIL, password: process.env.UMUT_TEST_PASSWORD },
  });
  expect(response.status()).toBe(200);
  return (await response.json()).access_token;
}

async function command(request, token, id, action, data) {
  const response = await request.post(`${springOrigin}${listPath}/${id}/${action}`, {
    headers: { Authorization: `Bearer ${token}` }, data,
  });
  expect(response.status()).toBe(200);
}

async function patch(request, token, id, data) {
  const response = await request.patch(`${apiOrigin}/rest/v1/appointment_requests?id=eq.${id}`, {
    headers: { apikey: process.env.UMUT_TEST_ANON_KEY, Authorization: `Bearer ${token}` }, data,
  });
  expect(response.status()).toBe(204);
}

async function login(page) {
  await page.goto("/admin/bookings");
  await page.getByLabel("E-posta", { exact: true }).fill(process.env.UMUT_TEST_EMAIL);
  await page.getByLabel("Şifre", { exact: true }).fill(process.env.UMUT_TEST_PASSWORD);
  const responsePromise = page.waitForResponse(response => response.url().includes("/auth/v1/token"));
  await page.getByRole("button", { name: "Giriş yap", exact: true }).click();
  const response = await responsePromise;
  expect(response.status()).toBe(200);
  const auth = await response.json();
  const header = JSON.parse(Buffer.from(auth.access_token.split(".")[0], "base64url"));
  expect(header.alg).toBe("ES256");
  await expect(page.getByRole("heading", { name: "Randevu talepleri", exact: true })).toBeVisible();
  await expect(page.locator("article").first()).toBeVisible();
}

function primary(page) {
  return page.locator("article").filter({ hasText: "Acceptance primary" });
}

async function findPrimary(page) {
  await page.getByPlaceholder("Müşteri adı, tel, e-posta veya notlarda ara...").fill("Acceptance primary");
  await expect(page.locator("article")).toHaveCount(1);
  await expect(primary(page)).toBeVisible();
}

async function uiCommand(page, action, perform, expectedStatus = 200) {
  // Register before the command and only count GETs started after its response.
  let completed = false;
  let refreshes = 0;
  const requests = request => {
    if (completed && request.method() === "GET" && new URL(request.url()).pathname === listPath) refreshes++;
  };
  const responses = response => {
    if (response.request().method() === "POST" && new URL(response.url()).pathname === `${listPath}/${fixture.id}/${action}`) {
      completed = true;
    }
  };
  page.on("request", requests);
  page.on("response", responses);
  try {
    const reply = page.waitForResponse(response => response.request().method() === "POST" &&
      new URL(response.url()).pathname === `${listPath}/${fixture.id}/${action}`);
    await perform();
    const response = await reply;
    expect(response.status()).toBe(expectedStatus);
    if (expectedStatus === 409) {
      expect((await response.json()).code).toBe("appointment_slot_unavailable");
      await expect(page.getByText(conflictMessage, { exact: true })).toBeVisible();
    }
    await expect.poll(() => refreshes).toBeGreaterThan(0);
  } finally {
    page.off("request", requests);
    page.off("response", responses);
  }
}

test.beforeEach(async ({ page }) => {
  requireIsolatedCI();
  external = [];
  await page.route("**/*", route => {
    const url = new URL(route.request().url());
    if (["http://127.0.0.1:5294", apiOrigin].includes(url.origin)) return route.continue();
    external.push(url.origin);
    return route.abort();
  });
  fixture = { id: randomUUID(), contender: randomUUID(), archived: randomUUID() };
  fixture.date = sql("select ((now() at time zone 'Europe/Istanbul')::date + 7)::text");
  sql(`truncate public.appointment_requests, public.appointment_availability_days cascade;
    insert into public.appointment_availability_days(work_date) values ('${fixture.date}');
    insert into public.appointment_availability_slots(day_id,slot_time)
      select d.id, t::time from public.appointment_availability_days d,
      unnest(array['09:00','11:00','13:00','15:00']) t;
    insert into public.appointment_requests(id,customer_name,customer_phone,service_type,requested_date,
      requested_time,lead_quality,admin_note,created_at) values
      ('${fixture.id}','Acceptance primary','05550000001','boya','${fixture.date}','09:00','qualified','Before refresh',now()),
      ('${fixture.contender}','Acceptance contender','05550000002','boya','${fixture.date}','11:00',null,null,now()-interval '1 minute');
    insert into public.appointment_requests(customer_name,customer_phone,service_type,requested_date,requested_time,created_at)
      select 'Fixture ' || lpad(i::text,2,'0'),'05550000003','boya','${fixture.date}','13:00',
      now()-i*interval '2 minutes' from generate_series(1,25) i;
    insert into public.appointment_requests(id,customer_name,customer_phone,service_type,requested_date,requested_time,status,archived_at)
      values ('${fixture.archived}','Archived unsupported','05550000004','boya','${fixture.date}','15:00','cancelled',now());`);
});

test.afterEach(() => {
  expect(external, "No production/external requests").toEqual([]);
});

test("real login, list membership, filters and pagination", async ({ page }) => {
  await login(page);
  await expect(page.locator("article")).toHaveCount(20);
  const firstPage = await page.locator("article h3").allTextContents();
  expect(firstPage).toHaveLength(20);
  const next = page.waitForResponse(response => new URL(response.url()).pathname === listPath &&
    new URL(response.url()).searchParams.get("page") === "1");
  await page.getByRole("button", { name: "Sonraki sayfa" }).click();
  const result = await (await next).json();
  expect(result.total).toBe(27);
  expect(result.page).toBe(1);
  await expect(page.locator("article")).toHaveCount(7);
  const secondPage = await page.locator("article h3").allTextContents();
  expect(secondPage).toHaveLength(7);
  expect(secondPage.filter(name => firstPage.includes(name))).toEqual([]);
  await page.getByLabel("Talep kalitesi filtresi").selectOption("qualified");
  await expect(page.locator("article")).toHaveCount(1);
  await expect(primary(page)).toBeVisible();
  await expect(page.getByRole("button", { name: "Sonraki sayfa" })).toHaveCount(0);
  await page.getByRole("button", { name: "Onaylandı", exact: true }).click();
  await expect(page.locator("article")).toHaveCount(0);
  await page.getByLabel("Talep kalitesi filtresi").selectOption("all");
  await page.getByRole("button", { name: "Arşivlenenler", exact: true }).click();
  await expect(page.locator("article")).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Arşivden çıkar", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Tümü", exact: true }).click();
  await findPrimary(page);
  await expect(primary(page).getByLabel("Talep durumu")).toHaveValue("new");
});

test("confirm, move, archive, restore and cancel refresh persisted state", async ({ page }) => {
  await login(page);
  await findPrimary(page);
  expect(slotAvailable(fixture.date, "09:00")).toBe(true);
  await uiCommand(page, "confirm", () => primary(page).getByLabel("Talep durumu").selectOption("confirmed"));
  await expect(primary(page).getByLabel("Talep durumu")).toHaveValue("confirmed");
  expect(slotAvailable(fixture.date, "09:00")).toBe(false);
  await primary(page).getByLabel("Yeni saat").selectOption("11:00");
  await uiCommand(page, "move", () => primary(page).getByRole("button", { name: "Randevuyu taşı" }).click());
  await expect(primary(page).getByLabel("Yeni saat")).toHaveValue("11:00");
  expect(state(fixture.id).time).toBe("11:00:00");
  expect(slotAvailable(fixture.date, "09:00")).toBe(true);
  expect(slotAvailable(fixture.date, "11:00")).toBe(false);
  await primary(page).getByRole("button", { name: "Arşive kaldır", exact: true }).click();
  await page.getByRole("button", { name: "Arşive Kaldır", exact: true }).click();
  await expect(primary(page)).toHaveCount(0);
  expect(state(fixture.id).archived).toBe(true);
  expect(slotAvailable(fixture.date, "11:00")).toBe(true);
  await page.getByRole("button", { name: "Arşivlenenler", exact: true }).click();
  await findPrimary(page);
  await uiCommand(page, "restore", () => primary(page).getByRole("button", { name: "Arşivden çıkar" }).click());
  await expect(primary(page)).toHaveCount(0);
  expect(state(fixture.id).archived).toBe(false);
  expect(slotAvailable(fixture.date, "11:00")).toBe(false);
  await page.getByRole("button", { name: "Tümü", exact: true }).click();
  await findPrimary(page);
  await uiCommand(page, "cancel", () => primary(page).getByLabel("Talep durumu").selectOption("cancelled"));
  await expect(primary(page).getByLabel("Talep durumu")).toHaveValue("cancelled");
  expect(state(fixture.id).status).toBe("cancelled");
  expect(slotAvailable(fixture.date, "11:00")).toBe(true);
});

["confirm", "move", "restore"].forEach(action => {
  test(`${action} conflict preserves state, shows message and fetches fresh details`, async ({ page, request }) => {
    const token = await session(request);
    if (action !== "confirm") await command(request, token, fixture.id, "confirm");
    if (action === "restore") await patch(request, token, fixture.id, { archived_at: new Date().toISOString() });
    await login(page);
    if (action === "restore") await page.getByRole("button", { name: "Arşivlenenler", exact: true }).click();
    await findPrimary(page);
    await expect(primary(page).getByLabel("Admin notu")).toHaveValue("Before refresh");
    // Another real authenticated session takes the destination after this browser read it.
    if (action !== "move") {
      sql(`update public.appointment_requests set requested_time='09:00' where id='${fixture.contender}';`);
    }
    await command(request, token, fixture.contender, "confirm");
    await patch(request, token, fixture.id, { admin_note: "Changed by second session" });
    const before = state(fixture.id);
    const slotsBefore = ["09:00", "11:00"].map(time => slotAvailable(fixture.date, time));
    if (action === "move") await primary(page).getByLabel("Yeni saat").selectOption("11:00");
    await uiCommand(page, action, () => action === "confirm"
      ? primary(page).getByLabel("Talep durumu").selectOption("confirmed")
      : primary(page).getByRole("button", { name: action === "move" ? "Randevuyu taşı" : "Arşivden çıkar" }).click(), 409);
    await expect(primary(page).getByLabel("Admin notu")).toHaveValue("Changed by second session");
    await expect(primary(page).getByLabel("Talep durumu")).toHaveValue(before.status);
    expect(state(fixture.id)).toEqual(before);
    expect(["09:00", "11:00"].map(time => slotAvailable(fixture.date, time))).toEqual(slotsBefore);
    expect(state(fixture.contender).status).toBe("confirmed");
    if (action === "restore") await expect(primary(page).getByRole("button", { name: "Arşivden çıkar" })).toBeEnabled();
    // The same UI can recover after the other administrator releases the slot.
    await command(request, token, fixture.contender, "cancel");
    if (action === "move") await primary(page).getByLabel("Yeni saat").selectOption("11:00");
    await uiCommand(page, action, () => action === "confirm"
      ? primary(page).getByLabel("Talep durumu").selectOption("confirmed")
      : primary(page).getByRole("button", { name: action === "move" ? "Randevuyu taşı" : "Arşivden çıkar" }).click());
    expect(state(fixture.id).status).toBe("confirmed");
    expect(state(fixture.id).archived).toBe(false);
  });
});
