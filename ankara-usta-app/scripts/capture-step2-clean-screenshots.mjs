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
    viewport: { width: 1440, height: 900 },
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

  console.log('1. Navigating to /concepts/harita?view=split...');
  await page.goto('http://localhost:3000/concepts/harita?view=split', { waitUntil: 'networkidle' });
  await dismissCookie();
  await page.waitForTimeout(1000);

  // Take screenshot of split view with clean Airbnb pins and cards
  const splitOverviewPath = path.join(ARTIFACTS_DIR, 'step2_clean_airbnb_pins_and_cards.png');
  await page.screenshot({ path: splitOverviewPath });
  console.log(`Saved: ${splitOverviewPath}`);

  // Hover over a pin on the map to trigger active state (dark cobalt, no yellow ring)
  const pin = page.locator('[class*="airbnbMapPill"]').first();
  if (await pin.isVisible()) {
    await pin.hover();
    await page.waitForTimeout(800);
    const pinHoverPath = path.join(ARTIFACTS_DIR, 'step2_clean_pin_hover_active.png');
    await page.screenshot({ path: pinHoverPath });
    console.log(`Saved: ${pinHoverPath}`);

    // Click the pin to open the clean popup
    await pin.click({ force: true });
    await page.waitForTimeout(800);
    const popupPath = path.join(ARTIFACTS_DIR, 'step2_clean_pin_popup.png');
    await page.screenshot({ path: popupPath });
    console.log(`Saved: ${popupPath}`);
  }

  // Also check mobile view (390x844)
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(800);
  const mobileCleanPath = path.join(ARTIFACTS_DIR, 'step2_clean_mobile_cards.png');
  await page.screenshot({ path: mobileCleanPath });
  console.log(`Saved: ${mobileCleanPath}`);

  await browser.close();
  console.log('Adım 2 capture completed!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
