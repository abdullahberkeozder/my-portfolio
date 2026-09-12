import { expect, test } from "@playwright/test";

test("customer creates a real pending PostgreSQL request through Spring", async ({ page }, testInfo) => {
  const unexpected = [];
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === "127.0.0.1") return route.continue();
    // Gallery and analytics are outside this read-only staging slice.
    if (url.hostname === "staging.invalid" && /\/(gallery_items|analytics_events)$/.test(url.pathname)) {
      return route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
    }
    if (url.hostname === "staging.invalid") unexpected.push(url.pathname);
    return route.abort();
  });
  const services = page.waitForResponse((r) => r.url().includes("/api/v1/services") && r.status() === 200);
  const availability = page.waitForResponse((r) => r.url().includes("/api/v1/availability") && r.status() === 200);
  await page.goto("/appointment");
  await page.mouse.wheel(0, 500);
  expect((await (await services).json())[0].description).toBe("CI PostgreSQL fixture");
  const slots = await (await availability).json();
  expect(slots).toHaveLength(1);
  await page.getByRole("button", { name: /boya ve küçük tadilat/i }).click();
  await page.getByRole("radio", { name: /duvar boya ve badana/i }).click();
  await page.getByRole("button", { name: "Zaman Tercihini Seç" }).click();
  await page.locator(`[data-date-value="${slots[0].date}"]`).click();
  await page.getByRole("button", { name: "09:00 - 11:00, müsait" }).click();
  await page.getByRole("button", { name: "İletişime Geç" }).click();
  await expect(page.getByLabel("Ad soyad *")).toBeVisible();
  await page.getByLabel("Ad soyad *").fill("CI Synthetic Customer");
  await page.getByLabel("Telefon numarası *").fill("05551234567");
  const created = page.waitForResponse((r) => r.url().endsWith("/api/v1/appointments") && r.request().method() === "POST");
  await page.getByRole("button", { name: "Talebi Gönder" }).click();
  const response = await created;
  expect(response.status()).toBe(201);
  const result = await response.json();
  expect(result.id).toMatch(/^[0-9a-f-]{36}$/);
  await expect(page.getByRole("heading", { name: "Talebiniz alındı" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Talebi Takip Et" })).toHaveAttribute("href", `/appointment/track/${result.public_token}`);
  expect(unexpected).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath("request-created.png"), fullPage: true });
});
