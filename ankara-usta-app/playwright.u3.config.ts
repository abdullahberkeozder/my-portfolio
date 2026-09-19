import {defineConfig} from '@playwright/test';
import base from './playwright.config';
export default defineConfig({...base,testDir:'./tests/staging',workers:1,retries:0,timeout:60000,
  projects:[{name:'u3-chromium',use:{browserName:'chromium'}}],
  use:{...base.use,trace:'off',video:'off',screenshot:'only-on-failure'},
});
