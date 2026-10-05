import { chromium } from '@playwright/test';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto('http://localhost:3000/concepts/harita?view=split', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const card = page.locator('[class*="mobileCarouselCard"]').first();
  const cta = page.locator('[class*="mobileCardCta"]').first();
  const footer = page.locator('[class*="mobileCardFooter"]').first();
  const bottomSheet = page.locator('[class*="unifiedBottomSheet"]').first();

  console.log('card box:', await card.boundingBox());
  console.log('footer box:', await footer.boundingBox());
  console.log('cta count:', await cta.count());
  if (await cta.count() > 0) {
    console.log('cta text:', await cta.textContent());
    console.log('cta box:', await cta.boundingBox());
  }
  console.log('bottomSheet box:', await bottomSheet.boundingBox());

  await browser.close();
}

main().catch(console.error);
