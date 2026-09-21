import {defineConfig,devices} from '@playwright/test';
import base from './playwright.config';

export default defineConfig({
  ...base,
  testDir:'./tests/e2e',
  testMatch:'golden-musluk-browser.spec.ts',
  fullyParallel:false,
  workers:1,
  retries:0,
  timeout:150_000,
  projects:[{name:'p1-golden-chromium',use:{...devices['Desktop Chrome']}}],
  use:{...base.use,actionTimeout:15_000,trace:'off',video:'off',screenshot:'only-on-failure'},
});
