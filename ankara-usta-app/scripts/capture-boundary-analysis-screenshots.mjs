import { chromium } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

const ARTIFACTS_DIR = 'C:/Users/a-ber/.gemini/antigravity-ide/brain/26d88a0e-8ad6-454c-967d-2c5de61d57cf';

async function main() {
  if (!fs.existsSync(ARTIFACTS_DIR)) {
    fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  }

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

  console.log('1. Navigating to /concepts/harita (Full canvas overview)...');
  await page.goto('http://localhost:3000/concepts/harita', { waitUntil: 'networkidle' });
  await dismissCookie();
  await page.waitForTimeout(2000);

  const fullOverviewPath = path.join(ARTIFACTS_DIR, 'boundary_analysis_full_canvas_overview.png');
  await page.screenshot({ path: fullOverviewPath, fullPage: false });
  console.log(`Saved: ${fullOverviewPath}`);

  console.log('2. Selecting Çankaya district to inspect boundary geometry...');
  // Click on Çankaya filter pill or polygon
  const cankayaBtn = page.locator('button:has-text("Çankaya"), [data-district="cankaya"]').first();
  if (await cankayaBtn.isVisible()) {
    await cankayaBtn.click();
    await page.waitForTimeout(1500);
  } else {
    // try clicking SVG polygon or dropdown
    const polygon = page.locator('path.leaflet-interactive').first();
    if (await polygon.isVisible()) {
      await polygon.click();
      await page.waitForTimeout(1500);
    }
  }

  const cankayaSelectedPath = path.join(ARTIFACTS_DIR, 'boundary_analysis_cankaya_geometric_edges.png');
  await page.screenshot({ path: cankayaSelectedPath, fullPage: false });
  console.log(`Saved: ${cankayaSelectedPath}`);

  console.log('3. Zooming in on Çankaya boundary to observe alignment with streets/topography...');
  // Zoom in using leaflet zoom button
  const zoomInBtn = page.locator('.leaflet-control-zoom-in');
  if (await zoomInBtn.isVisible()) {
    await zoomInBtn.click();
    await page.waitForTimeout(800);
    await zoomInBtn.click();
    await page.waitForTimeout(1200);
  }

  const zoomedBoundaryPath = path.join(ARTIFACTS_DIR, 'boundary_analysis_polygon_vertices_revealed.png');
  await page.screenshot({ path: zoomedBoundaryPath, fullPage: false });
  console.log(`Saved: ${zoomedBoundaryPath}`);

  console.log('4. Navigating to /concepts/harita?view=split (Split-View)...');
  await page.goto('http://localhost:3000/concepts/harita?view=split', { waitUntil: 'networkidle' });
  await dismissCookie();
  await page.waitForTimeout(2000);

  // Zoom in a bit on the split view map
  const splitZoomIn = page.locator('.leaflet-control-zoom-in');
  if (await splitZoomIn.isVisible()) {
    await splitZoomIn.click();
    await page.waitForTimeout(1000);
  }

  const splitViewZoomedPath = path.join(ARTIFACTS_DIR, 'boundary_analysis_split_view_zoomed.png');
  await page.screenshot({ path: splitViewZoomedPath, fullPage: false });
  console.log(`Saved: ${splitViewZoomedPath}`);

  await browser.close();
  console.log('Finished capturing boundary analysis screenshots successfully.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
