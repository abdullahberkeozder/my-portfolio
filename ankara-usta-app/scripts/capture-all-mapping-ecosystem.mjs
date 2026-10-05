import { chromium } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

const ARTIFACTS_DIR = 'C:/Users/a-ber/.gemini/antigravity-ide/brain/26d88a0e-8ad6-454c-967d-2c5de61d57cf';

async function main() {
  if (!fs.existsSync(ARTIFACTS_DIR)) {
    fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });

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

  console.log('--- 1. Capturing Full Canvas Mode (Apple Maps & Wolt standard) ---');
  await page.goto('http://localhost:3000/concepts/harita', { waitUntil: 'networkidle' });
  await dismissCookie(page);
  await page.waitForTimeout(2000);
  const shot1 = path.join(ARTIFACTS_DIR, 'map_eco_01_full_canvas_desktop.png');
  await page.screenshot({ path: shot1, fullPage: false });
  console.log(`Saved: ${shot1}`);

  console.log('--- 2. Capturing 500+ Usta Virtual Windowing Stress View ---');
  await page.goto('http://localhost:3000/concepts/harita?view=split&stress=500', { waitUntil: 'networkidle' });
  await dismissCookie(page);
  await page.waitForTimeout(2000);
  const shot2 = path.join(ARTIFACTS_DIR, 'map_eco_02_stress500_desktop.png');
  await page.screenshot({ path: shot2, fullPage: false });
  console.log(`Saved: ${shot2}`);

  console.log('--- 3. Capturing KVKK 6698 Privacy Masking View (BR-16) ---');
  await page.goto('http://localhost:3000/concepts/harita?view=kvkk', { waitUntil: 'networkidle' });
  await dismissCookie(page);
  await page.waitForTimeout(2000);
  const shot3 = path.join(ARTIFACTS_DIR, 'map_eco_03_kvkk_privacy_desktop.png');
  await page.screenshot({ path: shot3, fullPage: false });
  console.log(`Saved: ${shot3}`);

  console.log('--- 4. Capturing Full Map Tab inside SplitView ---');
  await page.goto('http://localhost:3000/concepts/harita?view=split', { waitUntil: 'networkidle' });
  await dismissCookie(page);
  await page.waitForTimeout(1000);
  const mapTabBtn = page.locator('button:has-text("Tam Harita")').first();
  if (await mapTabBtn.isVisible()) {
    await mapTabBtn.click();
    await page.waitForTimeout(1500);
    const shot4 = path.join(ARTIFACTS_DIR, 'map_eco_04_splitview_maptab_desktop.png');
    await page.screenshot({ path: shot4, fullPage: false });
    console.log(`Saved: ${shot4}`);
  }

  await desktopContext.close();

  // Mobile Context for Full Canvas
  console.log('--- 5. Capturing Full Canvas Mode on Mobile (390x844) ---');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:3000/concepts/harita', { waitUntil: 'networkidle' });
  await dismissCookie(mobilePage);
  await mobilePage.waitForTimeout(2000);
  const shot5 = path.join(ARTIFACTS_DIR, 'map_eco_05_full_canvas_mobile.png');
  await mobilePage.screenshot({ path: shot5, fullPage: false });
  console.log(`Saved: ${shot5}`);

  await mobileContext.close();
  await browser.close();
  console.log('All ecosystem mapping screenshots captured successfully!');
}

main().catch(err => {
  console.error('Capture failed:', err);
  process.exit(1);
});
