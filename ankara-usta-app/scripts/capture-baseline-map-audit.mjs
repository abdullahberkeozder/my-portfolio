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

  console.log('Navigating to http://localhost:3000/concepts/harita?view=split...');
  await page.goto('http://localhost:3000/concepts/harita?view=split', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // 1. Overall full page
  const fullOverview = path.join(ARTIFACTS_DIR, 'current_01_split_overview.png');
  await page.screenshot({ path: fullOverview, fullPage: false });
  console.log('Captured fullOverview:', fullOverview);

  // 2. Lab header console close-up
  const headerEl = page.locator('header').first();
  if (await headerEl.isVisible()) {
    const headerPath = path.join(ARTIFACTS_DIR, 'current_02_header_console.png');
    await headerEl.screenshot({ path: headerPath });
    console.log('Captured headerEl:', headerPath);
  }

  // 3. View mode & summary bar close-up
  const viewModeEl = page.locator('[class*="viewModeHeader"]').first();
  if (await viewModeEl.isVisible()) {
    const viewModePath = path.join(ARTIFACTS_DIR, 'current_03_viewmode_summary.png');
    await viewModeEl.screenshot({ path: viewModePath });
    console.log('Captured viewModeEl:', viewModePath);
  }

  // 4. Filter bar close-up
  const filterEl = page.locator('[class*="filterBar"]').first();
  if (await filterEl.isVisible()) {
    const filterPath = path.join(ARTIFACTS_DIR, 'current_04_filter_bar.png');
    await filterEl.screenshot({ path: filterPath });
    console.log('Captured filterEl:', filterPath);
  }

  // 5. Usta card close-up
  const cardEl = page.locator('article, [class*="cardInteractive"]').first();
  if (await cardEl.isVisible()) {
    const cardPath = path.join(ARTIFACTS_DIR, 'current_05_usta_card.png');
    await cardEl.screenshot({ path: cardPath });
    console.log('Captured cardEl:', cardPath);
  }

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
