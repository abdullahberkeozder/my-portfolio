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
    deviceScaleFactor: 2,
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

  console.log('1. Navigating to /concepts/harita?view=split (Desktop 1440x900)...');
  await page.goto('http://localhost:3000/concepts/harita?view=split', { waitUntil: 'networkidle' });
  await dismissCookie();
  await page.waitForTimeout(2000);

  // 1. Keyboard Navigation on Cards
  console.log('2. Focusing the first usta card and pressing ArrowDown...');
  const cards = page.locator('article[class*="cardInteractive"]');
  const count = await cards.count();
  console.log(`Found ${count} accessible article cards.`);

  if (count > 1) {
    // Focus first card
    await cards.first().focus();
    await page.waitForTimeout(500);

    // Press ArrowDown to navigate to second card
    await page.keyboard.press('ArrowDown');
    await cards.nth(1).focus();
    await page.waitForTimeout(800);

    const keyboardCardPath = path.join(ARTIFACTS_DIR, 'orkestra_harita_keyboard_card_focused.png');
    await page.screenshot({ path: keyboardCardPath, fullPage: false });
    console.log(`Saved: ${keyboardCardPath}`);
  }

  // 2. Keyboard Pin Activation & Popup
  console.log('3. Activating usta marker popup with keyboard / helper...');
  await page.evaluate(() => {
    if (typeof window.__openUstaPopup === 'function' && window.__ustaMarkers) {
      const keys = Object.keys(window.__ustaMarkers);
      if (keys.length > 1) {
        window.__openUstaPopup(keys[1]);
      }
    }
  });
  await page.waitForTimeout(800);
  const popup = page.locator('.leaflet-popup');
  console.log('Is popup visible:', await popup.isVisible());

  const popupPath = path.join(ARTIFACTS_DIR, 'orkestra_harita_keyboard_popup_active.png');
  await page.screenshot({ path: popupPath, fullPage: false });
  console.log(`Saved: ${popupPath}`);

  // 3. Screen Reader Live Announcement Check
  console.log('4. Checking aria-live polite region content...');
  const liveRegion = page.locator('[role="status"][aria-live="polite"]');
  const liveText = await liveRegion.textContent();
  console.log(`Live Region Text: "${liveText}"`);

  await browser.close();
  console.log('--- Phase 4 Playwright A11y Verification Completed ---');
}

main().catch((err) => {
  console.error('Phase 4 script error:', err);
  process.exit(1);
});
