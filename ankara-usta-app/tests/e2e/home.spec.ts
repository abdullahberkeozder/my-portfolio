import {expect,test} from '@playwright/test';

test.beforeEach(async({page})=>{
  await page.goto('/');
  await page.getByRole('button',{name:'Reddet',exact:true}).click();
});

test('customer classifies a service, reads scope and opens the wizard',async({page})=>{
  await expect(page.getByRole('heading',{name:/İşini anlat.*Doğru ustayla buluş/})).toBeVisible();
  const search=page.getByRole('textbox',{name:'İhtiyacınızı yazın'});
  await search.fill('tavandan su geliyor');await search.press('Enter');
  const dialog=page.getByRole('dialog',{name:/İhtiyacınızı doğru anladık mı/i});
  await expect(dialog.getByRole('heading',{level:3})).toHaveText('Su Kaçağı Tespiti');
  await dialog.getByText('Kapsam hakkında',{exact:true}).click();
  await expect(dialog.getByRole('listitem')).toHaveCount(6);
  for(const item of await dialog.getByRole('listitem').all())await expect(item).not.toBeEmpty();
  await dialog.getByRole('button',{name:/Bu Hizmetle Devam Et/}).click();
  await expect(page.getByRole('dialog',{name:'Su Kaçağı Tespiti'})).toBeVisible();
});

test('draft refresh requires explicit resume and preserves the selected answers',async({page})=>{
  const search=page.getByRole('textbox',{name:'İhtiyacınızı yazın'});
  await search.fill('TV Duvar Montajı');await search.press('Enter');
  await page.getByRole('button',{name:/Bu Hizmetle Devam Et/}).click();
  await page.locator('label').filter({has:page.getByRole('radio',{name:'32–49 inç',exact:true})}).click();
  await expect(page.getByRole('radio',{name:'32–49 inç',exact:true})).toBeChecked();
  await page.getByRole('button',{name:/Sonraki soru/}).click();
  await page.locator('label').filter({has:page.getByRole('radio',{name:'Beton / tuğla',exact:true})}).click();
  await page.getByRole('button',{name:/Sonraki soru/}).click();
  await page.locator('label').filter({has:page.getByRole('radio',{name:'Evet, hazır',exact:true})}).click();
  await page.getByRole('button',{name:/Görsel ekleme adımına geç/}).click();
  await expect(page.getByRole('heading',{name:'İsterseniz fotoğraf veya video ekleyin'})).toBeFocused();
  await page.reload();
  await search.fill('TV Duvar Montajı');await search.press('Enter');
  await page.getByRole('button',{name:/Bu Hizmetle Devam Et/}).click();
  await expect(page.getByRole('heading',{name:'Kayıtlı taslağınız var'})).toBeVisible();
  await page.getByRole('button',{name:'Hesabımdaki taslağa devam et'}).click();
  await expect(page.getByRole('dialog',{name:'İsterseniz fotoğraf veya video ekleyin'})).toBeVisible();
  await page.getByRole('button',{name:'Kapsama dön',exact:true}).click();
  await expect(page.getByRole('radio',{name:'Evet, hazır',exact:true})).toBeChecked();
});

test('keyboard search restores focus on Escape',async({page})=>{
  const search=page.getByRole('textbox',{name:'İhtiyacınızı yazın'});
  await search.focus();await page.keyboard.type('musluk akıtıyor');await page.keyboard.press('Enter');
  const dialog=page.getByRole('dialog',{name:/İhtiyacınızı doğru anladık mı/i});
  await expect(dialog.getByRole('button',{name:'Kapat'})).toBeFocused();
  await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);await expect(search).toBeFocused();
  await expect(page.locator('footer a[href="#"]')).toHaveCount(0);
});

test('narrow mobile match and wizard fit without horizontal clipping',async({page})=>{
  for(const width of [320,390]){
    await page.setViewportSize({width,height:844});
    const search=page.getByRole('textbox',{name:'İhtiyacınızı yazın'});
    await search.fill('Musluk Değişimi');await search.press('Enter');
    const match=page.getByRole('dialog',{name:/İhtiyacınızı doğru anladık mı/i});
    await expect(match).toBeVisible();
    const bounds=await match.boundingBox();expect(bounds).not.toBeNull();expect(bounds!.x).toBeGreaterThanOrEqual(0);expect(bounds!.x+bounds!.width).toBeLessThanOrEqual(width+1);
    await match.getByRole('button',{name:/Bu Hizmetle Devam Et/}).click();
    const resume=page.getByRole('button',{name:'Taslağı sil ve yeni başla'});
    if(width===390){await expect(resume).toBeVisible();await resume.click();}
    const wizard=page.getByRole('dialog',{name:'Musluk Değişimi'});
    await expect(wizard.getByRole('heading',{level:2})).toBeFocused();
    await wizard.locator('label').filter({has:page.getByRole('radio',{name:'Mutfak bataryası',exact:true})}).click();
    await expect(wizard.getByRole('radio',{name:'Mutfak bataryası',exact:true})).toBeChecked();
    await wizard.getByRole('button',{name:/Sonraki soru/}).click();
    await expect(wizard.getByText('Soru 2 / 3',{exact:true})).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1)).toBe(true);
    await page.keyboard.press('Escape');
  }
});

test('wizard uses a single task surface across the responsive matrix',async({page})=>{
  for(const width of [320,390,820,1440]){
    await page.setViewportSize({width,height:900});
    await page.evaluate(()=>localStorage.clear());
    await page.reload();
    const search=page.getByRole('textbox',{name:'İhtiyacınızı yazın'});
    await search.fill('Musluk Değişimi');
    await search.press('Enter');
    await page.getByRole('button',{name:/Bu Hizmetle Devam Et/}).click();
    const resume=page.getByRole('button',{name:'Taslağı sil ve yeni başla'});
    if(await resume.isVisible()) await resume.click();
    const wizard=page.getByRole('dialog',{name:'Musluk Değişimi'});
    const bounds=await wizard.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x+bounds!.width).toBeLessThanOrEqual(width+1);
    await expect(wizard.getByRole('status',{name:'Talep aşaması: Kapsam'})).toBeVisible();
    await expect(wizard.getByRole('progressbar')).toHaveCount(0);
    await expect(wizard.getByRole('button',{name:/Talep özeti/})).toHaveCount(0);
    await expect(wizard.getByLabel('Talep kapsamı özeti')).toHaveCount(0);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1)).toBe(true);
    await page.keyboard.press('Escape');
  }
});

test('production uses the current cobalt brand and a bounded header',async({page})=>{
  const token=await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--brand-cobalt').trim());
  expect(token.toLowerCase()).toBe('#1246b5');
  const header=page.locator('header').first();await expect(header).toBeVisible();const box=await header.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(60);expect(box!.height).toBeLessThan(100);
});
