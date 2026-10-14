import { expect, test } from '@playwright/test';

test('admin operations surfaces remain task-focused and responsive', async ({ page }, info) => {
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;
  if (!email || !password) throw new Error('Missing isolated admin credentials.');

  await page.goto('/giris?next=%2Fyonetim%2Fuyusmazliklar');
  await page.getByLabel('E-posta Adresi').fill(email);
  await page.getByLabel('Parola', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Giriş Yap →', exact: true }).click();
  await page.waitForURL(/\/yonetim\/uyusmazliklar$/);

  const consent = page.getByRole('button', { name: 'Reddet' });
  if (await consent.isVisible()) await consent.click();

  for (const route of ['/yonetim/uyusmazliklar', '/yonetim/moderasyon', '/yonetim/denetim-izi']) {
    await page.goto(route);
    await expect(page.locator('nav[aria-label="Yönetim bölümleri"]')).toBeAttached();
    for (const width of [320, 390, 820, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => window.scrollTo(0, 0));
      if (width <= 390) await expect(page.getByRole('navigation', { name: 'Yönetim bölümleri' })).toBeVisible();
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await page.screenshot({ path: info.outputPath(`${route.split('/').pop()}-${width}.png`), fullPage: true });
    }
  }

  await page.goto('/yonetim/uyusmazliklar');
  const caseLink = page.locator('a[href^="/yonetim/uyusmazliklar/"]').first();
  if (await caseLink.count()) {
    await caseLink.click();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Durum ve taraf iletişimi' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  } else {
    test.info().annotations.push({ type: 'known-limit', description: 'Staging admin queue has no dispute detail fixture.' });
  }

  await page.goto('/yonetim/denetim-izi');
  const auditLink = page.getByRole('link', { name: 'Uyuşmazlıklar' }).last();
  await auditLink.focus();
  await expect(auditLink).toBeFocused();
});
