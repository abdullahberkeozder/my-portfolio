import {expect, test} from '@playwright/test';

test('service search has space, a visible label and reachable action at each viewport', async ({page}) => {
  for (const width of [320, 390, 820, 1440]) {
    await page.setViewportSize({width, height: 900});
    await page.goto('/');
    const search = page.getByRole('textbox', {name: 'İhtiyacınızı yazın'});
    const action = page.getByRole('button', {name: 'Hizmet bul', exact: true});
    const bounds = await search.boundingBox();
    expect(bounds!.width).toBeGreaterThan(width < 600 ? width - 70 : 400);
    expect((await action.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await expect(action).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('unknown service offers recovery and never opens an arbitrary wizard', async ({page}) => {
  await page.goto('/');
  await page.getByRole('textbox', {name: 'İhtiyacınızı yazın'}).fill('zzzzzzzz');
  await page.getByRole('button', {name: 'Hizmet bul', exact: true}).click();
  await page.getByRole('link', {name: 'Kategorilerden hizmet seç'}).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page).toHaveURL(/#services$/);
  const category = page.locator('details[name="service-category"]').filter({hasText: 'Elektrik'});
  await category.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(category).toHaveAttribute('open', '');
  await expect(category.getByRole('button', {name: /Priz ve Anahtar/})).toBeVisible();
});
