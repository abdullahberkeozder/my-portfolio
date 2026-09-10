import { expect, test } from "@playwright/test";

test("customer chooses a real PostgreSQL slot through Spring", async ({ page }, testInfo) => {
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
  expect(unexpected).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath("contact-step.png"), fullPage: true });
});
