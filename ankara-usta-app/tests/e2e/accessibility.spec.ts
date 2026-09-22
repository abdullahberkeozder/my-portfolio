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
  let results = await new AxeBuilder({page}).include('[role="dialog"]').analyze();
  expect(
    results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? '')),
    JSON.stringify(results.violations, null, 2),
  ).toEqual([]);

  await classification.getByRole('button', { name: /Bu Hizmetle Devam Et/i }).click();
  const wizard = page.getByRole('dialog', { name: 'TV Duvar Montajı' });
  await expect(wizard).toBeVisible();
  results = await new AxeBuilder({page}).include('[role="dialog"]').analyze();
  expect(
    results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? '')),
    JSON.stringify(results.violations, null, 2),
  ).toEqual([]);
});

test('homepage reflows at 320 CSS pixels without horizontal scroll', async ({ page }) => {
  // Set viewport to 320px width (WCAG 1.4.10 400% zoom equivalent of 1280px)
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto('/');

  // Verify no horizontal scrolling on the root container
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);

  // Verify no serious or critical accessibility violations at 320px
  const results = await new AxeBuilder({ page }).analyze();
  const seriousViolations = results.violations.filter((v) =>
    ['serious', 'critical'].includes(v.impact ?? '')
  );
  expect(seriousViolations).toEqual([]);
});

test('classification dialog traps keyboard focus and restores focus on Escape dismissal (WCAG 2.1.2 & 2.4.3)', async ({ page }) => {
  await page.goto('/');
  const search = page.getByRole('textbox', { name: 'İhtiyacınızı yazın' });
  await search.click();
  await search.fill('TV duvar montajı');
  await search.press('Enter');

  const classification = page.getByRole('dialog', { name: 'İhtiyacınızı doğru anladık mı?' });
  await expect(classification).toBeVisible();

  // Focus must be inside dialog
  const isInsideDialog = await page.evaluate(() => {
    const active = document.activeElement;
    const dialog = document.querySelector('[role="dialog"]');
    return dialog ? dialog.contains(active) : false;
  });
  expect(isInsideDialog).toBe(true);

  const controls = classification.locator('a[href]:visible, button:visible:not([disabled]), input:visible:not([disabled]), select:visible:not([disabled]), textarea:visible:not([disabled]), [tabindex="0"]:visible');
  await expect(controls.first()).toBeVisible();
  await controls.last().focus();
  await page.keyboard.press('Tab');
  await expect(controls.first()).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(controls.last()).toBeFocused();

  // Press Escape to dismiss dialog
  await page.keyboard.press('Escape');
  await expect(classification).toBeHidden();

  await expect(search).toBeFocused();
});

test('request wizard exposes modal semantics, progress status and modal-open marker', async ({ page }) => {
  await page.goto('/');
  const search = page.getByRole('textbox', { name: 'İhtiyacınızı yazın' });
  await search.fill('TV duvar montajı');
  await search.press('Enter');

  const classification = page.getByRole('dialog', { name: 'İhtiyacınızı doğru anladık mı?' });
  await classification.getByRole('button', { name: /Bu Hizmetle Devam Et/i }).click();

  const wizard = page.getByRole('dialog', { name: 'TV Duvar Montajı' });
  await expect(wizard).toBeVisible();

  // Verify aria-modal attribute
  const ariaModal = await wizard.getAttribute('aria-modal');
  expect(ariaModal).toBe('true');

  // Verify status progress role
  const progress = wizard.getByRole('status');
  await expect(progress).toBeVisible();

  // Verify background body has data-modal-open
  const modalOpen = await page.evaluate(() => document.body.dataset.modalOpen);
  expect(modalOpen).toBe('true');
});
