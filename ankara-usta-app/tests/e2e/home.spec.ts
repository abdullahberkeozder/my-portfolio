import { expect, test } from '@playwright/test';

test('customer can classify a service from the homepage', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await expect(page.getByRole('heading', { name: /Her iş, doğru parçalar/ })).toBeVisible();
  await page.getByRole('textbox', { name: 'İhtiyacınızı yazın' }).fill('tavandan su geliyor');
  await page.getByRole('button', { name: 'Zanaatkar Bul' }).click();

  const classificationDialog = page.getByRole('dialog', { name: 'İhtiyacınızı doğru anladık mı?' });
  await expect(classificationDialog).toBeVisible();
  await expect(classificationDialog.getByText('Su Kaçağı Tespiti', { exact: true })).toBeVisible();
});

test('request draft survives a page refresh and resumes at the saved step', async ({ page }) => {
  await page.goto('/');
  const search = page.getByRole('textbox', { name: 'İhtiyacınızı yazın' });
  await search.fill('TV Duvar Montajı');
  await search.press('Enter');
  await page.getByRole('button', { name: /Bu Hizmetle Devam Et/i }).click();

  const wizard = page.getByRole('dialog', { name: 'TV Duvar Montajı' });
  await wizard.locator('.wizard-form-side label').filter({ hasText: '32–49 inç' }).click();
  await wizard.getByRole('button', { name: /Sonraki soru/i }).click();
  await wizard.locator('.wizard-form-side label').filter({ hasText: 'Beton / tuğla' }).click();
  await wizard.getByRole('button', { name: /Sonraki soru/i }).click();
  await wizard.locator('.wizard-form-side label').filter({ hasText: 'Evet, hazır' }).click();
  await wizard.getByRole('button', { name: /Görsellere devam et/i }).click();
  await expect(page.getByRole('dialog', { name: /İsterseniz fotoğraf veya video ekleyin/i })).toBeVisible();

  await page.reload();
  await search.fill('TV Duvar Montajı');
  await search.press('Enter');
  await page.getByRole('button', { name: /Bu Hizmetle Devam Et/i }).click();

  await expect(page.getByRole('dialog', { name: /İsterseniz fotoğraf veya video ekleyin/i })).toBeVisible();
  await page.getByRole('button', { name: 'Geri' }).click();
  await expect(page.getByLabel('Evet, hazır')).toBeChecked();
  await page.getByRole('button', { name: /Önceki soru/i }).click();
  await expect(page.getByLabel('Beton / tuğla')).toBeChecked();
  await page.getByRole('button', { name: /Önceki soru/i }).click();
  await expect(page.getByLabel('32–49 inç')).toBeChecked();
});

test('classification modal supports keyboard entry, focus, and Escape dismissal', async ({ page }) => {
  await page.goto('/');

  for (let index = 0; index < 12; index += 1) {
    if (await page.getByRole('textbox', { name: 'İhtiyacınızı yazın' }).evaluate((element) => element === document.activeElement)) break;
    await page.keyboard.press('Tab');
  }
  const search = page.getByRole('textbox', { name: 'İhtiyacınızı yazın' });
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
  const search = page.getByRole('textbox', { name: 'İhtiyacınızı yazın' });
  await expect(search).toBeVisible();
  await search.fill('avize montajı');
  await search.press('Enter');
  await page.getByRole('button', { name: /Bu Hizmetle Devam Et/i }).click();
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
  const search = page.getByRole('textbox', {name:'İhtiyacınızı yazın'});
  await search.fill('mutfak musluğu damlatıyor');
  await search.press('Enter');

  const dialog = page.getByRole('dialog', {name:'İhtiyacınızı doğru anladık mı?'});
  await expect(dialog.locator('.match-single-rationale')).toContainText('eşleşiyor');
  await page.keyboard.press('Escape');
  await expect(page.locator('footer a[href="#"]')).toHaveCount(0);
});

test('production server applies the consolidated stylesheet and design tokens', async ({ page }) => {
  await page.goto('/');

  const styles = await page.evaluate(() => {
    const header = document.querySelector('header');
    return {
      actionPrimary: getComputedStyle(document.documentElement)
        .getPropertyValue('--action-primary')
        .trim(),
      headerHeight: header?.getBoundingClientRect().height ?? 0,
      linkedStylesheets: Array.from(document.styleSheets).filter(sheet => Boolean(sheet.href)).length,
    };
  });

  expect(styles.actionPrimary).toBe('#0d7a5f');
  expect(styles.headerHeight).toBeGreaterThanOrEqual(60);
  expect(styles.headerHeight).toBeLessThan(100);
  expect(styles.linkedStylesheets).toBeGreaterThan(0);
});

test('narrow phones keep the hero, help affordance, and wizard inside safe bounds', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/');

  const heroLayout = await page.evaluate(() => {
    const heading = document.querySelector('h1')?.getBoundingClientRect();
    const motif = document.querySelector('.hero-bond-field')?.getBoundingClientRect();
    const help = document.querySelector<HTMLElement>('.help-float');
    const overlaps = Boolean(
      heading && motif &&
      heading.left < motif.right && heading.right > motif.left &&
      heading.top < motif.bottom && heading.bottom > motif.top
    );
    return {
      overlaps,
      helpDisplay: help ? getComputedStyle(help).display : null,
      overflows: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });

  expect(heroLayout.overlaps).toBe(false);
  expect(heroLayout.helpDisplay).toBe('none');
  expect(heroLayout.overflows).toBe(false);

  await page.setViewportSize({ width: 390, height: 844 });
  const mobileSearch = page.getByRole('textbox', { name: 'İhtiyacınızı yazın' });
  await mobileSearch.fill('Musluk Değişimi');
  await mobileSearch.press('Enter');
  await page.getByRole('button', { name: /Bu Hizmetle Devam Et/i }).click();

  const wizard = page.locator('.swiss-monolith-dialog');
  const wizardFits = await wizard.evaluate(element => {
    const rect = element.getBoundingClientRect();
    return rect.left >= 0 && rect.right <= document.documentElement.clientWidth;
  });
  expect(wizardFits).toBe(true);
  await expect(page.locator('.dev-role-switcher')).toHaveCount(0);

  const formSide = wizard.locator('.wizard-form-side');
  await expect(formSide).toHaveCSS('overflow-y', 'auto');
  await wizard.locator('.wizard-form-side label').filter({ hasText: 'Mutfak bataryası' }).click();
  const nextButton = wizard.getByRole('button', { name: /Sonraki soru/i });
  await nextButton.scrollIntoViewIfNeeded();
  await expect(nextButton).toBeVisible();
  await nextButton.click();
  await expect(wizard.getByText(/SORU 2 \/ 3/)).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});
