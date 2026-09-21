import {defineConfig, devices} from '@playwright/test';
import base from './playwright.config';

export default defineConfig({
  ...base,
  testDir: './tests/staging',
  testMatch: ['account-center-browser.spec.ts', 'account-switch-draft-isolation.spec.ts'],
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 90_000,
  projects: [{name: 'u4-chromium', use: {...devices['Desktop Chrome']}}],
  use: {...base.use, actionTimeout: 15_000, trace: 'off', video: 'off', screenshot: 'only-on-failure'},
});
