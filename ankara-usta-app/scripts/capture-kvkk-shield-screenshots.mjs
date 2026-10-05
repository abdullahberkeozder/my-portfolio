import { chromium } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

const ARTIFACTS_DIR = 'C:/Users/a-ber/.gemini/antigravity-ide/brain/26d88a0e-8ad6-454c-967d-2c5de61d57cf';

async function main() {
  if (!fs.existsSync(ARTIFACTS_DIR)) {
    fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });

  const dismissCookie = async (p) => {
    try {
      const btn = p.locator('button:has-text("İzin ver"), button:has-text("Reddet")').first();
      if (await btn.isVisible({ timeout: 1000 })) {
        await btn.click();
        await p.waitForTimeout(300);
      }
    } catch {}
  };

  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();

  // 1. Capture /concepts/harita?view=kvkk
  console.log('1. Navigating to /concepts/harita?view=kvkk...');
  await page.goto('http://localhost:3000/concepts/harita?view=kvkk', { waitUntil: 'networkidle' });
  await dismissCookie(page);
  await page.waitForTimeout(2000);

  const kvkkConceptsPath = path.join(ARTIFACTS_DIR, 'kvkk_shield_concepts_page.png');
  await page.screenshot({ path: kvkkConceptsPath, fullPage: false });
  console.log(`Saved: ${kvkkConceptsPath}`);

  // 2. Capture RequestWizard Step 2 KVKK Notice
  console.log('2. Navigating to home page to open RequestWizard and test Step 2 KVKK notice...');
  await page.goto('http://localhost:3000/#services', { waitUntil: 'networkidle' });
  await dismissCookie(page);
  await page.waitForTimeout(1000);

  // Click on "Standart Musluk / Batarya Değişimi" flat rate package card to open wizard directly
  console.log('Clicking on Musluk flat rate package card...');
  const packageBtn = page.locator('article:has-text("Musluk") button').first();
  await packageBtn.scrollIntoViewIfNeeded();
  await packageBtn.click();
  await page.waitForTimeout(1000);

  await page.waitForSelector('dialog, [role="dialog"]', { timeout: 5000 });

  // Question 1:
  await page.locator('input[type="radio"]').first().check({ force: true });
  await page.waitForTimeout(500);
  await page.locator('button:has-text("Sonraki soruya geç")').first().click();
  await page.waitForTimeout(500);

  // Question 2:
  await page.locator('input[type="radio"]').first().check({ force: true });
  await page.waitForTimeout(500);
  await page.locator('button:has-text("Sonraki soruya geç")').first().click();
  await page.waitForTimeout(500);

  // Question 3:
  await page.locator('input[type="radio"]').first().check({ force: true });
  await page.waitForTimeout(500);
  await page.locator('button:has-text("Görsel ekleme adımına geç")').first().click();
  await page.waitForTimeout(600);

  // Step 1 -> Step 2
  const toStep2Btn = page.locator('button:has-text("Konum ve zamanı ekle")').first();
  await toStep2Btn.click();
  await page.waitForTimeout(800);

  // Switch to List mode to select Çankaya -> Ayrancı cleanly
  const listModeBtn = page.locator('button:has-text("Liste ile Seç")').first();
  if (await listModeBtn.isVisible()) {
    await listModeBtn.click();
    await page.waitForTimeout(500);
  }

  const distSelect = page.locator('select').first();
  await distSelect.selectOption('Çankaya');
  await page.waitForTimeout(500);
  const neighSelect = page.locator('select').nth(1);
  await neighSelect.selectOption('Ayrancı');
  await page.waitForTimeout(800);

  const wizardKvkkPath = path.join(ARTIFACTS_DIR, 'kvkk_shield_wizard_step2.png');
  await page.screenshot({ path: wizardKvkkPath, fullPage: false });
  console.log(`Saved: ${wizardKvkkPath}`);

  await ctx.close();
  await browser.close();
  console.log('KVKK Shield screenshots captured successfully!');
}

main().catch(console.error);
