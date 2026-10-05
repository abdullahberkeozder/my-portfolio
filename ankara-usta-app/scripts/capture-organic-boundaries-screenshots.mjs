import { chromium } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

const ARTIFACTS_DIR = 'C:/Users/a-ber/.gemini/antigravity-ide/brain/26d88a0e-8ad6-454c-967d-2c5de61d57cf';

async function main() {
  if (!fs.existsSync(ARTIFACTS_DIR)) {
    fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });

  const dismissCookie = async (p) => {
    try {
      const btn = p.locator('button:has-text("İzin ver"), button:has-text("Reddet")').first();
      if (await btn.isVisible({ timeout: 1000 })) {
        await btn.click();
        await p.waitForTimeout(300);
      }
    } catch {}
  };

  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();

  // 1. Full Canvas Map - Overview of Organic Boundaries
  console.log('1. Capturing /concepts/harita full canvas with organic boundaries...');
  await page.goto('http://localhost:3000/concepts/harita', { waitUntil: 'networkidle' });
  await dismissCookie(page);
  await page.waitForTimeout(1500);

  const fullOverviewPath = path.join(ARTIFACTS_DIR, 'organic_boundaries_full_canvas_overview.png');
  await page.screenshot({ path: fullOverviewPath, fullPage: false });
  console.log(`Saved: ${fullOverviewPath}`);

  // 2. Select Çankaya via Search Dropdown
  console.log('2. Selecting Çankaya district on /concepts/harita via search...');
  const searchInput = page.locator('input[type="search"]');
  if (await searchInput.isVisible()) {
    await searchInput.fill('Çankaya');
    await page.waitForTimeout(600);
    const resultItem = page.locator('button[class*="searchResultItem"]').first();
    if (await resultItem.isVisible()) {
      await resultItem.click();
      await page.waitForTimeout(2000); // Wait for flyTo animation
    }
  }

  const cankayaSelectedPath = path.join(ARTIFACTS_DIR, 'organic_boundaries_district_selected_cankaya.png');
  await page.screenshot({ path: cankayaSelectedPath, fullPage: false });
  console.log(`Saved: ${cankayaSelectedPath}`);

  // 3. Close-up Curvature Detail
  console.log('3. Capturing close-up detail of smooth Chaikin curves...');
  const zoomInBtn = page.locator('button[aria-label*="Yakınlaştır"], a.leaflet-control-zoom-in');
  if (await zoomInBtn.isVisible()) {
    await zoomInBtn.click();
    await page.waitForTimeout(600);
  }
  const curvesDetailPath = path.join(ARTIFACTS_DIR, 'organic_boundaries_smooth_curves_detail.png');
  await page.screenshot({ path: curvesDetailPath, fullPage: false });
  console.log(`Saved: ${curvesDetailPath}`);

  // 4. Split View Map with Organic Boundaries
  console.log('4. Capturing /concepts/harita?view=split with organic boundaries...');
  await page.goto('http://localhost:3000/concepts/harita?view=split', { waitUntil: 'networkidle' });
  await dismissCookie(page);
  await page.waitForTimeout(1500);

  const splitViewPath = path.join(ARTIFACTS_DIR, 'organic_boundaries_split_view.png');
  await page.screenshot({ path: splitViewPath, fullPage: false });
  console.log(`Saved: ${splitViewPath}`);

  await ctx.close();
  await browser.close();
  console.log('All organic boundaries screenshots successfully captured!');
}

main().catch(console.error);
