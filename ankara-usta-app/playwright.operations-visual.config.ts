import { defineConfig, devices } from '@playwright/test';
import base from './playwright.config';

export default defineConfig({
  ...base,
  testDir: './tests/staging',
  testMatch: 'operations-visual.spec.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 90_000,
  projects: [{ name: 'operations-visual-chromium', use: { ...devices['Desktop Chrome'] } }],
  use: { ...base.use, trace: 'off', video: 'off', screenshot: 'only-on-failure' },
});
