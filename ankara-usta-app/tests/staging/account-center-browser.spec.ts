import {expect, test, type Page} from '@playwright/test';
import {createClient} from '@supabase/supabase-js';

const stagingUrl = 'https://hyuijuafuayzultbjvjb.supabase.co';
const required = [
  'E2E_SUPABASE_URL',
  'E2E_SUPABASE_KEY',
  'E2E_SUPABASE_SERVICE_ROLE_KEY',
  'E2E_CUSTOMER_EMAIL',
  'E2E_CUSTOMER_PASSWORD',
  'E2E_SECOND_CUSTOMER_EMAIL',
  'E2E_SECOND_CUSTOMER_PASSWORD',
] as const;

function env(name: typeof required[number]) {
  const value = process.env[name];
  if (!value) throw new Error(`Eksik zorunlu U4 yapılandırması: ${name}`);
  return value;
}

async function signIn(page: Page, email: string, password: string) {
  await page.goto('/giris?next=/hesap?workspace=customer');
  await page.getByLabel('E-posta Adresi').fill(email);
  await page.getByLabel('Parola', {exact: true}).fill(password);
  const token = page.waitForResponse(response => new URL(response.url()).pathname === '/auth/v1/token');
  await page.getByRole('button', {name: 'Giriş Yap →', exact: true}).click();
  expect((await token).ok()).toBe(true);
  await page.waitForURL(/\/hesap\?workspace=customer$/);
}

async function signOut(page: Page) {
  const response = page.waitForResponse(item =>
    new URL(item.url()).pathname === '/api/auth/signout' && item.request().method() === 'POST');
  await page.getByRole('button', {name: 'Oturumu kapat', exact: true}).click();
  expect((await response).ok()).toBe(true);
  await page.waitForURL(/\/giris$/);
}

test.afterEach(async ({page}) => {
  await page.locator('input').evaluateAll(inputs => inputs.forEach(input => {
    if (input instanceof HTMLInputElement) input.value = '';
  })).catch(() => {});
});

test('hesap merkezi adı ve şehri günceller, navbarı yeniler ve yerel çıkış yapar', async ({page}) => {
  test.setTimeout(90_000);
  for (const name of required) env(name);
  expect(env('E2E_SUPABASE_URL')).toBe(stagingUrl);

  const publicClient = createClient(stagingUrl, env('E2E_SUPABASE_KEY'), {auth: {persistSession: false, autoRefreshToken: false}});
  const admin = createClient(stagingUrl, env('E2E_SUPABASE_SERVICE_ROLE_KEY'), {auth: {persistSession: false, autoRefreshToken: false}});
  const baseline = await publicClient.auth.signInWithPassword({email: env('E2E_CUSTOMER_EMAIL'), password: env('E2E_CUSTOMER_PASSWORD')});
  expect(baseline.error).toBeNull();
  const userId = baseline.data.user?.id;
  expect(userId).toBeTruthy();
  const originalMetadata = baseline.data.user?.user_metadata ?? {};
  const profile = await publicClient.from('user_profiles').select('display_name').eq('user_id', userId!).single();
  expect(profile.error).toBeNull();
  const originalName = profile.data!.display_name as string;
  const changedName = `${originalName.slice(0, 100)} U4`;
  await publicClient.auth.signOut({scope: 'local'});

  try {
    await signIn(page, env('E2E_CUSTOMER_EMAIL'), env('E2E_CUSTOMER_PASSWORD'));
    await expect(page.getByRole('heading', {name: 'Hesabınız'})).toBeVisible();
    await expect(page.getByLabel('Görünen ad')).toHaveValue(originalName);

    await page.getByLabel('Görünen ad').fill(changedName);
    const profileResponse = page.waitForResponse(response =>
      new URL(response.url()).pathname === '/api/account/profile' && response.request().method() === 'POST');
    await page.getByRole('button', {name: 'Değişiklikleri kaydet'}).click();
    expect((await profileResponse).ok()).toBe(true);
    await expect(page.getByText('Görünen adınız kaydedildi.', {exact: true})).toBeVisible();

    await page.getByRole('button', {name: 'Hesabım', exact: true}).click();
    const accountDialog = page.getByRole('dialog', {name: 'Hesabım'});
    await expect(accountDialog.getByText(changedName, {exact: true})).toBeVisible();
    await accountDialog.getByRole('button', {name: 'Kapat', exact: true}).click();

    const cityResponse = page.waitForResponse(response =>
      new URL(response.url()).pathname === '/api/account/city' && response.request().method() === 'POST');
    await page.getByRole('button', {name: 'Şehri kaydet'}).click();
    expect((await cityResponse).ok()).toBe(true);
    await expect(page.getByText('Şehriniz Ankara olarak kaydedildi.', {exact: true})).toBeVisible();
    await expect(page.getByText('Kayıtlı şehir: Ankara', {exact: true})).toBeVisible();
    await page.reload();
    await expect(page.getByText('Kayıtlı şehir: Ankara', {exact: true})).toBeVisible();
    await expect(page.getByLabel('Görünen ad')).toHaveValue(changedName);

    await page.getByLabel('Görünen ad').fill(originalName);
    await page.getByRole('button', {name: 'Değişiklikleri kaydet'}).click();
    await expect(page.getByText('Görünen adınız kaydedildi.', {exact: true})).toBeVisible();

    await signOut(page);
    await expect(page.getByRole('button', {name: 'Giriş / Kayıt', exact: true})).toBeVisible();

    await signIn(page, env('E2E_SECOND_CUSTOMER_EMAIL'), env('E2E_SECOND_CUSTOMER_PASSWORD'));
    await expect(page.getByLabel('Görünen ad')).not.toHaveValue(changedName);
    await page.getByRole('button', {name: 'Hesabım', exact: true}).click();
    await expect(page.getByRole('dialog', {name: 'Hesabım'}).getByText(changedName, {exact: true})).toHaveCount(0);
    await page.getByRole('dialog', {name: 'Hesabım'}).getByRole('button', {name: 'Kapat', exact: true}).click();
    await signOut(page);
  } finally {
    if (userId) {
      const [profileRestore, metadataRestore] = await Promise.all([
        admin.from('user_profiles').update({display_name: originalName}).eq('user_id', userId).select('display_name').single(),
        admin.auth.admin.updateUserById(userId, {user_metadata: originalMetadata}),
      ]);
      expect(profileRestore.error).toBeNull();
      expect(profileRestore.data?.display_name).toBe(originalName);
      expect(metadataRestore.error).toBeNull();
    }
  }
});
