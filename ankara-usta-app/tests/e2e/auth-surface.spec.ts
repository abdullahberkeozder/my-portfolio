import {expect, test} from '@playwright/test';

for (const width of [390, 1440]) {
  test(`auth transition surface keeps the green control language at ${width}px`, async ({page}, info) => {
    await page.setViewportSize({width, height: 900});
    await page.goto('/giris?next=%2Ftaleplerim');

    await expect(page.getByRole('heading', {name: 'Hoş Geldiniz'})).toBeVisible();
    await expect(page.getByText('Giriş tamamlandığında işleminize döneceksiniz.')).toBeVisible();

    const card = page.locator('[class*="container"]').first();
    const email = page.getByLabel('E-posta Adresi');
    const submit = page.getByRole('button', {name: 'Giriş Yap →'});
    const switchButton = page.getByRole('button', {name: 'Hesap oluşturun'});
    const consent = page.getByRole('region', {name: 'Gizlilik ve Çerez Tercihleri'});

    await expect(card).toHaveCSS('border-radius', width === 390 ? '14px' : '16px');
    await expect(email).toHaveCSS('border-radius', '8px');
    await expect(submit).toHaveCSS('border-radius', '8px');
    await expect(submit).toHaveCSS('background-color', 'rgb(14, 111, 71)');
    await expect(consent).toHaveCSS('border-radius', '14px');
    const consentBox = await consent.boundingBox();
    expect(consentBox?.height).toBeLessThan(width === 390 ? 110 : 140);

    await email.focus();
    await expect(email).toHaveCSS('border-color', 'rgb(14, 111, 71)');
    await switchButton.click();
    await expect(page.getByRole('heading', {name: 'Hesap Oluşturun'})).toBeVisible();
    await expect(page.getByRole('checkbox')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

    await page.screenshot({path: info.outputPath(`auth-${width}.png`), animations: 'disabled'});
  });
}

test('registration route exposes the same return context and primary action', async ({page}) => {
  await page.setViewportSize({width: 390, height: 900});
  await page.goto('/kayit?next=%2Ftaleplerim');

  await expect(page.getByRole('heading', {name: 'Hesap Oluşturun'})).toBeVisible();
  await expect(page.getByText('Doğrulama tamamlandığında işleminize döneceksiniz.')).toBeVisible();
  await expect(page.getByRole('button', {name: 'Hesap oluşturun'})).toHaveCount(0);
  await expect(page.getByRole('button', {name: /Zaten hesabınız var mı\? Giriş yapın/})).toBeVisible();
  await expect(page.getByRole('button', {name: /Hesap Oluştur ve Devam Et/})).toHaveCSS('border-radius', '8px');
  await page.getByRole('region', {name: 'Gizlilik ve Çerez Tercihleri'}).getByRole('button', {name: 'Reddet'}).click();
  await expect(page.getByRole('region', {name: 'Gizlilik ve Çerez Tercihleri'})).toHaveCount(0);
});
