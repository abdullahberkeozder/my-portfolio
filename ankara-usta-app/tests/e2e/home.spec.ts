import { expect, test } from '@playwright/test';

test('customer can classify a service from the homepage', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await expect(page.getByRole('heading', { name: /Güvenilir ustayı bul/ })).toBeVisible();
  await page.getByRole('textbox', { name: 'Ne konuda yardıma ihtiyacınız var?' }).fill('tavandan su geliyor');
  await page.getByRole('button', { name: 'Ara', exact: true }).click();

  const classificationDialog = page.getByRole('dialog', { name: 'İhtiyacınızı doğru anladık mı?' });
  await expect(classificationDialog).toBeVisible();
  await expect(classificationDialog.getByText('Su Kaçağı Tespiti', { exact: true })).toBeVisible();
});

test('request draft survives a page refresh and resumes at the saved step', async ({ page }) => {
  await page.goto('/');
  const search = page.getByRole('textbox', { name: 'Ne konuda yardıma ihtiyacınız var?' });
  await search.fill('TV duvar montajı');
  await search.press('Enter');
  await page.getByRole('button', { name: 'Bu hizmetle devam et' }).click();

  const wizard = page.getByRole('dialog', { name: 'TV Duvar Montajı' });
  await wizard.getByLabel('32–49 inç').check();
  await wizard.getByLabel('Beton / tuğla').check();
  await wizard.getByLabel('Evet, hazır').check();
  await wizard.getByRole('button', { name: 'Görsellere devam et' }).click();
  await expect(page.getByRole('dialog', { name: 'Fotoğraf veya video ekleyin' })).toBeVisible();

  await page.reload();
  await search.fill('TV duvar montajı');
  await search.press('Enter');
  await page.getByRole('button', { name: 'Bu hizmetle devam et' }).click();

  await expect(page.getByRole('dialog', { name: 'Fotoğraf veya video ekleyin' })).toBeVisible();
  await page.getByRole('button', { name: 'Geri' }).click();
  await expect(page.getByLabel('32–49 inç')).toBeChecked();
  await expect(page.getByLabel('Beton / tuğla')).toBeChecked();
  await expect(page.getByLabel('Evet, hazır')).toBeChecked();
});

test('classification modal supports keyboard entry, focus, and Escape dismissal', async ({ page }) => {
  await page.goto('/');

  for (let index = 0; index < 12; index += 1) {
    if (await page.getByRole('textbox', { name: 'Ne konuda yardıma ihtiyacınız var?' }).evaluate((element) => element === document.activeElement)) break;
    await page.keyboard.press('Tab');
  }
  const search = page.getByRole('textbox', { name: 'Ne konuda yardıma ihtiyacınız var?' });
  await expect(search).toBeFocused();
  await page.keyboard.type('musluk akıtıyor');
  await page.keyboard.press('Enter');

  const dialog = page.getByRole('dialog', { name: 'İhtiyacınızı doğru anladık mı?' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Kapat' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(search).toBeFocused();
});

test('homepage and wizard do not overflow on the mobile viewport', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chromium', 'Mobile-only layout assertion');
  await page.goto('/');

  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  const search = page.getByRole('textbox', { name: 'Ne konuda yardıma ihtiyacınız var?' });
  await expect(search).toBeVisible();
  await search.fill('avize montajı');
  await search.press('Enter');
  await page.getByRole('button', { name: 'Bu hizmetle devam et' }).click();
  await expect(page.getByRole('dialog', { name: 'Avize Montajı' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test('mobile navigation opens, closes with Escape, and exposes product routes', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chromium', 'Mobile-only navigation assertion');
  await page.goto('/');

  const menuButton = page.getByRole('button', {name:'Menüyü aç'});
  await menuButton.click();
  const navigation = page.getByRole('navigation', {name:'Mobil navigasyon'});
  await expect(navigation).toBeVisible();
  await expect(navigation.getByRole('link', {name:'Usta olarak katıl'})).toHaveAttribute('href','/usta-basvurusu');
  await expect(navigation.getByRole('link', {name:'Yardım merkezi'})).toHaveAttribute('href','/yardim');

  await page.keyboard.press('Escape');
  await expect(navigation).toBeHidden();
  await expect(page.getByRole('button', {name:'Menüyü aç'})).toBeFocused();
});

test('classification explains the selected match and footer contains no placeholder links', async ({ page }) => {
  await page.goto('/');
  const search = page.getByRole('textbox', {name:'Ne konuda yardıma ihtiyacınız var?'});
  await search.fill('mutfak musluğu damlatıyor');
  await search.press('Enter');

  const dialog = page.getByRole('dialog', {name:'İhtiyacınızı doğru anladık mı?'});
  await expect(dialog.getByText('Neden bu sonuç?')).toBeVisible();
  await expect(dialog.locator('.match-rationale p')).toContainText('musluğu');
  await page.keyboard.press('Escape');
  await expect(page.locator('footer a[href="#"]')).toHaveCount(0);
});
