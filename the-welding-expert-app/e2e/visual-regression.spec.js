import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("theme", "light"));
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("appointment wizard visual baseline", async ({ page }) => {
  await page.route("**/rest/v1/**", async (route) => {
    const pathname = new URL(route.request().url()).pathname;
    const status = pathname.endsWith("/analytics_events") ? 201 : 200;
    await route.fulfill({ status, contentType: "application/json", body: pathname.endsWith("/analytics_events") ? "{}" : "[]" });
  });
  await page.goto("/appointment");
  const wizard = page.locator("#appointment-calendar");
  await expect(wizard).toBeVisible();
  await wizard.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);

  await expect(wizard).toHaveScreenshot("appointment-wizard.png", {
    animations: "disabled",
  });
});

test("tracking error visual baseline", async ({ page }) => {
  await page.route("**/rest/v1/**", async (route) => {
    const pathname = new URL(route.request().url()).pathname;
    if (pathname.endsWith("/analytics_events")) {
      await route.fulfill({ status: 201, contentType: "application/json", body: "{}" });
      return;
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: "[null]" });
  });
  await page.goto("/appointment/track/00000000-0000-4000-8000-000000000000");

  await expect(page.getByRole("main")).toHaveScreenshot("tracking-invalid-token.png", {
    animations: "disabled",
  });
});
