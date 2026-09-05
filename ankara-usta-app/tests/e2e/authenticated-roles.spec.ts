import { expect, test } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns true when a persona's env credentials are fully defined.
 * Used to guard tests that require real auth accounts.
 */
function hasCredentials(email?: string, password?: string): boolean {
  return Boolean(email && password);
}

/**
 * Sign in via the /giris page and wait for navigation to complete.
 * Selectors are kept in sync with the live HTML in app/giris/page.tsx.
 *
 * Current live labels (as of 2026-09-01):
 *   <label for="auth-email">E-posta Adresi</label>
 *   <button type="submit">Giriş Yap →</button>
 */
async function signIn(
  page: import('@playwright/test').Page,
  email: string,
  password: string,
) {
  await page.goto('/giris');
  // Match the exact label text rendered in app/giris/page.tsx
  await page.getByLabel('E-posta Adresi').fill(email);
  await page.getByLabel('Parola', { exact: true }).fill(password);
  // Match the exact button text rendered in app/giris/page.tsx
  await page.getByRole('button', { name: 'Giriş Yap →' }).click();
}

// ---------------------------------------------------------------------------
// Persona redirect tests
// ---------------------------------------------------------------------------

type Persona = {
  name: string;
  email?: string;
  password?: string;
  landing: string;
};

const personas: Persona[] = [
  {
    name: 'müşteri',
    email: process.env.E2E_CUSTOMER_EMAIL,
    password: process.env.E2E_CUSTOMER_PASSWORD,
    landing: '/taleplerim',
  },
  {
    name: 'usta',
    email: process.env.E2E_TRADESPERSON_EMAIL,
    password: process.env.E2E_TRADESPERSON_PASSWORD,
    landing: '/usta/talepler',
  },
  {
    name: 'yönetici',
    email: process.env.E2E_ADMIN_EMAIL,
    password: process.env.E2E_ADMIN_PASSWORD,
    landing: '/yonetim/uyusmazliklar',
  },
];

for (const persona of personas) {
  test(`${persona.name} rolüne uygun çalışma alanına yönlendirilir`, async ({ page }) => {
    // Skip when credentials are absent — but note: in CI (forbidOnly=true)
    // test.skip() still counts as skipped, not failed.  Missing CI secrets
    // should be treated as a pipeline configuration error; the CI workflow
    // should validate secret presence before running auth-gated tests.
    test.skip(
      !hasCredentials(persona.email, persona.password),
      `${persona.name} E2E kimlik bilgileri (E2E_${persona.name.toUpperCase()}_EMAIL/PASSWORD) tanımlı değil.`,
    );

    await signIn(page, persona.email!, persona.password!);

    await expect(page).toHaveURL(
      new RegExp(`${persona.landing.replaceAll('/', '\\/')}(?:$|\\?)`),
      { timeout: 10_000 },
    );
  });
}

// ---------------------------------------------------------------------------
// Protected route preserves ?next= target after login
// ---------------------------------------------------------------------------

test('korumalı müşteri sayfası girişten sonra başlangıç hedefini korur', async ({ page }) => {
  test.skip(
    !hasCredentials(process.env.E2E_CUSTOMER_EMAIL, process.env.E2E_CUSTOMER_PASSWORD),
    'Müşteri E2E kimlik bilgileri (E2E_CUSTOMER_EMAIL/PASSWORD) tanımlı değil.',
  );

  await page.goto('/islerim');
  // App should redirect unauthenticated visitors to /giris?next=/islerim
  await expect(page).toHaveURL(/\/giris\?next=%2Fislerim|\/giris\?next=\/islerim/);

  await page.getByLabel('E-posta Adresi').fill(process.env.E2E_CUSTOMER_EMAIL!);
  await page.getByLabel('Parola', { exact: true }).fill(process.env.E2E_CUSTOMER_PASSWORD!);
  await page.getByRole('button', { name: 'Giriş Yap →' }).click();

  await expect(page).toHaveURL(/\/islerim$/, { timeout: 10_000 });
});
