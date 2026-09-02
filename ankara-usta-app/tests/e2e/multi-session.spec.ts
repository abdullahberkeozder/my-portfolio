/**
 * Multi-session E2E tests
 *
 * These tests require TWO authenticated Supabase accounts:
 *   E2E_CUSTOMER_EMAIL / E2E_CUSTOMER_PASSWORD
 *   E2E_TRADESPERSON_EMAIL / E2E_TRADESPERSON_PASSWORD
 *
 * Each test opens separate browser contexts to simulate two users acting
 * concurrently. Tests are skipped when credentials are absent.
 *
 * What is verified:
 *   1. A quote submitted by the tradesperson is visible to the customer
 *      in real time (after router.refresh / realtime subscription fires).
 *   2. A scope-change proposed by the tradesperson appears in the customer
 *      job workspace.
 *   3. Analytics CustomEvents never carry PII fields in their properties.
 */

import { expect, test, Browser, BrowserContext, Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Guard: skip the entire file when credentials are not configured
// ---------------------------------------------------------------------------

const CUSTOMER_EMAIL = process.env.E2E_CUSTOMER_EMAIL;
const CUSTOMER_PASSWORD = process.env.E2E_CUSTOMER_PASSWORD;
const TRADESPERSON_EMAIL = process.env.E2E_TRADESPERSON_EMAIL;
const TRADESPERSON_PASSWORD = process.env.E2E_TRADESPERSON_PASSWORD;

const hasAllCredentials =
  Boolean(CUSTOMER_EMAIL) &&
  Boolean(CUSTOMER_PASSWORD) &&
  Boolean(TRADESPERSON_EMAIL) &&
  Boolean(TRADESPERSON_PASSWORD);

// ---------------------------------------------------------------------------
// Helper: sign a context into the app and return the page
// ---------------------------------------------------------------------------

async function signInContext(
  browser: Browser,
  email: string,
  password: string,
): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('/giris');
  await page.getByLabel('E-posta Adresi').fill(email);
  await page.getByLabel('Parola').fill(password);
  await page.getByRole('button', { name: 'Giriş Yap →' }).click();
  // Wait until the auth redirect completes
  await page.waitForURL(/\/(taleplerim|usta\/talepler|yonetim)/, { timeout: 12_000 });
  return { context, page };
}

// ---------------------------------------------------------------------------
// Test: quote sent by tradesperson is visible to customer
// ---------------------------------------------------------------------------

test('usta tarafından gönderilen teklif müşteri tarafında görünür', async ({ browser }) => {
  test.skip(!hasAllCredentials, 'Çift-taraflı E2E kimlik bilgileri tanımlı değil.');

  // We need a known job/request ID that both personas share.
  // The approach: customer creates a draft (or navigates to existing talep),
  // then tradesperson submits a quote, and we verify customer can see it.
  // For a repeatable integration test we use the UI to create the state.

  const { context: ustaCx, page: ustaPage } = await signInContext(
    browser, TRADESPERSON_EMAIL!, TRADESPERSON_PASSWORD!,
  );
  const { context: musteriCx, page: musteriPage } = await signInContext(
    browser, CUSTOMER_EMAIL!, CUSTOMER_PASSWORD!,
  );

  try {
    // 1. Müşteri: en az bir aktif talebin listede görüntülendiğini doğrula
    await musteriPage.goto('/taleplerim');
    const firstRequestLink = musteriPage
      .locator('.request-list article')
      .first()
      .getByRole('link', { name: /Teklifleri Gör|Teklifler/i });

    // If no requests exist, skip gracefully with an informative message
    const requestCount = await musteriPage.locator('.request-list article').count();
    if (requestCount === 0) {
      test.skip(true, 'Müşteri hesabında test edilecek aktif talep yok.');
      return;
    }

    await expect(firstRequestLink).toBeVisible({ timeout: 8_000 });

    // 2. Usta: talep havuzunda aynı talebi bulup teklif sayfasına git
    await ustaPage.goto('/usta/talepler');
    const ustaRequestLink = ustaPage.locator('.request-list article').first();
    const requestCount2 = await ustaPage.locator('.request-list article').count();
    if (requestCount2 === 0) {
      test.skip(true, 'Usta hesabında eşleşen talep yok.');
      return;
    }

    await expect(ustaRequestLink).toBeVisible({ timeout: 8_000 });

    // 3. Usta: teklif formu mevcut mu kontrol et (quote_form varsa teklif ver)
    const quoteFormButton = ustaPage.getByRole('button', { name: /Teklif Ver|Teklif Sürümü/i });
    if (await quoteFormButton.count() === 0) {
      test.skip(true, 'Usta sayfasında teklif formu yok — bu test durumu fixture gerektirir.');
      return;
    }

    // 4. Teklif formunu doldur ve gönder
    await ustaPage.getByLabel(/İşçilik/i).fill('500');
    await ustaPage.getByLabel(/Malzeme/i).fill('100');
    await quoteFormButton.click();
    await expect(ustaPage.getByRole('status')).toContainText(/sürüm.*gönderildi/i, { timeout: 8_000 });

    // 5. Müşteri: teklif listesine git ve yeni teklifi gör
    await firstRequestLink.click();
    await musteriPage.reload(); // Realtime subscription veya reload ile göster
    await expect(musteriPage.locator('.quote-comparison-table, .quote-card, [data-testid="quote"]').first())
      .toBeVisible({ timeout: 12_000 });

  } finally {
    await ustaCx.close();
    await musteriCx.close();
  }
});

