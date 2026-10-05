import { chromium } from '@playwright/test';
import path from 'path';

async function main() {
  const browser = await chromium.launch({ headless: true });
  
  // 1. Desktop Screenshot (1920x960 matching user's original viewport)
  const desktopPage = await browser.newPage({ viewport: { width: 1920, height: 960 } });
  await desktopPage.addInitScript(() => {
    localStorage.setItem('ankara_analytics_consent', 'accepted');
  });
  await desktopPage.goto('http://localhost:3000/concepts/harita', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(600);

  const desktopScreenshotPath = 'C:\\Users\\a-ber\\.gemini\\antigravity-ide\\brain\\26d88a0e-8ad6-454c-967d-2c5de61d57cf\\split_view_desktop_audit.png';
  await desktopPage.screenshot({ path: desktopScreenshotPath, fullPage: false });
  console.log('Desktop screenshot saved:', desktopScreenshotPath);

  // 1b. Hover over first usta card to capture Progressive Disclosure state
  const firstCard = desktopPage.locator('article.usta-card').first();
  await firstCard.hover();
  await desktopPage.waitForTimeout(300);
  const hoverScreenshotPath = 'C:\\Users\\a-ber\\.gemini\\antigravity-ide\\brain\\26d88a0e-8ad6-454c-967d-2c5de61d57cf\\split_view_hover_audit.png';
  await desktopPage.screenshot({ path: hoverScreenshotPath, fullPage: false });
  console.log('Hover screenshot saved:', hoverScreenshotPath);

  // 2. Open Trust & Platform Guarantee Modal
  const trustBtn = desktopPage.locator('button[aria-label*="Sabit Fiyat Koruması"], button:has-text("Sabit Fiyat")').first();
  await trustBtn.click();
  await desktopPage.waitForTimeout(400);

  const trustModalScreenshotPath = 'C:\\Users\\a-ber\\.gemini\\antigravity-ide\\brain\\26d88a0e-8ad6-454c-967d-2c5de61d57cf\\split_view_trust_modal_audit.png';
  await desktopPage.screenshot({ path: trustModalScreenshotPath, fullPage: false });
  console.log('Trust modal screenshot saved:', trustModalScreenshotPath);

  // Close trust modal
  await desktopPage.locator('button:has-text("Anladım, Haritaya Dön")').click();
  await desktopPage.waitForTimeout(300);

  // 2b. Open Emergency Dispatch & Direct Call Modal
  const emergencyBtn = desktopPage.locator('button:has-text("Acil Ara")').first();
  await emergencyBtn.click();
  await desktopPage.waitForTimeout(400);

  const emergencyModalScreenshotPath = 'C:\\Users\\a-ber\\.gemini\\antigravity-ide\\brain\\26d88a0e-8ad6-454c-967d-2c5de61d57cf\\split_view_emergency_modal_audit.png';
  await desktopPage.screenshot({ path: emergencyModalScreenshotPath, fullPage: false });
  console.log('Emergency modal screenshot saved:', emergencyModalScreenshotPath);

  // Close emergency modal
  await desktopPage.locator('button:has-text("Anladım, Haritaya Dön")').click();
  await desktopPage.waitForTimeout(300);

  // 3. Test Instant Search Bar
  await desktopPage.fill('input[type="search"]', 'Siteler');
  await desktopPage.waitForTimeout(400);

  const searchScreenshotPath = 'C:\\Users\\a-ber\\.gemini\\antigravity-ide\\brain\\26d88a0e-8ad6-454c-967d-2c5de61d57cf\\split_view_search_audit.png';
  await desktopPage.screenshot({ path: searchScreenshotPath, fullPage: false });
  console.log('Search screenshot saved:', searchScreenshotPath);

  // Clear search
  await desktopPage.locator('button[aria-label="Aramayı temizle"]').click();
  await desktopPage.waitForTimeout(300);

  // 4. Click '⚡ Teklif İste' on first card to capture the Quick Quote Modal
  const firstQuoteBtn = desktopPage.locator('button, a').filter({ hasText: 'Teklif İste' }).first();
  await firstQuoteBtn.click();
  await desktopPage.waitForTimeout(400);

  // Fill in inputs to showcase phone auto-formatting and urgency pills
  await desktopPage.fill('#quote-problem', 'Mutfak tezgahı dolap menteşe değişimi');
  await desktopPage.fill('#quote-phone', '05321234567');
  await desktopPage.locator('button:has-text("Bugün İçinde")').click();
  await desktopPage.waitForTimeout(300);

  const modalScreenshotPath = 'C:\\Users\\a-ber\\.gemini\\antigravity-ide\\brain\\26d88a0e-8ad6-454c-967d-2c5de61d57cf\\split_view_modal_audit.png';
  await desktopPage.screenshot({ path: modalScreenshotPath, fullPage: false });
  console.log('Modal screenshot saved:', modalScreenshotPath);

  // Submit form to capture success state
  await desktopPage.click('button[type="submit"]');
  await desktopPage.waitForTimeout(600);

  const successScreenshotPath = 'C:\\Users\\a-ber\\.gemini\\antigravity-ide\\brain\\26d88a0e-8ad6-454c-967d-2c5de61d57cf\\split_view_modal_success_audit.png';
  await desktopPage.screenshot({ path: successScreenshotPath, fullPage: false });
  console.log('Success screenshot saved:', successScreenshotPath);

  // 5. Mobile Screenshot (390x844 iPhone standard)
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.addInitScript(() => {
    localStorage.setItem('ankara_analytics_consent', 'accepted');
  });
  await mobilePage.goto('http://localhost:3000/concepts/harita?view=split', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(800);

  const mobileScreenshotPath = 'C:\\Users\\a-ber\\.gemini\\antigravity-ide\\brain\\26d88a0e-8ad6-454c-967d-2c5de61d57cf\\split_view_mobile_audit.png';
  await mobilePage.screenshot({ path: mobileScreenshotPath, fullPage: false });
  console.log('Mobile screenshot saved:', mobileScreenshotPath);

  await browser.close();
}

main().catch(console.error);
