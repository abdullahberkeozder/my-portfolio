import { chromium } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

const ARTIFACTS_DIR = 'C:/Users/a-ber/.gemini/antigravity-ide/brain/26d88a0e-8ad6-454c-967d-2c5de61d57cf';

async function main() {
  if (!fs.existsSync(ARTIFACTS_DIR)) {
    fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });

  // 1. Desktop 1440x900 (500+ Usta Virtual Windowing)
  console.log('1. Navigating to /concepts/harita?view=split&stress=500 (Desktop 1440x900)...');
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const desktopPage = await desktopContext.newPage();

  const dismissCookie = async (p) => {
    try {
      const btn = p.locator('button:has-text("İzin ver"), button:has-text("Reddet")').first();
      if (await btn.isVisible({ timeout: 1000 })) {
        await btn.click();
        await p.waitForTimeout(300);
      }
    } catch {}
  };

  await desktopPage.goto('http://localhost:3000/concepts/harita?view=split&stress=500', { waitUntil: 'networkidle' });
  await dismissCookie(desktopPage);
  await desktopPage.waitForTimeout(2000);

  // Capture desktop virtual windowing state (initial 24 cards + 60 FPS badge + sentinel)
  const desktopVirtualPath = path.join(ARTIFACTS_DIR, 'orkestra_harita_virtual_windowing_desktop.png');
  await desktopPage.screenshot({ path: desktopVirtualPath, fullPage: false });
  console.log(`Saved: ${desktopVirtualPath}`);

  // 2. Scroll the left list pane slightly down to view the sentinel and load more hint
  console.log('2. Scrolling left list pane to show virtual sentinel...');
  const listPane = desktopPage.locator('div[role="region"][aria-label="Doğrulanmış Usta Listesi"]');
  if (await listPane.count() > 0) {
    await listPane.evaluate((el) => {
      el.scrollTop = 1200;
    });
    await desktopPage.waitForTimeout(600);
    const scrollSentinelPath = path.join(ARTIFACTS_DIR, 'orkestra_harita_virtual_windowing_scroll.png');
    await desktopPage.screenshot({ path: scrollSentinelPath, fullPage: false });
    console.log(`Saved: ${scrollSentinelPath}`);
  }

  await desktopContext.close();

  // 3. Mobile View (390x844 iPhone 14 Standard)
  console.log('3. Navigating to /concepts/harita?view=split&stress=500 on Mobile (390x844)...');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:3000/concepts/harita?view=split&stress=500', { waitUntil: 'networkidle' });
  await dismissCookie(mobilePage);
  await mobilePage.waitForTimeout(2000);

  const mobileVirtualPath = path.join(ARTIFACTS_DIR, 'orkestra_harita_virtual_windowing_mobile.png');
  await mobilePage.screenshot({ path: mobileVirtualPath, fullPage: false });
  console.log(`Saved: ${mobileVirtualPath}`);

  await mobileContext.close();
  await browser.close();
  console.log('All Faz 5 virtual windowing screenshots captured successfully!');
}

main().catch((err) => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
