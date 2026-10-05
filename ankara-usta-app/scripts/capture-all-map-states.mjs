import { chromium } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

const ARTIFACTS_DIR = 'C:/Users/a-ber/.gemini/antigravity-ide/brain/26d88a0e-8ad6-454c-967d-2c5de61d57cf';

async function main() {
  if (!fs.existsSync(ARTIFACTS_DIR)) {
    fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });

  // 1. Desktop context (1920x1080)
  const desktopContext = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });
  const page = await desktopContext.newPage();

  const dismissCookie = async (p) => {
    try {
      const btn = p.locator('button:has-text("İzin ver"), button:has-text("Kabul Et"), button:has-text("Reddet")').first();
      if (await btn.isVisible({ timeout: 1000 })) {
        await btn.click();
        await p.waitForTimeout(300);
      }
    } catch {}
  };

  console.log('--- 1. Capturing Desktop Split View (1920x1080) ---');
  await page.goto('http://localhost:3000/concepts/harita?view=split', { waitUntil: 'networkidle' });
  await dismissCookie(page);
  await page.waitForTimeout(2000);
  const shot1 = path.join(ARTIFACTS_DIR, 'map_eval_01_desktop_split_overview.png');
  await page.screenshot({ path: shot1, fullPage: false });
  console.log(`Saved: ${shot1}`);

  console.log('--- 2. Capturing Card Hover & Spatial Resonance ---');
  const firstCard = page.locator('article, [class*="cardInteractive"]').first();
  if (await firstCard.isVisible()) {
    await firstCard.hover();
    await page.waitForTimeout(1000);
    const shot2 = path.join(ARTIFACTS_DIR, 'map_eval_02_card_hover_resonance.png');
    await page.screenshot({ path: shot2, fullPage: false });
    console.log(`Saved: ${shot2}`);
  }

  console.log('--- 3. Capturing Map Pin Click & Airbnb Floating Popup ---');
  // Clicking the first card in split view synchronizes map and opens the Airbnb popup
  const firstCardToSelect = page.locator('article, [class*="cardInteractive"]').first();
  if (await firstCardToSelect.isVisible()) {
    await firstCardToSelect.click();
    await page.waitForTimeout(1500);
    const shot3 = path.join(ARTIFACTS_DIR, 'map_eval_03_pin_popup_preview.png');
    await page.screenshot({ path: shot3, fullPage: false });
    console.log(`Saved: ${shot3}`);
  }

  console.log('--- 4. Capturing Map Panning & "Bu bölgede ara" Bounds Filter ---');
  const mapElement = page.locator('.leaflet-container').first();
  if (await mapElement.isVisible()) {
    const box = await mapElement.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2 - 320, box.y + box.height / 2 - 220, { steps: 12 });
      await page.mouse.up();
      await page.waitForTimeout(1500);
      const shot4 = path.join(ARTIFACTS_DIR, 'map_eval_04_spatial_bounds_filtered.png');
      await page.screenshot({ path: shot4, fullPage: false });
      console.log(`Saved: ${shot4}`);
    }
  }

  await desktopContext.close();

  // 2. Mobile context (390x844 iPhone 14 / Mobile standard)
  console.log('--- 5. Capturing Mobile View & Thumb-Zone Action Pill (390x844) ---');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:3000/concepts/harita?view=split', { waitUntil: 'networkidle' });
  await dismissCookie(mobilePage);
  await mobilePage.waitForTimeout(2000);

  // Default half-carousel
  const shot5 = path.join(ARTIFACTS_DIR, 'map_eval_05_mobile_half_carousel.png');
  await mobilePage.screenshot({ path: shot5, fullPage: false });
  console.log(`Saved: ${shot5}`);

  console.log('--- 6. Capturing Mobile Drawer Collapsed (Peek / Full Map Canvas) ---');
  const collapseBtn = mobilePage.locator('button:has-text("Haritayı Gör"), button[aria-label*="daralt"]').first();
  if (await collapseBtn.isVisible()) {
    await collapseBtn.click();
    await mobilePage.waitForTimeout(800);
    const shot6 = path.join(ARTIFACTS_DIR, 'map_eval_06_mobile_drawer_collapsed_thumb_pill.png');
    await mobilePage.screenshot({ path: shot6, fullPage: false });
    console.log(`Saved: ${shot6}`);
  }

  console.log('--- 7. Capturing Mobile Full Drawer List ---');
  // From collapsed or floating pill, restore drawer or expand to full
  const floatingRestoreBtn = mobilePage.locator('[class*="floatingMobileBtn"]').first();
  if (await floatingRestoreBtn.isVisible()) {
    await floatingRestoreBtn.click();
    await mobilePage.waitForTimeout(500);
  }
  const expandToFullBtn = mobilePage.locator('button:has-text("Tüm Liste")').first();
  if (await expandToFullBtn.isVisible()) {
    await expandToFullBtn.click();
    await mobilePage.waitForTimeout(800);
  }
  const shot7 = path.join(ARTIFACTS_DIR, 'map_eval_07_mobile_drawer_expanded.png');
  await mobilePage.screenshot({ path: shot7, fullPage: false });
  console.log(`Saved: ${shot7}`);

  await mobileContext.close();
  await browser.close();
  console.log('All map evaluation screenshots captured successfully!');
}

main().catch(err => {
  console.error('Capture failed:', err);
  process.exit(1);
});
