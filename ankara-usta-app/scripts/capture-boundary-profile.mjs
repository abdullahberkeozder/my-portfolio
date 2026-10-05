import { chromium } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

const ARTIFACTS_DIR = 'C:/Users/a-ber/.gemini/antigravity-ide/brain/26d88a0e-8ad6-454c-967d-2c5de61d57cf';

async function main() {
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

  console.log('Navigating to /ustalar...');
  await page.goto('http://localhost:3000/ustalar', { waitUntil: 'networkidle' });
  await dismissCookie();
  await page.waitForTimeout(1500);

  // Find first profile link
  const profileLink = page.locator('a[href*="/ustalar/"]').first();
  if (await profileLink.isVisible()) {
    const href = await profileLink.getAttribute('href');
    console.log(`Navigating to profile: ${href}...`);
    await page.goto(`http://localhost:3000${href}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Scroll down to the service area map
    const mapSection = page.locator('[class*="serviceAreaMap"], [class*="map"], #service-area-map').first();
    if (await mapSection.isVisible()) {
      await mapSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
    }

    const profileMapPath = path.join(ARTIFACTS_DIR, 'boundary_analysis_artisan_profile_map.png');
    await page.screenshot({ path: profileMapPath, fullPage: false });
    console.log(`Saved: ${profileMapPath}`);
  }

  await browser.close();
}

main().catch(console.error);
