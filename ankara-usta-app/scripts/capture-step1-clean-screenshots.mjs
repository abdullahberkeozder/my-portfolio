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

  // Select Çankaya or Etimesgut in district select
  const districtSelect = page.locator('select').nth(1); // Second select is District
  if (await districtSelect.isVisible()) {
    await districtSelect.selectOption({ label: 'Çankaya' });
    await page.waitForTimeout(1500);
  }

  const splitCankayaPath = path.join(ARTIFACTS_DIR, 'step1_clean_split_cankaya_selected.png');
  await page.screenshot({ path: splitCankayaPath });
  console.log(`Saved: ${splitCankayaPath}`);

  // Also select Etimesgut
  if (await districtSelect.isVisible()) {
    await districtSelect.selectOption({ label: 'Etimesgut' });
    await page.waitForTimeout(1500);
  }

  const splitEtimesgutPath = path.join(ARTIFACTS_DIR, 'step1_clean_split_etimesgut_selected.png');
  await page.screenshot({ path: splitEtimesgutPath });
  console.log(`Saved: ${splitEtimesgutPath}`);

  console.log('2. Navigating to /concepts/harita (Full Canvas)...');
  await page.goto('http://localhost:3000/concepts/harita', { waitUntil: 'networkidle' });
  await dismissCookie();
  await page.waitForTimeout(1500);

  // Click on a district polygon or search
  const searchInput = page.locator('input[placeholder*="ara"]').first();
  if (await searchInput.isVisible()) {
    await searchInput.fill('Çankaya');
    await page.waitForTimeout(1200);
  }

  const fullCanvasCleanPath = path.join(ARTIFACTS_DIR, 'step1_clean_full_canvas_cankaya.png');
  await page.screenshot({ path: fullCanvasCleanPath });
  console.log(`Saved: ${fullCanvasCleanPath}`);

  await browser.close();
  console.log('Capture finished successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
