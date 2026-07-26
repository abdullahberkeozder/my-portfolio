import { expect, test } from "@playwright/test";

async function mockPublicData(page) {
  await page.route("**/rest/v1/**", async (route) => {
    const pathname = new URL(route.request().url()).pathname;
    if (pathname.endsWith("/analytics_events")) {
      await route.fulfill({ status: 201, contentType: "application/json", body: "{}" });
      return;
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
  });
}

test("booking flow exposes semantic landmarks and works from the keyboard", async ({ page }) => {
  await mockPublicData(page);
  await page.goto("/appointment");

  await expect(page.getByRole("main")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByRole("navigation", { name: "Müşteri sayfası" })).toBeVisible();
  await expect(page.locator("#faq")).toBeAttached();

  const sectionOrder = await page.evaluate(() => {
    const expectedIds = new Set(["trust", "appointment-calendar", "portfolio-preview", "services", "process", "location", "faq"]);
    const shell = document.getElementById("trust")?.parentElement;
    return Array.from(shell?.children || [])
      .map((element) => element.id)
      .filter((id) => expectedIds.has(id));
  });
  expect(sectionOrder).toEqual([
    "trust",
    "appointment-calendar",
    "portfolio-preview",
    "services",
    "process",
    "location",
    "faq",
  ]);

  await page.locator("#top").getByRole("link", { name: /randevu al/i }).click();
  await expect(page.locator("#booking-service-title")).toBeFocused();
  await expect(page.getByRole("group", { name: "İş türleri" })).toBeVisible();

  await page.getByRole("button", { name: /kapı ve otomasyon/i }).click();
  const accessOptions = page.getByRole("radiogroup", { name: "Hizmet seçenekleri" }).getByRole("radio");
  await expect(accessOptions).toHaveCount(3);
  await accessOptions.first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(accessOptions.nth(1)).toBeFocused();
  await expect(accessOptions.nth(1)).toHaveAttribute("aria-checked", "true");

  await page.getByRole("button", { name: /türlerine dön/i }).click();
  await page.getByRole("button", { name: /boya ve küçük tadilat/i }).click();
  await expect(page.getByRole("radiogroup", { name: "Hizmet seçenekleri" })).toBeVisible();
  await page.getByRole("radio", { name: /duvar boya ve badana/i }).click();

  const nextButton = page.getByRole("button", { name: "Zaman Tercihini Seç" });
  await nextButton.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Uygun zamanı seçin" })).toBeVisible();
});

test("reduced motion and a 200 percent equivalent viewport preserve the customer UI", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 195, height: 422 });
  await mockPublicData(page);
  await page.goto("/appointment");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  const motion = await page.evaluate(() => {
    const style = getComputedStyle(document.body);
    return { animationDuration: style.animationDuration, transitionDuration: style.transitionDuration };
  });
  expect(Number.parseFloat(motion.animationDuration)).toBeLessThanOrEqual(0.001);
  expect(Number.parseFloat(motion.transitionDuration)).toBeLessThanOrEqual(0.001);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
});