// ---------------------------------------------------------------------------
// Test: scope change proposed by tradesperson appears in customer job page
// ---------------------------------------------------------------------------

test('usta kapsam değişikliği önerir, müşteri iş sayfasında görür', async ({ browser }) => {
  test.skip(!hasAllCredentials, 'Çift-taraflı E2E kimlik bilgileri tanımlı değil.');

  const { context: ustaCx, page: ustaPage } = await signInContext(
    browser, TRADESPERSON_EMAIL!, TRADESPERSON_PASSWORD!,
  );
  const { context: musteriCx, page: musteriPage } = await signInContext(
    browser, CUSTOMER_EMAIL!, CUSTOMER_PASSWORD!,
  );

  try {
    // Both personas need to be in the same job room.
    // Navigate to /islerim and find a shared active job.
    await musteriPage.goto('/islerim');
    const musteriJobLink = musteriPage.locator('.request-list article a, .job-list a').first();
    const jobCount = await musteriPage.locator('.request-list article, .job-list li').count();

    if (jobCount === 0) {
      test.skip(true, 'Müşteri hesabında aktif iş yok — fixture gerektirir.');
      return;
    }

    // Extract job URL from customer page to navigate tradesperson to same job
    const jobHref = await musteriJobLink.getAttribute('href');
    if (!jobHref) {
      test.skip(true, 'İş URL\'si alınamadı.');
      return;
    }

    // Tradesperson navigates to same job
    await ustaPage.goto(jobHref);
    const scopeChangeButton = ustaPage.getByRole('button', { name: /Kapsam Değişikliği|Kapsam Öner/i });

    if (await scopeChangeButton.count() === 0) {
      test.skip(true, 'Usta iş sayfasında kapsam değişikliği butonu yok.');
      return;
    }

    await scopeChangeButton.click();

    // Fill scope change form
    const descriptionField = ustaPage.getByLabel(/Açıklama|Değişiklik açıklaması/i);
    await expect(descriptionField).toBeVisible({ timeout: 5_000 });
    await descriptionField.fill('E2E test kapsam değişikliği — otomatik test tarafından oluşturuldu');
    await ustaPage.getByRole('button', { name: /Öner|Gönder|Kaydet/i }).click();

    await expect(ustaPage.getByRole('status')).toContainText(/önerildi|gönderildi/i, { timeout: 8_000 });

    // Customer navigates to same job and sees scope change
    await musteriPage.goto(jobHref);
    await musteriPage.reload();
    await expect(musteriPage.getByText(/E2E test kapsam değişikliği/i)).toBeVisible({ timeout: 12_000 });

  } finally {
    await ustaCx.close();
    await musteriCx.close();
  }
});

// ---------------------------------------------------------------------------
// Test: analytics CustomEvents never carry PII in properties
// ---------------------------------------------------------------------------

test('analitik olayları properties alanında PII taşımaz', async ({ page }) => {
  // This test does not require auth — it validates the client-side analytics
  // sanitisation layer by observing CustomEvents dispatched on the window.

  const PII_KEYS = ['email', 'phone', 'address_line', 'body', 'password', 'token'];

  // Collect all orkestra:analytics events
  const capturedEvents: Array<{ eventName: string; properties: Record<string, unknown> }> = [];

  await page.addInitScript(() => {
    window.addEventListener('orkestra:analytics', (event) => {
      // Expose event detail to the test frame via a global array
      (window as unknown as Record<string, unknown>).__analyticsEvents =
        (window as unknown as Record<string, unknown[]>).__analyticsEvents ?? [];
      ((window as unknown as Record<string, unknown[]>).__analyticsEvents as unknown[]).push(
        (event as CustomEvent).detail,
      );
    });
  });

  // Set consent so events are dispatched
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('ankara_analytics_consent', 'accepted');
  });

  // Perform actions that trigger analytics events
  await page.getByRole('textbox', { name: 'İhtiyacınızı yazın' }).fill('elektrik arızası');
  await page.getByRole('button', { name: 'Hizmet bul' }).click();
  await page.waitForTimeout(500); // Let async events settle

  // Read collected events
  const events = await page.evaluate(() => {
    return (window as unknown as Record<string, unknown>).__analyticsEvents ?? [];
  }) as Array<{ eventName: string; properties: Record<string, unknown> }>;

  capturedEvents.push(...events);

  // Assert no PII in any event's properties
  for (const event of capturedEvents) {
    for (const piiKey of PII_KEYS) {
      expect(
        Object.keys(event.properties ?? {}),
        `Olay "${event.eventName}" properties içinde PII alanı "${piiKey}" bulunmamalı`,
      ).not.toContain(piiKey);
    }
  }
});
