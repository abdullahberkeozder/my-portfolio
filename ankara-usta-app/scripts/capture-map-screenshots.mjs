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

  // Helper to dismiss cookie banner
  const dismissCookie = async () => {
    try {
      const btn = page.locator('button:has-text("İzin ver"), button:has-text("Reddet")').first();
      if (await btn.isVisible({ timeout: 1000 })) {
        await btn.click();
        await page.waitForTimeout(300);
      }
    } catch {}
  };

  console.log('1. Navigating to /concepts/harita (Full Canvas view)...');
  await page.goto('http://localhost:3000/concepts/harita', { waitUntil: 'networkidle' });
  await dismissCookie();
  await page.waitForTimeout(1500);
  const fullCanvasPath = path.join(ARTIFACTS_DIR, 'orkestra_harita_full_canvas_overview.png');
  await page.screenshot({ path: fullCanvasPath, fullPage: false });
  console.log(`Saved: ${fullCanvasPath}`);

  console.log('2. Navigating to /concepts/harita?view=split (Split-View overview)...');
  await page.goto('http://localhost:3000/concepts/harita?view=split', { waitUntil: 'networkidle' });
  await dismissCookie();
  await page.waitForTimeout(2000);
  const splitOverviewPath = path.join(ARTIFACTS_DIR, 'orkestra_harita_split_view_1920_overview.png');
  await page.screenshot({ path: splitOverviewPath, fullPage: false });
  console.log(`Saved: ${splitOverviewPath}`);

  console.log('3. Hovering over first usta card for spatial resonance...');
  const firstCard = page.locator('article, [class*="splitCard"], [class*="card"]').first();
  if (await firstCard.isVisible()) {
    await firstCard.hover();
    await page.waitForTimeout(800);
    const hoverPath = path.join(ARTIFACTS_DIR, 'orkestra_harita_split_view_card_hover_resonance.png');
    await page.screenshot({ path: hoverPath, fullPage: false });
    console.log(`Saved: ${hoverPath}`);
  }

  console.log('4. Clicking on an actual usta pill marker on the map to trigger Airbnb usta preview card popup...');
  const ustaPill = page.locator('[class*="airbnbMapPill"]').first();
  if (await ustaPill.isVisible({ timeout: 4000 })) {
    await ustaPill.click({ force: true });
    await page.waitForTimeout(1000);
    const previewPopupPath = path.join(ARTIFACTS_DIR, 'orkestra_harita_split_view_pin_preview_card.png');
    await page.screenshot({ path: previewPopupPath, fullPage: false });
    console.log(`Saved: ${previewPopupPath}`);
  } else {
    console.warn('Could not find airbnbMapPill element');
  }

  console.log('4.5. Dragging map to test spatial bounding-box filter...');
  const mapElement = page.locator('.leaflet-container').first();
  if (await mapElement.isVisible()) {
    const box = await mapElement.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2 - 260, box.y + box.height / 2 - 200, { steps: 10 });
      await page.mouse.up();
      await page.waitForTimeout(1200);
      const spatialFilteredPath = path.join(ARTIFACTS_DIR, 'orkestra_harita_split_view_spatial_filtered.png');
      await page.screenshot({ path: spatialFilteredPath, fullPage: false });
      console.log(`Saved: ${spatialFilteredPath}`);
    }
  }

  console.log('5. Clicking expand button [Büyüt] for full-screen map...');
  const expandBtn = page.locator('button:has-text("Büyüt"), [aria-label*="Büyüt"], button:has-text("⤢")').first();
  if (await expandBtn.isVisible()) {
    await expandBtn.click();
    await page.waitForTimeout(1200);
    const expandedPath = path.join(ARTIFACTS_DIR, 'orkestra_harita_split_view_expanded_fullscreen.png');
    await page.screenshot({ path: expandedPath, fullPage: false });
    console.log(`Saved: ${expandedPath}`);
  }

  console.log('6. Navigating to /ustalar (Directory route)...');
  await page.goto('http://localhost:3000/ustalar', { waitUntil: 'networkidle' });
  await dismissCookie();
  await page.waitForTimeout(1500);
  const ustalarPath = path.join(ARTIFACTS_DIR, 'orkestra_ustalar_directory_live.png');
  await page.screenshot({ path: ustalarPath, fullPage: false });
  console.log(`Saved: ${ustalarPath}`);

  await browser.close();
  console.log('All screenshots captured successfully!');
}

main().catch((err) => {
  console.error('Error taking screenshots:', err);
  process.exit(1);
});
