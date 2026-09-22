import {test,expect} from '@playwright/test';

for(const width of [320,390,820,1440]) {
  test(`directory journey at ${width}px`,async({page},testInfo)=>{
    await page.setViewportSize({width,height:900});
    await page.goto('/ustalar');
    const filters=page.getByRole('form',{name:'Usta filtreleri'});
    await expect(filters.getByRole('combobox',{name:'Hizmet',exact:true})).toBeVisible();
    await filters.getByRole('combobox',{name:'Hizmet',exact:true}).selectOption('musluk-degisimi');
    await filters.getByRole('combobox',{name:'İlçe',exact:true}).selectOption('Sincan');
    await filters.getByRole('combobox',{name:'İlçe',exact:true}).focus();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button',{name:'Ustaları göster'})).toBeFocused();
    await page.keyboard.press('Enter');
    const card=page.locator('.usta-card').filter({hasText:'TEST PROFİLİ · Uzun İsimli'});
    await expect(card).toBeVisible();
    await expect(card).toContainText('Sincan');
    await expect(card).toContainText('Gerçek hizmet sağlayıcı değildir');
    for(const control of [filters.getByRole('combobox',{name:'Hizmet',exact:true}),page.getByRole('button',{name:'Ustaları göster'}),card.getByRole('link',{name:'Profili İncele →'})]) {
      const box=await control.boundingBox();expect(box!.height).toBeGreaterThanOrEqual(44);
    }
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.screenshot({path:testInfo.outputPath(`directory-${width}.png`),fullPage:true});
    await expect(page.getByRole('link',{name:'Harita',exact:true})).toHaveCount(0);
    await card.getByRole('link',{name:'Profili İncele →'}).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading',{level:1})).toContainText('TEST PROFİLİ · Uzun İsimli');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.screenshot({path:testInfo.outputPath(`profile-${width}.png`),fullPage:true});
    await page.getByRole('button',{name:'Bu ustadan teklif al',exact:true}).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Seçili usta:',{exact:false})).toContainText('Uzun İsimli');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.screenshot({path:testInfo.outputPath(`wizard-${width}.png`),fullPage:true});
    await page.goto('/ustalar?service=musluk-degisimi&district=G%C3%B6lba%C5%9F%C4%B1');
    await expect(page.getByRole('heading',{name:'Bu kriterlere uygun onaylı usta bulunamadı'})).toBeVisible();
    await page.getByRole('link',{name:'Filtreleri Temizle',exact:true}).click();
    await expect(page.getByRole('combobox',{name:'İlçe',exact:true})).toHaveValue('');
    await expect(page.getByRole('combobox',{name:'Hizmet',exact:true})).toHaveValue('');
    await page.goto('/concepts/harita');
    await expect(page.getByRole('heading',{name:'Temsili Ankara haritası'})).toBeVisible();
    await expect(page.getByText('Bu sayfadaki noktalar gerçek işletme, usta, doğrulama, puan veya müsaitlik verisi değildir.',{exact:false})).toBeVisible();
    await expect(page.getByRole('button',{name:/teklif/i})).toHaveCount(0);
  });
}
