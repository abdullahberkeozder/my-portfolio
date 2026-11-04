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

test('one service directory discloses all six categories and 26 actions',async({page})=>{
  const directory=page.locator('#services details[name="service-category"]');
  await expect(directory).toHaveCount(1);
  await directory.locator('summary').click();
  const categories=directory.getByRole('heading',{level:3});
  await expect(categories).toHaveCount(6);
  const choices=directory.getByRole('button');
  await expect(choices).toHaveCount(26);
  for(const category of await categories.all()){
    await expect(category).toBeVisible();
    expect(await category.locator('..').getByRole('button').count()).toBeGreaterThan(0);
  }
  for(const choice of await choices.all()) await expect(choice).toBeVisible();
});

test('public discovery anchor works with mouse and Enter',async({page})=>{
  for(const keyboard of [false,true]){
    await page.goto('/');
    const menu=page.getByRole('button',{name:'Menü',exact:true});
    const compact=await menu.isVisible();if(compact)await menu.click();
    const nav=page.getByRole('navigation',{name:compact?'Mobil navigasyon':'Ana navigasyon',exact:true});
    const link=nav.getByRole('link',{name:'Keşfet',exact:true});
    if(keyboard){await link.focus();await page.keyboard.press('Enter');}else await link.click();
    await expect(page).toHaveURL(/#kesfet$/);await expect(page.locator('#kesfet')).toBeInViewport();
  }
});

test('visible search actions have nonzero count and 44px targets',async({page})=>{
  const chips=page.getByLabel('Hızlı arama etiketleri').getByRole('button');
  await expect(chips).toHaveCount(4);
  for(const button of [...await chips.all(),page.getByRole('button',{name:'Hizmet bul',exact:true})]){
    await expect(button).toBeVisible();const box=await button.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(44);expect(box!.height).toBeGreaterThanOrEqual(44);
  }
});
