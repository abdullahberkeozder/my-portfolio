import { expect, test } from '@playwright/test';

test('current page is exposed in desktop and mobile navigation', async ({ page }, testInfo) => {
  await page.goto('/nasil-calisir');

  if (testInfo.project.name.includes('mobile') || testInfo.project.name.includes('tablet')) {
    await page.getByRole('button', { name: 'Menüyü aç' }).click();
    const currentLink = page.locator('#mobile-navigation').getByRole('link', { name: 'Nasıl Çalışır?' });
    await expect(currentLink).toHaveAttribute('aria-current', 'page');
    await expect(currentLink).toBeVisible();
    return;
  }

  const currentLink = page.locator('.desktop-nav').getByRole('link', { name: 'Nasıl Çalışır?' });
  await expect(currentLink).toHaveAttribute('aria-current', 'page');
  await expect(currentLink).toHaveClass(/active/);
});

test('mobile home progressively discloses the long service directory', async ({page},testInfo) => {
  test.skip(!testInfo.project.name.includes('mobile'),'Mobile density behavior');
  await page.goto('/');
  await expect(page.locator('.orkestra-chip-pill:visible')).toHaveCount(3);
  await expect(page.locator('.editorial-service-row:visible')).toHaveCount(8);
  const toggle=page.getByRole('button',{name:'26 hizmetin tamamını göster'});
  await toggle.click();
  await expect(page.locator('.editorial-service-row:visible')).toHaveCount(26);
});

test('scroll hero keeps its sticky viewport compact while providing a bounded motion stage', async ({page},testInfo) => {
  test.skip(testInfo.project.name.includes('mobile'),'Covered by the small-screen density test');
  await page.goto('/');
  const dimensions=await page.evaluate(()=>{
    const stage=document.querySelector('.orkestra-hero-zone')?.getBoundingClientRect();
    const sticky=document.querySelector('.orkestra-hero-inner')?.getBoundingClientRect();
    return {stageHeight:stage?.height??0,stickyHeight:sticky?.height??0,viewport:innerHeight};
  });
  expect(dimensions.stickyHeight).toBeLessThanOrEqual(dimensions.viewport+1);
  expect(dimensions.stageHeight).toBeGreaterThan(dimensions.viewport*1.5);
  expect(dimensions.stageHeight).toBeLessThan(dimensions.viewport*1.9);
});

test('core journeys reflow without horizontal page overflow at 320 CSS pixels', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });

  for (const route of ['/', '/nasil-calisir', '/usta-basvurusu']) {
    await page.goto(route);
    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));

    expect(dimensions.scrollWidth, `${route} yatay taşma üretiyor`).toBeLessThanOrEqual(dimensions.clientWidth + 1);
  }
});

test('reduced motion preference removes decorative animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  const animationName = await page.locator('.orchestra-directional-logo').first().evaluate(element => getComputedStyle(element).animationName);

  expect(animationName).toBe('none');
});

test('mobile menu supports keyboard open and close without trapping the page', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const menuButton = page.getByRole('button', { name: 'Menüyü aç' });
  await menuButton.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('navigation', { name: 'Mobil navigasyon' })).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.getByRole('navigation', { name: 'Mobil navigasyon' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Menüyü aç' })).toBeFocused();
});
