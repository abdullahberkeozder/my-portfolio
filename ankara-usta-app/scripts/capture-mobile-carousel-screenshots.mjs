import { chromium } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

const ARTIFACTS_DIR = 'C:/Users/a-ber/.gemini/antigravity-ide/brain/26d88a0e-8ad6-454c-967d-2c5de61d57cf';

async function main() {
  if (!fs.existsSync(ARTIFACTS_DIR)) {
    fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });

  // 1. Mobile Context (390 x 844, Device Scale 2 - iPhone 14 / Mobile standard)
  console.log('--- Capturing Mobile Views (390x844) ---');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobileContext.newPage();

  const dismissCookie = async (page) => {
    try {
      const btn = page.locator('button:has-text("İzin ver"), button:has-text("Reddet")').first();
      if (await btn.isVisible({ timeout: 1000 })) {
        await btn.click();
        await page.waitForTimeout(300);
      }
    } catch {}
  };

  console.log('1. Navigating to /concepts/harita?view=split on mobile...');
  await mobilePage.goto('http://localhost:3000/concepts/harita?view=split', { waitUntil: 'networkidle' });
  await dismissCookie(mobilePage);
  await mobilePage.waitForTimeout(2000);

  // Screenshot 1: Mobile full canvas map with docked bottom drawer carousel
  const mobileCarouselPath = path.join(ARTIFACTS_DIR, 'orkestra_harita_split_view_mobile_carousel.png');
  await mobilePage.screenshot({ path: mobileCarouselPath, fullPage: false });
  console.log(`Saved: ${mobileCarouselPath}`);

  // Screenshot 2: Click on second card to highlight and center it
  console.log('2. Tapping on a mobile usta card...');
  const mobileCards = mobilePage.locator('[class*="mobileCarouselCard"]');
  if (await mobileCards.count() > 1) {
    await mobileCards.nth(1).click();
    await mobilePage.waitForTimeout(1000);
    const selectedCardPath = path.join(ARTIFACTS_DIR, 'orkestra_harita_split_view_mobile_card_selected.png');
    await mobilePage.screenshot({ path: selectedCardPath, fullPage: false });
    console.log(`Saved: ${selectedCardPath}`);
  }

  // Screenshot 3: Collapse drawer to reveal full screen map
  console.log('3. Collapsing mobile drawer...');
  const collapseBtn = mobilePage.locator('button:has-text("Haritayı Gör"), [aria-label*="daralt"]').first();
  if (await collapseBtn.isVisible()) {
    await collapseBtn.click();
    await mobilePage.waitForTimeout(800);
    const collapsedPath = path.join(ARTIFACTS_DIR, 'orkestra_harita_split_view_mobile_collapsed.png');
    await mobilePage.screenshot({ path: collapsedPath, fullPage: false });
    console.log(`Saved: ${collapsedPath}`);
  }

  await mobileContext.close();

  // 2. Tablet Context (820 x 1180 - iPad Air standard)
  console.log('--- Capturing Tablet View (820x1180) ---');
  const tabletContext = await browser.newContext({
    viewport: { width: 820, height: 1180 },
    deviceScaleFactor: 1.5,
  });
  const tabletPage = await tabletContext.newPage();

  console.log('4. Navigating to /concepts/harita?view=split on tablet...');
  await tabletPage.goto('http://localhost:3000/concepts/harita?view=split', { waitUntil: 'networkidle' });
  await dismissCookie(tabletPage);
  await tabletPage.waitForTimeout(2000);

  const tabletPath = path.join(ARTIFACTS_DIR, 'orkestra_harita_split_view_tablet_overview.png');
  await tabletPage.screenshot({ path: tabletPath, fullPage: false });
  console.log(`Saved: ${tabletPath}`);

  await tabletContext.close();
  await browser.close();

  console.log('All responsive mobile/tablet screenshots captured successfully!');
}

main().catch((err) => {
  console.error('Error taking screenshots:', err);
  process.exit(1);
});
