import {expect, test} from '@playwright/test';

for (const width of [390, 1440]) {
  test(`password recovery invalid state keeps the account control language at ${width}px`, async ({page}, info) => {
    await page.setViewportSize({width, height: 900});
    await page.goto('/parola-yenile');

    await expect(page.getByRole('heading', {name: 'Yeni Parolanızı Belirleyin'})).toBeVisible();
    await expect(page.getByRole('alert')).toContainText('geçersiz veya süresi dolmuş');

    const card = page.locator('.account-card');
    const retry = page.getByRole('link', {name: 'Yeni bağlantı iste'});
    const back = page.getByRole('link', {name: '← Giriş Sayfasına Dön'});

    await expect(card).toHaveCSS('border-radius', '16px');
    await expect(retry).toHaveCSS('border-radius', '8px');
    await expect(back).toHaveAttribute('href', '/giris');
    await expect(page.getByRole('region', {name: 'Gizlilik ve Çerez Tercihleri'})).toBeVisible();

    await page.getByRole('region', {name: 'Gizlilik ve Çerez Tercihleri'}).getByRole('button', {name: 'Reddet'}).click();
    await expect(page.getByRole('region', {name: 'Gizlilik ve Çerez Tercihleri'})).toHaveCount(0);
    await page.screenshot({path: info.outputPath(`password-recovery-${width}.png`), animations: 'disabled'});
  });
}
