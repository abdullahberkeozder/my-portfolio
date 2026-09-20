import {defineConfig,devices} from '@playwright/test';
import base from './playwright.config';

export default defineConfig({
  ...base,
  testDir:'./tests/e2e',
  testMatch:'multi-session.spec.ts',
  fullyParallel:false,
  workers:1,
  retries:0,
  timeout:60000,
  projects:[{name:'r2-chromium',use:{...devices['Desktop Chrome']}}],
  use:{...base.use,trace:'off',video:'off',screenshot:'only-on-failure'},
});
