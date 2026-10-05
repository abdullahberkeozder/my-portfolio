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

  const splitIslandPath = path.join(ARTIFACTS_DIR, 'step3_clean_floating_search_island.png');
  await page.screenshot({ path: splitIslandPath });
  console.log(`Saved: ${splitIslandPath}`);

  console.log('2. Navigating to /concepts/harita (full canvas)...');
  await page.goto('http://localhost:3000/concepts/harita', { waitUntil: 'networkidle' });
  await dismissCookie();
  await page.waitForTimeout(1000);

  const fullMapPath = path.join(ARTIFACTS_DIR, 'step3_clean_full_map.png');
  await page.screenshot({ path: fullMapPath });
  console.log(`Saved: ${fullMapPath}`);

  console.log('3. Navigating to mobile view (390x844)...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:3000/concepts/harita?view=split', { waitUntil: 'networkidle' });
  await dismissCookie();
  await page.waitForTimeout(1000);

  const mobileCleanPath = path.join(ARTIFACTS_DIR, 'step3_clean_mobile_header.png');
  await page.screenshot({ path: mobileCleanPath });
  console.log(`Saved: ${mobileCleanPath}`);

  await browser.close();
  console.log('Adım 3 capture completed!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
