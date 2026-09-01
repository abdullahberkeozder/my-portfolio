import { expect, test } from '@playwright/test';

test('required authenticated persona credentials are configured', () => {
  test.skip(process.env.REQUIRE_AUTH_E2E !== 'true', 'Only enforced by the Supabase integration job.');
  const required = [
    'E2E_CUSTOMER_EMAIL', 'E2E_CUSTOMER_PASSWORD',
    'E2E_TRADESPERSON_EMAIL', 'E2E_TRADESPERSON_PASSWORD',
    'E2E_ADMIN_EMAIL', 'E2E_ADMIN_PASSWORD',
  ];
  const missing = required.filter(key => !process.env[key]);
  expect(missing, `Missing required integration secrets: ${missing.join(', ')}`).toEqual([]);
});
