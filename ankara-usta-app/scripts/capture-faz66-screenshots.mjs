import { chromium } from 'playwright';

const ARTIFACT_DIR = 'C:/Users/a-ber/.gemini/antigravity-ide/brain/26d88a0e-8ad6-454c-967d-2c5de61d57cf';

async function main() {
  console.log('Launching browser to capture FAZ 6.6 screenshots...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 960 },
  });

  const sessionData = {
    access_token: 'mock-access-token-12345',
    refresh_token: 'mock-refresh-token-12345',
    expires_at: Math.floor(Date.now() / 1000) + 7200,
    expires_in: 7200,
    token_type: 'bearer',
    user: {
      id: '11111111-2222-3333-4444-555555555555',
      aud: 'authenticated',
      role: 'authenticated',
      email: 'ahmet.usta@ankarausta.test',
      app_metadata: { provider: 'email' },
      user_metadata: { displayName: 'Ahmet Karadeniz' },
      created_at: '2026-01-01T00:00:00Z',
    },
  };
  const sessionStr = JSON.stringify(sessionData);
  const base64Session = 'base64-' + Buffer.from(sessionStr).toString('base64');

  await context.addCookies([
    {
      name: 'sb-qzrktfyouloqxjbkhjce-auth-token',
      value: base64Session,
      domain: 'localhost',
      path: '/',
    },
  ]);

  const page = await context.newPage();

  await page.addInitScript(({ sessionStr }) => {
    try {
      localStorage.setItem('sb-qzrktfyouloqxjbkhjce-auth-token', sessionStr);
    } catch {}
  }, { sessionStr });

  // Mock authenticated user response for any auth calls
  await page.route('**/auth/v1/user', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(sessionData.user),
    });
  });

  // Mock Supabase storage upload for verification doc
  await page.route('**/storage/v1/object/tradesperson-verification/**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ Key: 'tradesperson-verification/dummy.pdf' }),
    });
  });

  console.log('Navigating to /usta-basvurusu...');
  await page.goto('http://localhost:3000/usta-basvurusu');
  await page.waitForLoadState('domcontentloaded');

  console.log('Waiting for application card...');
  await page.waitForSelector('.application-card', { timeout: 15000 });

  // Accept cookies if banner visible
  const rejectCookies = page.getByRole('button', { name: 'Reddet', exact: true });
  if (await rejectCookies.isVisible().catch(() => false)) {
    await rejectCookies.click();
  }

  // Step 0: Profil & Uzmanlık
  console.log('Filling Step 0 (Profil)...');
  await page.fill('input[placeholder*="Örn:"]', 'Ahmet Karadeniz (Elektrik & Otomasyon)');
  await page.fill('textarea[placeholder*="Kaç yıldır"]', '20 yıllık Ankara genelinde endüstriyel ve konut elektrik tesisatı, pano montajı ve arıza bakım uzmanlığı.');
  await page.click('button:has-text("Devam Et →")');

  // Step 1: Hizmet Alanları
  console.log('Selecting Step 1 (Hizmetler)...');
  await page.waitForTimeout(400);
  const firstCheckbox = page.locator('input[type="checkbox"]').first();
  await firstCheckbox.check();
  const secondCheckbox = page.locator('input[type="checkbox"]').nth(1);
  await secondCheckbox.check();
  await page.click('button:has-text("Devam Et →")');

  // Step 2: Çalışma Bölgeleri
  console.log('Selecting Step 2 (Bölgeler)...');
  await page.waitForTimeout(400);
  await page.click('button:has-text("+ Merkez İlçeler")');
  await page.click('button:has-text("Devam Et →")');

  // Step 3: Belge Yükleme
  console.log('Filling Step 3 (Doğrulama & Mesleki Yeterlilik)...');
  await page.waitForTimeout(500);

  // Fill vocational details
  await page.fill('input[placeholder*="YB21/"]', 'YB21/004812');
  await page.fill('input[placeholder*="Mesleki Yeterlilik"]', 'Mesleki Yeterlilik Kurumu (MYK)');
  await page.fill('input[type="date"]', '2028-12-31');

  // Create temporary buffer file for upload
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles({
    name: 'MYK_Elektrik_Seviye4_Belgesi.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4 dummy pdf content for verification'),
  });

  await page.waitForTimeout(600);

  // Capture Screenshot 1: Step 3 Vocational Input & Badge Candidate Preview
  console.log('Capturing Screenshot 1 (Step 3 Vocational Input)...');
  const screenshot1Path = `${ARTIFACT_DIR}/faz66_01_step4_vocational_input.png`;
  await page.screenshot({ path: screenshot1Path, fullPage: true });

  // Proceed to Step 4: Preview & Review
  console.log('Proceeding to Step 4 (Önizleme & Onay)...');
  await page.click('button:has-text("Devam Et →")');
  await page.waitForTimeout(600);

  // Capture Screenshot 2: Step 4 Review Summary with Vocational Details
  console.log('Capturing Screenshot 2 (Step 4 Review Summary)...');
  const screenshot2Path = `${ARTIFACT_DIR}/faz66_02_step5_review_summary.png`;
  await page.screenshot({ path: screenshot2Path, fullPage: true });

  console.log('All screenshots captured successfully!');
  await browser.close();
}

main().catch(err => {
  console.error('Error during screenshot capture:', err);
  process.exit(1);
});
