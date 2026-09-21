import {defineConfig, devices} from '@playwright/test';
import base from './playwright.config';

export default defineConfig({
  ...base,
  testDir: './tests/e2e',
  testMatch: 'account-recovery-browser.spec.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 90_000,
  projects: [{name: 'account-recovery-chromium', use: {...devices['Desktop Chrome']}}],
  use: {...base.use, actionTimeout: 15_000, trace: 'off', video: 'off', screenshot: 'only-on-failure'},
});
