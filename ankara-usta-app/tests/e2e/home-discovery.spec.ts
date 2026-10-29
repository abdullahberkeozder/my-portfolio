import {expect, test} from '@playwright/test';

test('service search has space, a visible label and reachable action at each viewport', async ({page}) => {
  for (const width of [320, 390, 820, 1440]) {
    await page.setViewportSize({width, height: 900});
    await page.goto('/');
    const search = page.getByRole('textbox', {name: 'İhtiyacınızı yazın'});
    const action = page.getByRole('button', {name: /^(Hizmet bul|Bul)$/i});
    const row = page.locator('.landing-search-row');
    await expect(search).toBeVisible();
    const label = page.locator('label[for="service-search-input"]');
    await expect(label).toBeVisible();
    expect((await label.boundingBox())!.height).toBeGreaterThan(16);
    await expect(action).toBeVisible();
    const bounds = await search.boundingBox();
    const rowBounds = await row.boundingBox();
    expect(rowBounds).not.toBeNull();
    expect(rowBounds!.width).toBeGreaterThanOrEqual(width < 600 ? width - 52 : 500);
    expect(bounds!.width).toBeGreaterThanOrEqual(width < 600 ? 180 : 300);
    expect((await action.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await expect(action).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('district navigation stays visible and service disclosure is keyboard operable', async ({page}) => {
  await page.goto('/');
  const districts = page.getByRole('navigation', {name: 'İlçelere göre usta listesi'});
  await expect(districts.getByRole('link', {name: 'Çankaya', exact: true})).toBeVisible();
  const summary = page.locator('#services summary');
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#services details')).toHaveAttribute('open', '');
  await page.keyboard.press('Enter');
  await expect(page.locator('#services details')).not.toHaveAttribute('open', '');
});

test('unknown service offers recovery and never opens an arbitrary wizard', async ({page}) => {
  await page.goto('/');
  await page.getByRole('textbox', {name: 'İhtiyacınızı yazın'}).fill('zzzzzzzz');
  await page.getByRole('button', {name: /^(Hizmet bul|Bul)$/i}).click();
  await page.getByRole('link', {name: 'Kategorilerden hizmet seç'}).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page).toHaveURL(/#services$/);
  const category = page.locator('details[name="service-category"]').filter({hasText: 'Elektrik'});
  await category.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(category).toHaveAttribute('open', '');
  await expect(category.getByRole('button', {name: /Priz ve Anahtar/})).toBeVisible();
});

test('landing exposes the canonical map discovery bridge', async ({ page }) => {
  await page.goto('/');
  const bridge = page.getByRole('link', { name: 'Tüm ustaları haritada gör' });
  await expect(bridge).toHaveAttribute('href', '/ustalar?view=split&sort=recommended');
  await Promise.all([
    page.waitForURL(/\/ustalar\?view=split&sort=recommended/),
    bridge.click(),
  ]);
  await expect(page).toHaveURL(/\/ustalar\?view=split&sort=recommended/);
});
