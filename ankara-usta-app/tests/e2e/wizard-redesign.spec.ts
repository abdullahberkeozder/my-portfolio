import {expect, test} from '@playwright/test';

for (const width of [320, 390, 820, 1440]) {
  test(`wizard navigation and final region review at ${width}px`, async ({page}, info) => {
    await page.setViewportSize({width, height: 900});
    await page.goto('/');
    await page.getByLabel('Hızlı arama etiketleri').getByRole('button', {name:'Musluk Değişimi'}).click();
    await page.getByRole('button', {name:'Bu Hizmetle Devam Et →'}).click();
    let wizard = page.getByRole('dialog', {name:'Musluk Değişimi'});
    await expect(wizard).toBeVisible();
    await expect(wizard.getByRole('navigation', {name:'Talep adımları'}).getByRole('button', {name:'Özet'})).toBeDisabled();
    await expect(page.locator('html')).toHaveCSS('overflow', 'hidden');
    for (let question = 0; question < 3; question++) {
      await wizard.getByRole('radio').first().check();
      const next = wizard.getByRole('button', {name: question === 2 ? 'Görsel ekleme adımına geç' : 'Sonraki soruya geç'});
      await expect(next).toBeInViewport();
      await next.click();
    }
    await page.getByRole('button', {name:'Konum ve zamanı ekle'}).click();
    await page.getByLabel('İlçe Seçin').selectOption('Çankaya');
    await page.getByLabel('Mahalle / Semt').selectOption({index:1});
    await page.getByRole('button', {name:'Talep kapsamını kontrol et'}).click();
    wizard = page.getByRole('dialog', {name:'Talebiniz hazır mı?'});
    await expect(wizard).toBeVisible();
    await expect(wizard.getByRole('heading', {name:'Talebiniz hazır mı?'})).toBeFocused();
    await expect(wizard.getByRole('button', {name:'Bölgeyi haritada göster'})).toBeVisible();
    await expect(wizard.locator('iframe')).toHaveCount(0);
    await expect(wizard.getByRole('link', {name:'Giriş yap / kayıt ol ve devam et'})).toBeInViewport();
    expect(await wizard.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
    await page.screenshot({path:info.outputPath(`review-${width}.png`)});
    await wizard.getByRole('button', {name:'Yanıtları düzenle'}).click();
    await expect(page.getByRole('radio').first()).toBeChecked();
    await page.getByRole('radio').nth(1).check();
    const changedAnswer = await page.getByRole('radio').nth(1).getAttribute('value');
    await page.getByRole('navigation', {name:'Talep adımları'}).getByRole('button',{name:'Özet'}).click();
    await expect(page.getByLabel('Talep kapsamı').getByText(changedAnswer!,{exact:true})).toBeVisible();
    await page.getByRole('button',{name:'Bölgeyi veya zamanı düzenle'}).click();
    await expect(page.getByLabel('İlçe Seçin')).toHaveValue('Çankaya');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.locator('html')).not.toHaveCSS('overflow','hidden');
  });
}
