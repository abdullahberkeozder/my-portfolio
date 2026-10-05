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
      const btn = p.locator('button:has-text("İzin ver"), button:has-text("Kabul Et"), button:has-text("Reddet")').first();
      if (await btn.isVisible({ timeout: 800 })) {
        await btn.click();
        await p.waitForTimeout(300);
      }
    } catch {}
  };

  // 1. Desktop context (1440x900)
  const desktop = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await desktop.newPage();

  console.log('--- 1. /concepts/harita Hero View ---');
  await page.goto('http://localhost:3000/concepts/harita', { waitUntil: 'networkidle' });
  await dismissCookie(page);
  await page.waitForTimeout(1500);
  const shot1 = path.join(ARTIFACTS_DIR, 'redesign_01_concepts_harita_hero.png');
  await page.screenshot({ path: shot1, fullPage: false });
  console.log(`Saved: ${shot1}`);

  console.log('--- 2. /concepts/harita Pilot Sanayi & Zanaat Bölgeleri ---');
  const districtSec = page.locator('section, [class*="districtsSection"]').first();
  if (await districtSec.isVisible()) {
    await districtSec.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    const shot2 = path.join(ARTIFACTS_DIR, 'redesign_02_district_cards.png');
    await page.screenshot({ path: shot2, fullPage: false });
    console.log(`Saved: ${shot2}`);
  }

  console.log('--- 3. /concepts/harita?view=split Split View ---');
  await page.goto('http://localhost:3000/concepts/harita?view=split', { waitUntil: 'networkidle' });
  await dismissCookie(page);
  await page.waitForTimeout(1800);
  const shot3 = path.join(ARTIFACTS_DIR, 'redesign_03_split_view_overview.png');
  await page.screenshot({ path: shot3, fullPage: false });
  console.log(`Saved: ${shot3}`);

  console.log('--- 4. Split View Card Hover / Active State ---');
  const firstCard = page.locator('article, [class*="cardInteractive"]').first();
  if (await firstCard.isVisible()) {
    await firstCard.hover();
    await page.waitForTimeout(800);
    const shot4 = path.join(ARTIFACTS_DIR, 'redesign_04_card_hover.png');
    await page.screenshot({ path: shot4, fullPage: false });
    console.log(`Saved: ${shot4}`);
  }

  console.log('--- 5. /ustalar Directory Resilient Integration ---');
  await page.goto('http://localhost:3000/ustalar', { waitUntil: 'networkidle' });
  await dismissCookie(page);
  await page.waitForTimeout(1800);
  const shot5 = path.join(ARTIFACTS_DIR, 'redesign_05_ustalar_directory.png');
  await page.screenshot({ path: shot5, fullPage: false });
  console.log(`Saved: ${shot5}`);

  // 6. Mobile viewport (390x844)
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });
  const mPage = await mobile.newPage();
  console.log('--- 6. Mobile Split View (iPhone 14) ---');
  await mPage.goto('http://localhost:3000/concepts/harita?view=split', { waitUntil: 'networkidle' });
  await dismissCookie(mPage);
  await mPage.waitForTimeout(1800);
  const shot6 = path.join(ARTIFACTS_DIR, 'redesign_06_mobile_split_view.png');
  await mPage.screenshot({ path: shot6, fullPage: false });
  console.log(`Saved: ${shot6}`);

  await browser.close();
  console.log('All verification screenshots captured successfully!');
}

main().catch((err) => {
  console.error('Capture error:', err);
  process.exit(1);
});
