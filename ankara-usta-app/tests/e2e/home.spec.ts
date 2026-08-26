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
