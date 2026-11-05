import {expect, test, type Page} from '@playwright/test';

const required = [
  'E2E_CUSTOMER_EMAIL', 'E2E_CUSTOMER_PASSWORD',
  'E2E_TRADESPERSON_EMAIL', 'E2E_TRADESPERSON_PASSWORD',
] as const;

function env(name: typeof required[number]) {
  const value = process.env[name];
  if (!value) throw new Error(`Eksik zorunlu U5 yapılandırması: ${name}`);
  return value;
}

async function signIn(page: Page, audience: 'customer' | 'tradesperson', email: string, password: string) {
  const next = audience === 'customer' ? '/taleplerim' : '/usta/talepler';
  const loginPath = audience === 'customer' ? '/giris' : '/usta/giris';
  await page.goto(`${loginPath}?next=${encodeURIComponent(next)}`);
  await page.getByLabel('E-posta Adresi').fill(email);
  await page.getByLabel('Parola', {exact: true}).fill(password);
  const token = page.waitForResponse(response => new URL(response.url()).pathname === '/auth/v1/token');
  await page.getByRole('button', {name: 'Giriş Yap →', exact: true}).click();
  expect((await token).ok()).toBe(true);
  await page.waitForURL(new RegExp(audience === 'customer' ? '/taleplerim$' : '/usta/talepler$'));
}

async function signOut(page: Page) {
  await page.getByRole('button', {name: 'Hesabım', exact: true}).click();
  const response = page.waitForResponse(item =>
    new URL(item.url()).pathname === '/api/auth/signout' && item.request().method() === 'POST');
  await page.getByRole('button', {name: 'Oturumu kapat', exact: true}).click();
  expect((await response).ok()).toBe(true);
  await page.waitForURL(/\/giris$/);
}

test('müşteri çalışma alanı gerçek oturumla açılır ve usta alanına erişim güvenli biçimde reddedilir', async ({page}) => {
  for (const name of required) env(name);
  await signIn(page, 'customer', env('E2E_CUSTOMER_EMAIL'), env('E2E_CUSTOMER_PASSWORD'));
  await expect(page.getByRole('heading', {name: 'Taleplerim', level: 1})).toBeVisible();
  await page.goto('/usta/talepler');
  await expect(page.getByRole('alert')).toContainText('Usta alanına erişiminiz yok');
  await expect(page.getByRole('link', {name: 'Müşteri alanına dön'})).toHaveAttribute('href', '/taleplerim');
  await signOut(page);
});

test('usta çalışma alanı gerçek oturumla açılır ve müşteri alanı ayrı kalır', async ({page}) => {
  for (const name of required) env(name);
  await signIn(page, 'tradesperson', env('E2E_TRADESPERSON_EMAIL'), env('E2E_TRADESPERSON_PASSWORD'));
  await expect(page.getByRole('heading', {name: 'İş fırsatları', level: 1})).toBeVisible();
  await expect(page.getByText('Size özel ve uygun açık talepleri inceleyin, sonraki adıma karar verin.')).toBeVisible();
  await page.goto('/taleplerim');
  await expect(page).toHaveURL(/\/taleplerim$/);
  await expect(page.getByRole('heading', {name: 'Taleplerim', level: 1})).toBeVisible();
  await signOut(page);
});
