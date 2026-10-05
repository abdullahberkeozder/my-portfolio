import { chromium } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

const ARTIFACTS_DIR = 'C:/Users/a-ber/.gemini/antigravity-ide/brain/26d88a0e-8ad6-454c-967d-2c5de61d57cf';

async function main() {
  if (!fs.existsSync(ARTIFACTS_DIR)) {
    fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });

  // 1. Desktop 1440x900 - Card Click -> Map Pan & Floating Airbnb Preview Card
  console.log('1. Navigating to /concepts/harita?view=split (Desktop)...');
  const desktopCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const deskPage = await desktopCtx.newPage();

  const dismissCookie = async (p) => {
    try {
      const btn = p.locator('button:has-text("İzin ver"), button:has-text("Reddet")').first();
      if (await btn.isVisible({ timeout: 1000 })) {
        await btn.click();
        await p.waitForTimeout(300);
      }
    } catch {}
  };

  await deskPage.goto('http://localhost:3000/concepts/harita?view=split', { waitUntil: 'networkidle' });
  await dismissCookie(deskPage);
  await deskPage.waitForTimeout(1000);

  // Click the first card (Hasan Usta)
  const firstCard = deskPage.locator('article.usta-card').first();
  console.log('Clicking first card in left list (Hasan Usta)...');
  await firstCard.click();
  await deskPage.waitForTimeout(1200);

  const desktopCardClickPath = path.join(ARTIFACTS_DIR, 'step5_resonance_desktop_card_click_popup.png');
  await deskPage.screenshot({ path: desktopCardClickPath, fullPage: false });
  console.log(`Saved: ${desktopCardClickPath}`);

  // Also click a pin on the map directly (e.g. Mehmet Usta or another pin)
  console.log('Clicking an unselected map pin directly...');
  const mapPin = deskPage.locator('div[class*="airbnbMapPill"]:not([class*="airbnbMapPillActive"])').first();
  if (await mapPin.isVisible()) {
    await mapPin.click();
    await deskPage.waitForTimeout(1200);
    const desktopPinClickPath = path.join(ARTIFACTS_DIR, 'step5_resonance_desktop_pin_click_popup.png');
    await deskPage.screenshot({ path: desktopPinClickPath, fullPage: false });
    console.log(`Saved: ${desktopPinClickPath}`);
  }

  await desktopCtx.close();

  // 2. Mobile 390x844 - Mobile Two-Way Resonance (Pin Click -> Snap Carousel sync)
  console.log('2. Navigating to /concepts/harita?view=split (Mobile 390x844)...');
  const mobileCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const mobilePage = await mobileCtx.newPage();
  await mobilePage.goto('http://localhost:3000/concepts/harita?view=split', { waitUntil: 'networkidle' });
  await dismissCookie(mobilePage);
  await mobilePage.waitForTimeout(1000);

  // Collapse drawer to peek first
  const collapseBtn = mobilePage.locator('button[aria-label*="Usta çekmecesini daralt"]');
  if (await collapseBtn.isVisible()) {
    await collapseBtn.click();
    await mobilePage.waitForTimeout(500);
  }

  // Click a pin on the mobile map
  const mobilePin = mobilePage.locator('div[class*="airbnbMapPill"]').first();
  if (await mobilePin.isVisible()) {
    console.log('Clicking pin on mobile map...');
    await mobilePin.click();
    await mobilePage.waitForTimeout(1000);

    const mobileResonancePath = path.join(ARTIFACTS_DIR, 'step5_resonance_mobile_pin_to_carousel.png');
    await mobilePage.screenshot({ path: mobileResonancePath, fullPage: false });
    console.log(`Saved: ${mobileResonancePath}`);
  }

  await mobileCtx.close();
  await browser.close();
  console.log('Two-Way Resonance Captures Completed!');
}

main().catch(console.error);
