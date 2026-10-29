import {expect, test} from '@playwright/test';

for (const width of [320, 390, 820, 1440]) {
  test(`wizard navigation and final region review at ${width}px`, async ({page}, info) => {
    await page.setViewportSize({width, height: 900});
    await page.goto('/');
    await page.getByLabel('Hızlı arama etiketleri').getByRole('button', {name:'Musluk Değişimi'}).click();
    await page.getByRole('button', {name:'Devam et'}).click();
    let wizard = page.getByRole('dialog', {name:'Musluk Değişimi'});
    await expect(wizard).toBeVisible();
    await expect(wizard.getByRole('button', {name:'Özete dön'})).toHaveCount(0);
    await expect(page.locator('html')).toHaveCSS('overflow', 'hidden');
    await expect(wizard).toHaveCSS('background-color', 'rgb(250, 250, 249)');
    await expect(wizard.getByRole('button', {name:'Devam'})).toBeDisabled();
    for (let question = 0; question < 3; question++) {
      await wizard.getByRole('radio').first().locator('..').click();
      const next = wizard.getByRole('button', {name:'Devam'});
      await expect(next).toBeEnabled();
      await expect(wizard.getByRole('radio').first().locator('..')).toHaveCSS('background-color', 'rgb(237, 245, 239)');
      if (question === 0) {
        await page.keyboard.press('Tab');
        await page.keyboard.press('Shift+Tab');
        await expect(wizard.getByRole('radio').first().locator('..')).toHaveCSS('outline-width', '3px');
        await expect(wizard.getByRole('radio').first()).toHaveCSS('outline-style', 'none');
        await page.screenshot({path:info.outputPath(`choice-${width}.png`), animations:'disabled'});
      }
      await expect(next).toBeInViewport();
      await next.click();
    }
    await expect(page.getByRole('heading', {name:'Görsel eklemek ister misiniz?'})).toBeVisible();
    const mediaInput = page.getByLabel('Fotoğraf veya video seçin');
    await mediaInput.setInputFiles({name:'desteklenmeyen.txt', mimeType:'text/plain', buffer:Buffer.from('invalid')});
    await expect(mediaInput).toHaveAttribute('aria-invalid', 'true');
    await expect(mediaInput).toHaveAttribute('aria-describedby', 'wizard-media-help wizard-media-error');
    await expect(page.getByRole('alert')).toContainText('JPG, PNG, WebP veya MP4');
    await page.screenshot({path:info.outputPath(`media-error-${width}.png`)});
    await mediaInput.setInputFiles({name:'kisa-video.mp4', mimeType:'video/mp4', buffer:Buffer.from('local validation fixture')});
    await expect(mediaInput).not.toHaveAttribute('aria-invalid');
    await expect(page.getByRole('alert')).toHaveCount(0);
    await page.screenshot({path:info.outputPath(`media-${width}.png`)});
    await page.getByRole('button', {name:'Devam'}).click();
    await expect(page.getByRole('button', {name:'Listeden seç'})).toHaveAttribute('aria-pressed','true');
    await page.screenshot({path:info.outputPath(`location-${width}.png`)});
    await page.getByLabel('İlçe Seçin').selectOption('Çankaya');
    await page.getByLabel('Mahalle / Semt').selectOption({index:1});
    await page.getByRole('button', {name:'Özeti gör'}).click();
    wizard = page.getByRole('dialog', {name:'Talebiniz hazır'});
    await expect(wizard).toBeVisible();
    await expect(wizard.getByRole('heading', {name:'Talebiniz hazır'})).toBeFocused();
    await expect(wizard.locator('iframe')).toHaveCount(0);
    await expect(wizard.getByRole('link', {name:'Giriş yap / kayıt ol ve devam et'})).toBeInViewport();
    await expect(wizard.locator('[class*="summaryTrustBanner"]')).toHaveCSS('background-color', 'rgb(237, 245, 239)');
    await expect(wizard.locator('[class*="reviewCard"]').first()).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await page.mouse.move(0, 0);
    await expect(wizard.getByRole('link', {name:'Giriş yap / kayıt ol ve devam et'})).toHaveCSS('background-color', 'rgb(14, 111, 71)');
    const editAction = wizard.getByRole('button', {name:'Yanıtları düzenle'});
    await expect(editAction).toHaveCSS('border-radius', '8px');
    expect((await editAction.boundingBox())?.height).toBeGreaterThanOrEqual(44);
    expect(await wizard.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
    await page.screenshot({path:info.outputPath(`review-${width}.png`)});
    await wizard.getByRole('button', {name:'Yanıtları düzenle'}).click();
    await expect(page.getByRole('radio').first()).toBeChecked();
    await page.getByRole('radio').nth(1).locator('..').click();
    const changedAnswer = await page.getByRole('radio').nth(1).getAttribute('value');
    await page.getByRole('button',{name:'Özete dön'}).click();
    await page.getByText('3 yanıtı gör').click();
    await expect(page.getByLabel('Talep kapsamı').getByText(changedAnswer!,{exact:true})).toBeVisible();
    await page.getByRole('button',{name:/Konumu ve zamanı düzenle|Bölgeyi veya zamanı düzenle/}).click();
    await expect(page.getByLabel('İlçe Seçin')).toHaveValue('Çankaya');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.locator('html')).not.toHaveCSS('overflow','hidden');
  });
}

