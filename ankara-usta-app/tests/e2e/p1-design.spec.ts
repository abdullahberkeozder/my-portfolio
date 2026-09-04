import {expect,test} from '@playwright/test';

test('professional application progressively reveals services, districts and documents',async({page})=>{
  await page.goto('/usta-basvurusu');
  await expect(page.getByRole('group',{name:'Vereceğiniz hizmetler'})).toHaveCount(0);
  await page.getByLabel('Usta / İşletme Adınız').fill('Örnek Usta');
  await page.getByLabel('Deneyim ve Uzmanlık Açıklaması').fill('Ankara genelinde on yıldır montaj hizmeti veriyorum.');
  await page.getByRole('button',{name:/Devam et/i}).click();
  await expect(page.getByRole('group',{name:'Vereceğiniz hizmetler'})).toBeVisible();
  await page.getByRole('checkbox',{name:/Mobilya Kurulumu/}).check();
  await page.getByRole('button',{name:/Devam et/i}).click();
  await page.getByLabel('Çankaya',{exact:true}).check();
  await page.getByRole('button',{name:/Devam et/i}).click();
  await expect(page.getByLabel('PDF, JPG veya PNG Dosyası')).toBeVisible();
});

test.beforeEach(async({page})=>{await page.goto('/');await page.getByRole('button',{name:'Reddet',exact:true}).click();});

test('six categories disclose all 26 service actions',async({page})=>{
  const categories=page.locator('#services details[name="service-category"]');
  await expect(categories).toHaveCount(6);
  await expect(categories.locator('.category-service-list button')).toHaveCount(26);
  let seen=0;
  for(const category of await categories.all()){
    await category.locator('summary').click();
    const choices=category.locator('.category-service-list button');
    expect(await choices.count()).toBeGreaterThan(0);
    for(const choice of await choices.all()){await expect(choice).toBeVisible();seen++;}
  }
  expect(seen).toBe(26);
});

test('canonical services anchor works with mouse and Enter',async({page})=>{
  for(const keyboard of [false,true]){
    await page.goto('/');
    const menu=page.getByRole('button',{name:'Menü',exact:true});
    const compact=await menu.isVisible();if(compact)await menu.click();
    const nav=page.getByRole('navigation',{name:compact?'Mobil navigasyon':'Ana navigasyon',exact:true});
    const link=nav.getByRole('link',{name:'Hizmetler',exact:true});
    if(keyboard){await link.focus();await page.keyboard.press('Enter');}else await link.click();
    await expect(page).toHaveURL(/#services$/);await expect(page.locator('#services')).toBeInViewport();
  }
});

test('visible search actions have nonzero count and 44px targets',async({page})=>{
  const chips=page.getByLabel('Hızlı arama etiketleri').getByRole('button');
  await expect(chips).toHaveCount(3);
  for(const button of [...await chips.all(),page.getByRole('button',{name:'Hizmet bul',exact:true})]){
    await expect(button).toBeVisible();const box=await button.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(44);expect(box!.height).toBeGreaterThanOrEqual(44);
  }
});
