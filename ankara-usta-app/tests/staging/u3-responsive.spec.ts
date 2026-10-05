import { expect, test } from '@playwright/test';

for (const width of [320, 390, 820, 1440]) {
  test(`directory journey at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/concepts/harita?view=list');

    await expect(page.locator('article.usta-card').first()).toBeVisible();

    const filters = page.getByRole('search', { name: 'Usta filtreleri' });
    await expect(filters).toBeVisible();
    const serviceFilter = page.locator('#service-filter-visible');
    const districtFilter = page.locator('#district-filter-visible');
    await expect(serviceFilter).toBeVisible();
    await expect(districtFilter).toBeVisible();

    await serviceFilter.selectOption('plumbing');
    await expect(page).toHaveURL(/service=plumbing/);
    await districtFilter.selectOption('Çankaya');
    await expect(page).toHaveURL(/district=%C3%87ankaya/);

    const firstCard = page.locator('article.usta-card').first();
    await expect(firstCard).toBeVisible();
    const cardCta = firstCard.getByRole('link', { name: /Profili aç ve talep oluştur/ });
    await expect(cardCta).toBeVisible();
    await expect(firstCard.getByRole('link')).toHaveCount(1);

    for (const control of [serviceFilter, districtFilter, cardCta]) {
      const box = await control.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    }

    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`directory-${width}.png`), fullPage: true });

    await page.goto('/concepts/harita?view=split');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.getByRole('button', { name: /liste/i }).first()).toBeVisible();

    // H0: view selection is a shareable URL state and survives reload/history.
    const mapToggle = page.getByRole('button', { name: /Tam Harita/ }).first();
    if (width >= 820) {
      await mapToggle.click();
    } else {
      await page.goto('/concepts/harita?view=map');
    }
    await expect(page).toHaveURL(/view=map/);
    await page.reload();
    if (width >= 820) {
      await expect(page.getByRole('button', { name: /Tam Harita/ }).first()).toHaveAttribute('aria-pressed', 'true');
    }
    await page.goBack();
    await expect(page).toHaveURL(/view=split/);
    if (width >= 820) {
      await expect(page.getByRole('button', { name: /Bölünmüş Ekran/ }).first()).toHaveAttribute('aria-pressed', 'true');
    }

    const mapRegion = page.getByRole('region', { name: 'Ankara Usta Arama Haritası' });
    await expect(mapRegion).toBeVisible();
    await expect.poll(async () => {
      const map = page.locator('.leaflet-container').first();
      return (await map.boundingBox())?.height ?? 0;
    }).toBeGreaterThan(0);
    await page.screenshot({ path: testInfo.outputPath(`split-${width}.png`), fullPage: false });
  });
}
