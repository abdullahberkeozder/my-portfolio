import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('homepage has no automatically detectable serious accessibility violations', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({page}).analyze();
  const seriousViolations = results.violations.filter((violation) =>
    violation.impact === 'serious' || violation.impact === 'critical'
  );

  expect(seriousViolations, JSON.stringify(seriousViolations, null, 2)).toEqual([]);
});

test('classification and request dialogs have no serious accessibility violations', async ({ page }) => {
  await page.goto('/');
  const search = page.getByRole('textbox', { name: 'İhtiyacınızı yazın' });
  await search.fill('TV duvar montajı');
  await search.press('Enter');

  const classification = page.getByRole('dialog', { name: 'İhtiyacınızı doğru anladık mı?' });
  await expect(classification).toBeVisible();
  let results = await new AxeBuilder({page}).include('.classification-dialog').analyze();
  expect(
    results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? '')),
    JSON.stringify(results.violations, null, 2),
  ).toEqual([]);

  await classification.getByRole('button', { name: /Bu Hizmetle Devam Et/i }).click();
  const wizard = page.getByRole('dialog', { name: 'TV Duvar Montajı' });
  await expect(wizard).toBeVisible();
  results = await new AxeBuilder({page}).include('.wizard-dialog').analyze();
  expect(
    results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? '')),
    JSON.stringify(results.violations, null, 2),
  ).toEqual([]);
});
