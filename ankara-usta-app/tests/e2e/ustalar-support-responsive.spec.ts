import { expect, test } from '@playwright/test';

const viewports = [320, 390, 820, 1440];

function boxesOverlap(a: { x: number; y: number; width: number; height: number }, b: { x: number; y: number; width: number; height: number }) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

for (const width of viewports) {
  test(`/ustalar support and heading remain usable at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.addInitScript(() => localStorage.setItem('ankara_analytics_consent', 'rejected'));
    await page.goto('/ustalar?view=split&fixture=limited');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('İhtiyacınıza uygun ustayı bulun');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

    const support = page.locator('.supportPillWrapper');
    const supportIsRendered = await support.count() > 0;
    if (width <= 767) {
      // The expanded drawer owns the mobile action zone; support must not sit
      // above card controls while it is open.
      await expect(support).toBeHidden();

      const drawerCollapse = page.getByRole('button', { name: 'Usta çekmecesini daralt' });
      await expect(drawerCollapse).toBeVisible();
      await drawerCollapse.click();

      const floatingCtaButton = page.getByRole('button', { name: 'Mobil usta listesini göster' });
      await expect(floatingCtaButton).toBeVisible();
      const floatingCta = floatingCtaButton.locator('..');
      if (supportIsRendered) {
        await expect(support).toBeVisible();
        const supportBox = await support.boundingBox();
        const ctaBox = await floatingCta.boundingBox();
        expect(supportBox && ctaBox && boxesOverlap(supportBox, ctaBox)).toBe(false);
      }

      await floatingCtaButton.click();
      if (supportIsRendered) await expect(support).toBeHidden();
    } else {
      if (supportIsRendered) await expect(support).toBeVisible();
    }

    await page.goto('/ustalar?view=map&fixture=limited');
    await expect(page.getByRole('heading', { level: 2, name: 'Ustalar' })).toBeVisible();
    await expect(page.getByText(/gösteriliyor$/)).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath(`ustalar-${width}.png`), fullPage: true });
  });
}