test('wizard traps keyboard focus, keeps controls usable and restores the opener', async ({page}) => {
  await page.setViewportSize({width: 390, height: 844});
  await page.goto('/');
  const opener = page.getByLabel('Hızlı arama etiketleri').getByRole('button', {name:'Musluk Değişimi'});
  await opener.focus();
  await opener.press('Enter');
  const classification = page.getByRole('dialog', {name:'Musluk Değişimi'});
  await classification.getByRole('button', {name:'Devam et'}).click();

  const wizard = page.getByRole('dialog', {name:'Musluk Değişimi'});
  await expect(wizard.getByRole('heading', {name:'Hangi musluk/batarya değişecek?'})).toBeFocused();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  const focusedChoice = wizard.locator('label:has(input:focus-visible)');
  await expect(focusedChoice).toHaveCSS('outline-style', 'solid');
  await expect(focusedChoice).toHaveCSS('outline-width', '3px');
  await expect(focusedChoice.locator('input')).toHaveCSS('outline-style', 'none');
  await wizard.getByRole('heading', {name:'Hangi musluk/batarya değişecek?'}).focus();
  const controls = wizard.locator('button:visible, select:visible, a[href]:visible');
  for (let index = 0; index < await controls.count(); index += 1) {
    const box = await controls.nth(index).boundingBox();
    expect(box, `control ${index} should have a box`).not.toBeNull();
    expect(box!.height, `control ${index} should be at least 44px tall`).toBeGreaterThanOrEqual(44);
  }
  const choices = wizard.locator('label').filter({has:wizard.getByRole('radio')});
  for (let index = 0; index < await choices.count(); index += 1) {
    const box = await choices.nth(index).boundingBox();
    expect(box, `choice ${index} should have a box`).not.toBeNull();
    expect(box!.height, `choice ${index} should be at least 44px tall`).toBeGreaterThanOrEqual(44);
  }

  await page.keyboard.press('Shift+Tab');
  await expect(wizard.getByRole('radio').last()).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(wizard.getByRole('button', {name:'Kapat'})).toBeFocused();
  for (let index = 0; index < await controls.count() + await choices.count() + 2; index += 1) {
    await page.keyboard.press('Tab');
    expect(await wizard.evaluate((dialog) => dialog.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(wizard).toHaveCount(0);
  await expect(opener).toBeFocused();
  await expect(page.locator('html')).not.toHaveCSS('overflow','hidden');
});

test('location map is opt-in and does not expose discovery or dispatch claims', async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  await page.getByLabel('Hızlı arama etiketleri').getByRole('button',{name:'Musluk Değişimi'}).click();
  await page.getByRole('button',{name:'Devam et'}).click();
  const wizard=page.getByRole('dialog',{name:'Musluk Değişimi'});
  for (let question=0;question<3;question++) {
    await wizard.getByRole('radio').first().locator('..').click();
    await wizard.getByRole('button',{name:'Devam'}).click();
  }
  await page.getByRole('button',{name:'Devam'}).click();
  const locationDialog=page.getByRole('dialog',{name:'İş nerede ve ne zaman yapılacak?'});
  await expect(locationDialog.getByRole('button',{name:'Listeden seç'})).toHaveAttribute('aria-pressed','true');
  await locationDialog.getByRole('button',{name:'Haritada seç'}).click();
  await expect(locationDialog.getByRole('button',{name:'Haritada seç'})).toHaveAttribute('aria-pressed','true');
  await expect(locationDialog.getByText('Bu bölgede ara')).toHaveCount(0);
  await expect(locationDialog.getByText(/Pilot Sevk Bölgesi|Ankara Merkez Usta Ağı|Doğrulanmış Usta Bölgesi/)).toHaveCount(0);
  await locationDialog.getByRole('button',{name:'Listeden seç'}).click();
  await expect(locationDialog.getByLabel('İlçe Seçin')).toBeVisible();
});
