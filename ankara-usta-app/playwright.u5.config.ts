import {defineConfig, devices} from '@playwright/test';
import base from './playwright.config';

export default defineConfig({
  ...base,
  testDir: './tests/staging',
  testMatch: ['u5-workspaces-browser.spec.ts'],
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 90_000,
  projects: [{name: 'u5-chromium', use: {...devices['Desktop Chrome']}}],
  use: {...base.use, actionTimeout: 15_000, trace: 'off', video: 'off', screenshot: 'only-on-failure'},
});
