import { expect, test } from "@playwright/test";

const publicToken = "11111111-1111-4111-8111-111111111111";
const baseRequest = {
  service_type: "Kapı, korkuluk ve kaynak",
  requested_date: "2026-07-24",
  requested_time: "15:00:00",
  status: "new",
  created_at: "2026-07-19T09:00:00.000Z",
  updated_at: "2026-07-19T09:00:00.000Z",
  customer_action: null,
  customer_action_at: null,
  customer_action_count: 0,
};

async function mockSelfService(page, request = baseRequest) {
  await page.route("**/rest/v1/**", async (route) => {
    const pathname = new URL(route.request().url()).pathname;

    if (pathname.endsWith("/rpc/get_public_appointment_request")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([request]),
      });
      return;
    }

    if (pathname.endsWith("/rpc/submit_appointment_customer_action")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          submitted: true,
          action: "change_requested",
          submitted_at: "2026-07-19T12:00:00.000Z",
          action_count: 1,
          is_repeat: false,
        }),
      });
      return;
    }

    if (pathname.endsWith("/analytics_events")) {
      await route.fulfill({ status: 201, contentType: "application/json", body: "{}" });
      return;
    }

    await route.continue();
  });
}

test("customer tracks a request and submits the first change request", async ({ page }) => {
  await mockSelfService(page);
  await page.goto(`/appointment/track/${publicToken}`);

  await expect(page.getByRole("heading", { name: "Talebinizi takip edin" })).toBeVisible();
  await expect(page.getByText("Talep alındı")).toBeVisible();
  await expect(page.getByText("Sıradaki adım")).toBeVisible();
  await expect(page.getByText("Bu türde daha önce istek gönderdiniz")).toHaveCount(0);

  await page.getByLabel("Tercih ettiğiniz yeni tarih").fill("2026-07-28");
  await page.getByLabel("Tercih ettiğiniz yeni saat").selectOption("17:00");
  await page.getByRole("button", { name: "Değişiklik İsteğini Gönder" }).click();

  await expect(page.getByText("İsteğiniz ilk kez alındı")).toBeVisible();
  await expect(page.getByText(/Ekip teyidi olmadan mevcut plan değişmez/)).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
});

test("a repeated cancellation shows its previous request time", async ({ page }) => {
  await mockSelfService(page, {
    ...baseRequest,
    customer_action: "cancel_requested",
    customer_action_at: "2026-07-18T12:00:00.000Z",
    customer_action_count: 1,
  });
  await page.goto(`/appointment/track/${publicToken}`);

  await page.getByRole("tab", { name: "İptal İsteği" }).click();
  await expect(page.getByText("Bu türde daha önce istek gönderdiniz")).toBeVisible();
  await expect(page.getByText(/Son istek .* tarihinde iletildi/)).toBeVisible();
});

test("an invalid public token does not expose a form", async ({ page }) => {
  await mockSelfService(page, null);
  await page.goto(`/appointment/track/${publicToken}`);

  await expect(page.getByRole("alert")).toContainText("Randevu takip kaydı bulunamadı");
  await expect(page.getByRole("button", { name: "Değişiklik İsteğini Gönder" })).toHaveCount(0);
});
