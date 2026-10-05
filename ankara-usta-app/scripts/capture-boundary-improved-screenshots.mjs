import { chromium } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

const ARTIFACTS_DIR = 'C:/Users/a-ber/.gemini/antigravity-ide/brain/26d88a0e-8ad6-454c-967d-2c5de61d57cf';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  const dismissCookie = async () => {
    try {
      const btn = page.locator('button:has-text("İzin ver"), button:has-text("Reddet")').first();
      if (await btn.isVisible({ timeout: 1000 })) {
        await btn.click();
        await page.waitForTimeout(300);
      }
    } catch {}
  };

  console.log('1. Navigating to /concepts/harita (Full Canvas - Improved Hairline Boundaries)...');
  await page.goto('http://localhost:3000/concepts/harita', { waitUntil: 'networkidle' });
  await dismissCookie();
  await page.waitForTimeout(2000);

  const fullPath = path.join(ARTIFACTS_DIR, 'boundary_improved_full_canvas.png');
  await page.screenshot({ path: fullPath, fullPage: false });
  console.log(`Saved: ${fullPath}`);

  console.log('2. Selecting Çankaya (Airbnb Inverted Ambient Focus Mask)...');
  const cankayaBtn = page.locator('button:has-text("Çankaya"), [data-district="cankaya"]').first();
  if (await cankayaBtn.isVisible()) {
    await cankayaBtn.click();
    await page.waitForTimeout(1500);
  } else {
    // click on the map polygon
    const poly = page.locator('path.leaflet-interactive').first();
    if (await poly.isVisible()) {
      await poly.click();
      await page.waitForTimeout(1500);
    }
  }

  const maskPath = path.join(ARTIFACTS_DIR, 'boundary_improved_cankaya_ambient_mask.png');
  await page.screenshot({ path: maskPath, fullPage: false });
  console.log(`Saved: ${maskPath}`);

  console.log('3. Zooming in to street level (Zoom LOD test)...');
  const zoomIn = page.locator('.leaflet-control-zoom-in');
  if (await zoomIn.isVisible()) {
    await zoomIn.click();
    await page.waitForTimeout(700);
    await zoomIn.click();
    await page.waitForTimeout(700);
    await zoomIn.click();
    await page.waitForTimeout(1200);
  }

  const streetPath = path.join(ARTIFACTS_DIR, 'boundary_improved_zoomed_street_clean.png');
  await page.screenshot({ path: streetPath, fullPage: false });
  console.log(`Saved: ${streetPath}`);

  console.log('4. Navigating to /concepts/harita?view=split (Split-View improved)...');
  await page.goto('http://localhost:3000/concepts/harita?view=split', { waitUntil: 'networkidle' });
  await dismissCookie();
  await page.waitForTimeout(2000);

  const splitPath = path.join(ARTIFACTS_DIR, 'boundary_improved_split_view_clean.png');
  await page.screenshot({ path: splitPath, fullPage: false });
  console.log(`Saved: ${splitPath}`);

  await browser.close();
  console.log('Completed capturing improved boundary screenshots.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
