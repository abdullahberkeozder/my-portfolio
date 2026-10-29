import { chromium } from '@playwright/test';

const ARTIFACT_DIR = 'C:/Users/a-ber/.gemini/antigravity-ide/brain/fe044aa9-4c0d-4361-90f7-ea2f79f88966';

async function capture() {
  const browser = await chromium.launch({ headless: true });
  
  // 1. Desktop 1440x900
  const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  
  // 0. Hero Desktop
  const heroEl = desktopPage.locator('section[class*="hero"]');
  if (await heroEl.count() > 0) {
    await heroEl.screenshot({ path: `${ARTIFACT_DIR}/hero_desktop_exact_1440.png` });
  }
  // 0.5 Discovery Desktop
  const discoveryEl = desktopPage.locator('section[class*="discoverySection"]');
  if (await discoveryEl.count() > 0) {
    await discoveryEl.scrollIntoViewIfNeeded();
    await desktopPage.waitForTimeout(400);
    await discoveryEl.screenshot({ path: `${ARTIFACT_DIR}/discovery_desktop_exact_1440.png` });
  }

  // Scroll to typology section
  const typologyEl = desktopPage.locator('div[class*="districtSection"]');
  if (await typologyEl.count() > 0) {
    await typologyEl.scrollIntoViewIfNeeded();
    await desktopPage.waitForTimeout(400);
    await typologyEl.screenshot({ path: `${ARTIFACT_DIR}/typology_desktop_exact_1440.png` });
  }

  // Scroll to manifesto section
  const manifestoEl = desktopPage.locator('section[class*="manifestoSection"]');
  if (await manifestoEl.count() > 0) {
    await manifestoEl.scrollIntoViewIfNeeded();
    await desktopPage.waitForTimeout(400);
    await manifestoEl.screenshot({ path: `${ARTIFACT_DIR}/manifesto_desktop_exact_1440.png` });
  }

  // 2. Mobile 390x844
  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:3000/', { waitUntil: 'networkidle' });

  // 0. Hero Mobile
  const mobileHeroEl = mobilePage.locator('section[class*="hero"]');
  if (await mobileHeroEl.count() > 0) {
    await mobileHeroEl.screenshot({ path: `${ARTIFACT_DIR}/hero_mobile_exact_390.png` });
  }

  const mobileTypologyEl = mobilePage.locator('div[class*="districtSection"]');
  if (await mobileTypologyEl.count() > 0) {
    await mobileTypologyEl.scrollIntoViewIfNeeded();
    await mobilePage.waitForTimeout(400);
    await mobileTypologyEl.screenshot({ path: `${ARTIFACT_DIR}/typology_mobile_exact_390.png` });
  }

  const mobileManifestoEl = mobilePage.locator('section[class*="manifestoSection"]');
  if (await mobileManifestoEl.count() > 0) {
    await mobileManifestoEl.scrollIntoViewIfNeeded();
    await mobilePage.waitForTimeout(400);
    await mobileManifestoEl.screenshot({ path: `${ARTIFACT_DIR}/manifesto_mobile_exact_390.png` });
  }

  await browser.close();
  console.log('Screenshots captured successfully!');
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
