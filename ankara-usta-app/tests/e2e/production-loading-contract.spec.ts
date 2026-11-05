import { expect, test } from '@playwright/test';

const viewports = [320, 390, 820, 1440];

async function readCls(page: import('@playwright/test').Page) {
  // Background account/map requests can keep the network active after the view is ready.
  await page.waitForTimeout(1000);
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  return page.evaluate(() => Number((window as Window & { __orkestraCls?: number }).__orkestraCls ?? 0));
}

async function readBox(page: import('@playwright/test').Page, selector: string) {
  return page.locator(selector).boundingBox();
}

for (const width of viewports) {
  test(`production loading stays stable at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.addInitScript(() => {
      const w = window as Window & { __orkestraCls?: number };
      w.__orkestraCls = 0;
      new PerformanceObserver((entries) => {
        for (const entry of entries.getEntries() as (PerformanceEntry & { hadRecentInput?: boolean; value?: number })[]) {
          if (!entry.hadRecentInput) w.__orkestraCls = (w.__orkestraCls ?? 0) + (entry.value ?? 0);
        }
      }).observe({ type: 'layout-shift', buffered: true });
    });

    await page.goto('/');
    const landingCls = await readCls(page);
    expect(landingCls, `landing CLS at ${width}px`).toBeLessThanOrEqual(0.05);

    const searchRow = await readBox(page, '.landing-search-row');
    const searchButton = await readBox(page, '.landing-search-button');
    expect(searchRow).not.toBeNull();
    expect(searchButton).not.toBeNull();
    expect(searchButton!.height, `landing CTA height at ${width}px`).toBeGreaterThanOrEqual(44);
    expect(searchRow!.width).toBeLessThanOrEqual(width);

    if (width <= 390) {
      const dock = await readBox(page, '.privacy-consent-banner');
      expect(dock).not.toBeNull();
      expect(searchButton!.y + searchButton!.height).toBeLessThanOrEqual(dock!.y);
    }

    await page.goto('/ustalar?view=split&fixture=limited');
    await expect(page.getByRole('heading', { level: 1, name: 'İhtiyacınıza uygun ustayı bulun' })).toBeVisible();
    const directoryCls = await readCls(page);
    expect(directoryCls, `/ustalar CLS at ${width}px`).toBeLessThanOrEqual(0.05);
    console.log(`[production-loading] ${testInfo.project.name} ${width}px landing=${landingCls.toFixed(4)} directory=${directoryCls.toFixed(4)}`);

    if (width <= 390) {
      const directoryPrimary = page.getByRole('link', { name: /İhtiyacını anlat/i }).first();
      await expect(directoryPrimary).toBeInViewport();
      const directoryPrimaryBox = await directoryPrimary.boundingBox();
      const recovery = page.getByRole('button', { name: /Tüm Ankara.yı göster/i });
      await expect(recovery).toHaveCount(1);
      await expect(page.getByRole('button', { name: 'Reddet' })).toBeVisible();
      const dock = await readBox(page, '.privacy-consent-banner');
      expect(directoryPrimaryBox).not.toBeNull();
      expect(dock).not.toBeNull();
      expect(directoryPrimaryBox!.y + directoryPrimaryBox!.height).toBeLessThanOrEqual(dock!.y);
      const recoveryBox = await recovery.boundingBox();
      expect(recoveryBox).not.toBeNull();
      const scrollPastDock = recoveryBox!.y + recoveryBox!.height - dock!.y + 12;
      if (scrollPastDock > 0) {
        await page.evaluate((delta) => window.scrollBy(0, delta), scrollPastDock);
      }
      const reachableRecoveryBox = await recovery.boundingBox();
      expect(reachableRecoveryBox).not.toBeNull();
      expect(reachableRecoveryBox!.y + reachableRecoveryBox!.height).toBeLessThanOrEqual(dock!.y);
      await recovery.click();
    }

    const drawerToggle = page.getByRole('button', { name: 'Usta çekmecesini daralt' });
    if (await drawerToggle.count()) {
      const toggleBox = await drawerToggle.boundingBox();
      expect(toggleBox, `drawer toggle at ${width}px`).not.toBeNull();
      expect(toggleBox!.width).toBeGreaterThanOrEqual(44);
      expect(toggleBox!.height).toBeGreaterThanOrEqual(44);
    }
  });
}
