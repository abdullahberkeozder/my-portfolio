import { expect, test } from "@playwright/test";

function localDateKey(date = new Date()) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

test("customer completes the mobile appointment request flow", async ({ page }) => {
  const todayKey = localDateKey();

  await page.route("**/rest/v1/**", async (route) => {
    const request = route.request();
    const pathname = new URL(request.url()).pathname;

    if (pathname.endsWith("/service_configs") || pathname.endsWith("/gallery_items")) {
      await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
      return;
    }

    if (pathname.endsWith("/appointment_availability_days")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "day-e2e",
            work_date: todayKey,
            status: "available",
            note: "E2E müsaitlik günü",
            appointment_availability_slots: [
              { id: "slot-e2e", slot_time: "09:00:00", is_available: true, note: null },
            ],
          },
        ]),
      });
      return;
    }

    if (pathname.endsWith("/analytics_events")) {
      await route.fulfill({ status: 201, contentType: "application/json", body: "{}" });
      return;
    }

    if (pathname.endsWith("/rpc/create_appointment_request")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "12345678-abcd-4000-8000-123456789012",
          public_token: "11111111-1111-4111-8111-111111111111",
        }),
      });
      return;
    }

    await route.continue();
  });

  await page.goto("/appointment");
  await page.getByRole("button", { name: /boya ve küçük tadilat/i }).click();
  await page.getByRole("radio", { name: /duvar boya ve badana/i }).click();
  await page.getByRole("button", { name: "Zaman Tercihini Seç" }).click();
  await page.locator(`[data-date-value="${todayKey}"]`).click();
  await page.getByRole("button", { name: "09:00 - 11:00, müsait" }).click();
  await page.getByRole("button", { name: "İletişime Geç" }).click();

  await page.getByLabel("Ad soyad *").fill("Canan Yılmaz");
  await page.getByLabel("Telefon numarası *").fill("0555");
  await page.getByRole("button", { name: "Talebi Gönder" }).click();
  await expect(page.getByLabel("Telefon numarası *")).toHaveAttribute("aria-invalid", "true");

  await page.getByLabel("Telefon numarası *").fill("05551234567");
  await page.getByRole("button", { name: "Talebi Gönder" }).click();

  await expect(page.getByRole("heading", { name: "Talebiniz alındı" })).toBeVisible();
  await expect(page.getByText("Uygunluk teyidi bekleniyor")).toBeVisible();
  await expect(page.getByRole("link", { name: "Talebi Takip Et" })).toHaveAttribute(
    "href",
    "/appointment/track/11111111-1111-4111-8111-111111111111",
  );

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
});
