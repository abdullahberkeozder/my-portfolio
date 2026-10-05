import { chromium } from '@playwright/test';

async function main() {
  const browser = await chromium.launch({ headless: true });
  
  // 1. Desktop 1440x900
  const deskCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const deskPage = await deskCtx.newPage();
  await deskPage.goto('http://localhost:3000/concepts/harita?view=split', { waitUntil: 'networkidle' });
  try {
    const btn = deskPage.locator('button:has-text("İzin ver"), button:has-text("Reddet")').first();
    if (await btn.isVisible({ timeout: 1000 })) await btn.click();
  } catch {}
  await deskPage.waitForTimeout(800);
  await deskPage.screenshot({ path: 'C:/Users/a-ber/.gemini/antigravity-ide/brain/26d88a0e-8ad6-454c-967d-2c5de61d57cf/eval_desktop_1440.png' });

  // 2. User exact viewport 500x749 with cookie dismissed
  const userCtx = await browser.newContext({ viewport: { width: 500, height: 749 }, deviceScaleFactor: 2 });
  const userPage = await userCtx.newPage();
  await userPage.goto('http://localhost:3000/concepts/harita?view=split', { waitUntil: 'networkidle' });
  try {
    const btn = userPage.locator('button:has-text("İzin ver"), button:has-text("Reddet")').first();
    if (await btn.isVisible({ timeout: 1000 })) await btn.click();
  } catch {}
  await userPage.waitForTimeout(800);
  await userPage.screenshot({ path: 'C:/Users/a-ber/.gemini/antigravity-ide/brain/26d88a0e-8ad6-454c-967d-2c5de61d57cf/eval_user_viewport_nocookie_500x749.png' });

  await browser.close();
  console.log('Captures completed!');
}

main().catch(console.error);
