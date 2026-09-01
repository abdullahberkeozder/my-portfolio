import {expect,test} from '@playwright/test';

test('service directory exposes the complete category and service catalog',async({page})=>{
  await page.goto('/');
  await expect(page.locator('.ensemble-card')).toHaveCount(6);
  await expect(page.locator('.editorial-service-row')).toHaveCount(26);
  await expect(page.locator('#services')).toBeVisible();
});

test('header service link uses the canonical anchor with mouse and keyboard', async ({page}, testInfo) => {
  await page.goto('/');
  const usesCompactNavigation = testInfo.project.name.includes('mobile') || testInfo.project.name.includes('tablet');
  if (usesCompactNavigation) await page.getByRole('button', {name: 'Menüyü aç'}).click();
  let link = page.getByRole('link', {name: usesCompactNavigation ? 'Hizmetleri Keşfet' : 'Hizmetler', exact:true});
  await link.click();
  await expect(page).toHaveURL(/#services$/);
  await expect(page.locator('#services')).toBeInViewport();

  await page.goto('/');
  if (usesCompactNavigation) await page.getByRole('button', {name: 'Menüyü aç'}).click();
  link = page.getByRole('link', {name: usesCompactNavigation ? 'Hizmetleri Keşfet' : 'Hizmetler', exact:true});
  await link.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#services$/);
});

test('primary interactive targets meet the 44 pixel mobile baseline', async ({page}, testInfo) => {
  test.skip(!testInfo.project.name.includes('mobile'), 'Mobile interaction baseline');
  await page.goto('/');
  const targets = page.locator('.pill-row button, .icon-tabs button, .hamburger');
  const count = await targets.count();
  for (let index = 0; index < count; index += 1) {
    const box = await targets.nth(index).boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
  }
});

test('tradesperson application reveals one focused step at a time',async({page})=>{
  await page.goto('/usta-basvurusu');
  await expect(page.getByText('ADIM 1 / 5')).toBeVisible();
  await expect(page.getByRole('group',{name:'Vereceğiniz hizmetler'})).toHaveCount(0);

  await page.getByLabel('Usta / İşletme Adınız').fill('Örnek Usta');
  await page.getByLabel('Deneyim ve Uzmanlık Açıklaması').fill('Ankara genelinde on yıldır montaj hizmeti veriyorum.');
  await page.getByRole('button',{name:'Devam et'}).click();
  await expect(page.getByText('ADIM 2 / 5')).toBeVisible();

  await page.getByLabel('Mobilya Kurulumu').check();
  await page.getByRole('button',{name:'Devam et'}).click();
  await expect(page.getByText('ADIM 3 / 5')).toBeVisible();

  await page.getByLabel('Çankaya').check();
  await page.getByRole('button',{name:'Devam et'}).click();
  await expect(page.getByText('ADIM 4 / 5')).toBeVisible();
  await expect(page.getByLabel('PDF, JPG veya PNG Dosyası')).toBeVisible();
});
