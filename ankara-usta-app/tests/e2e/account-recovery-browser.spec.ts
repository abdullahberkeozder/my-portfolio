import {expect, test} from '@playwright/test';
import {createClient} from '@supabase/supabase-js';
import {randomBytes} from 'node:crypto';

const required = [
  'E2E_SUPABASE_URL',
  'E2E_SUPABASE_KEY',
  'E2E_SUPABASE_SERVICE_ROLE_KEY',
  'E2E_CUSTOMER_EMAIL',
  'E2E_CUSTOMER_PASSWORD',
] as const;

function env(name: typeof required[number]) {
  const value = process.env[name];
  if (!value) throw new Error(`Eksik zorunlu parola kurtarma yapılandırması: ${name}`);
  return value;
}

test('müşteri gerçek kurtarma bağlantısıyla parolasını değiştirir ve hesap erişimini korur', async ({page}) => {
  test.setTimeout(90_000);
  for (const name of required) env(name);
  expect(env('E2E_SUPABASE_URL')).toBe('https://hyuijuafuayzultbjvjb.supabase.co');
  const url = env('E2E_SUPABASE_URL');
  const email = env('E2E_CUSTOMER_EMAIL');
  const originalPassword = env('E2E_CUSTOMER_PASSWORD');
  const temporaryPassword = `E2e-${randomBytes(12).toString('base64url')}!`;
  const publicClient = createClient(url, env('E2E_SUPABASE_KEY'), {auth: {persistSession: false, autoRefreshToken: false}});
  const admin = createClient(url, env('E2E_SUPABASE_SERVICE_ROLE_KEY'), {auth: {persistSession: false, autoRefreshToken: false}});

  const baseline = await publicClient.auth.signInWithPassword({email, password: originalPassword});
  expect(baseline.error).toBeNull();
  const userId = baseline.data.user?.id;
  expect(userId).toBeTruthy();
  await publicClient.auth.signOut({scope: 'local'});

  let passwordChanged = false;
  try {
    const generated = await admin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {redirectTo: 'http://localhost:4187/auth/callback?next=/parola-yenile'},
    });
    expect(generated.error).toBeNull();
    const actionLink = generated.data.properties?.action_link;
    expect(actionLink).toBeTruthy();

    await page.goto(actionLink!);
    await page.waitForURL(/\/parola-yenile(?:[?#]|$)/, {timeout: 30_000});
    await expect(page.getByRole('heading', {name: 'Yeni Parolanızı Belirleyin'})).toBeVisible();
    await expect(page.getByLabel('Yeni Parola', {exact: true})).toBeVisible();

    await page.getByLabel('Yeni Parola', {exact: true}).fill(temporaryPassword);
    await page.getByLabel('Yeni Parola (Tekrar)').fill(temporaryPassword);
    const updateResponse = page.waitForResponse(response =>
      new URL(response.url()).pathname === '/auth/v1/user' && response.request().method() === 'PUT');
    await page.getByRole('button', {name: 'Parolayı güncelle'}).click();
    expect((await updateResponse).ok()).toBe(true);
    passwordChanged = true;
    await expect(page.getByRole('status')).toContainText('Parolanız başarıyla güncellendi.');
    await expect(page.getByRole('link', {name: 'Hesabıma git'})).toHaveAttribute('href', '/hesap');

    const oldLogin = await publicClient.auth.signInWithPassword({email, password: originalPassword});
    expect(oldLogin.error).not.toBeNull();
    const newLogin = await publicClient.auth.signInWithPassword({email, password: temporaryPassword});
    expect(newLogin.error).toBeNull();
    await publicClient.auth.signOut({scope: 'local'});
  } finally {
    if (userId) {
      const restored = await admin.auth.admin.updateUserById(userId, {password: originalPassword});
      expect(restored.error).toBeNull();
      const restoredLogin = await publicClient.auth.signInWithPassword({email, password: originalPassword});
      expect(restoredLogin.error).toBeNull();
      await publicClient.auth.signOut({scope: 'local'});
      if (passwordChanged) {
        const temporaryLogin = await publicClient.auth.signInWithPassword({email, password: temporaryPassword});
        expect(temporaryLogin.error).not.toBeNull();
      }
    }
  }
});
