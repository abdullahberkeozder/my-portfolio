import { expect, test } from '@playwright/test';

const viewports = [320, 390, 820, 1440];

async function readCls(page: import('@playwright/test').Page) {
  await page.waitForLoadState('networkidle');
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

    await page.goto('/ustalar?view=split&fixture=limited');
    const directoryCls = await readCls(page);
    expect(directoryCls, `/ustalar CLS at ${width}px`).toBeLessThanOrEqual(0.05);
    console.log(`[production-loading] ${testInfo.project.name} ${width}px landing=${landingCls.toFixed(4)} directory=${directoryCls.toFixed(4)}`);

    const drawerToggle = page.getByRole('button', { name: 'Usta çekmecesini daralt' });
    if (await drawerToggle.count()) {
      const toggleBox = await drawerToggle.boundingBox();
      expect(toggleBox, `drawer toggle at ${width}px`).not.toBeNull();
      expect(toggleBox!.width).toBeGreaterThanOrEqual(44);
      expect(toggleBox!.height).toBeGreaterThanOrEqual(44);
    }
  });
}
