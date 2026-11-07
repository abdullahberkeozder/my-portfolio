import { expect, test } from '@playwright/test';

const viewports = [
  { name: 'mobile-320', width: 320, height: 900 },
  { name: 'mobile-390', width: 390, height: 900 },
  { name: 'tablet-820', width: 820, height: 1000 },
  { name: 'desktop-1440', width: 1440, height: 960 },
] as const;

test.describe.configure({ mode: 'serial' });

test('milestone button toggles exactly once with Enter and Space', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.addInitScript(() => localStorage.setItem('ankara_analytics_consent', 'rejected'));
  await page.goto('/ustalar?fixture=milestones&view=split&sort=recommended');

  const trigger = page.locator('button[aria-label*="Selin Usta: 50 iş tamamladı"]:visible').first();
  const panel = page.getByRole('region', { name: '50 iş tamamladı' });
  await trigger.scrollIntoViewIfNeeded();
  await trigger.focus();
  await expect(trigger).toBeFocused();

  await trigger.press('Enter');
  await expect(panel).toBeVisible();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await trigger.press('Enter');
  await expect(panel).toBeHidden();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');

  await trigger.press('Space');
  await expect(panel).toBeVisible();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await trigger.press('Space');
  await expect(panel).toBeHidden();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');

  await trigger.press('Enter');
  await expect(panel).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(trigger).toBeFocused();
});

for (const viewport of viewports) {
  test(`milestone panels stay inside the viewport at ${viewport.width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.addInitScript(() => localStorage.setItem('ankara_analytics_consent', 'rejected'));
    await page.goto('/ustalar?fixture=milestones&view=split&sort=recommended');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('İhtiyacınıza uygun ustayı bulun');
    await expect(page.locator('button[aria-label*="Deniz Usta: 5 iş tamamladı"]:visible').first()).toBeVisible();
    await expect(page.locator('button[aria-label*="Mert Usta: 20 iş tamamladı"]:visible').first()).toBeVisible();
    await expect(page.locator('button[aria-label*="Selin Usta: 50 iş tamamladı"]:visible').first()).toBeVisible();
    await expect(page.locator('button[aria-label*="Eren Usta:"][aria-label*="iş tamamladı"]')).toHaveCount(0);

    const trigger = page.locator('button[aria-label*="Selin Usta: 50 iş tamamladı"]:visible').first();
    await trigger.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await trigger.click();

    const panel = page.getByRole('region', { name: '50 iş tamamladı' });
    await expect(panel).toBeVisible();
    const panelBox = await panel.boundingBox();
    expect(panelBox).not.toBeNull();
    expect(panelBox!.x).toBeGreaterThanOrEqual(15);
    expect(panelBox!.y).toBeGreaterThanOrEqual(15);
    expect(panelBox!.x + panelBox!.width).toBeLessThanOrEqual(viewport.width - 15);
    expect(panelBox!.y + panelBox!.height).toBeLessThanOrEqual(viewport.height - 15);

    await page.screenshot({
      path: testInfo.outputPath(`ustalar-milestones-${viewport.name}.png`),
      fullPage: false,
    });

    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
    await expect(trigger).toBeFocused();
  });
}
