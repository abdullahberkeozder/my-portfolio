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
    viewport: { width: 390, height: 844 }, // iPhone 14 mobile standard
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

  console.log('1. Navigating to /concepts/harita?view=split (Mobile)...');
  await page.goto('http://localhost:3000/concepts/harita?view=split', { waitUntil: 'networkidle' });
  await dismissCookie();
  await page.waitForTimeout(1000);

  // Snap 2: Default Half (Carousel) Mode
  const halfSnapPath = path.join(ARTIFACTS_DIR, 'step4_mobile_snap_half_carousel.png');
  await page.screenshot({ path: halfSnapPath });
  console.log(`Saved: ${halfSnapPath}`);

  // Snap 1: Peek Mode (Collapsed, Map has 85% view)
  const collapseBtn = page.locator('button[aria-label*="Usta çekmecesini daralt"]');
  if (await collapseBtn.isVisible()) {
    await collapseBtn.click();
    await page.waitForTimeout(500);
    const peekSnapPath = path.join(ARTIFACTS_DIR, 'step4_mobile_snap_peek_map_open.png');
    await page.screenshot({ path: peekSnapPath });
    console.log(`Saved: ${peekSnapPath}`);

    // Reopen to half
    const openBtn = page.locator('button[aria-label*="Usta çekmecesini aç"]');
    await openBtn.click();
    await page.waitForTimeout(500);
  }

  // Snap 3: Full Mode (Expanded Vertical List)
  const fullListBtn = page.locator('button:has-text("Tüm Liste")');
  if (await fullListBtn.isVisible()) {
    await fullListBtn.click();
    await page.waitForTimeout(500);
    const fullSnapPath = path.join(ARTIFACTS_DIR, 'step4_mobile_snap_full_list.png');
    await page.screenshot({ path: fullSnapPath });
    console.log(`Saved: ${fullSnapPath}`);
  }

  await browser.close();
  console.log('Adım 4 capture completed!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
