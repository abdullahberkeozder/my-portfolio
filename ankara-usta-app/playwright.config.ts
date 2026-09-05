import { defineConfig, devices } from '@playwright/test';

const crossBrowserProjects = process.env.PLAYWRIGHT_CROSS_BROWSER === 'true'
  ? [
      { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
      { name: 'mobile-webkit', use: { ...devices['iPhone 14'] } },
    ]
  : [];

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  // Remote multi-account fixtures mutate one isolated project. Serializing the
  // required integration run avoids cross-project Realtime load/race noise and
  // keeps local evidence equivalent to CI.
  workers: process.env.CI || process.env.REQUIRE_AUTH_E2E === 'true' ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:4187',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chromium',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'tablet-chromium',
      use: { ...devices['Desktop Chrome'], viewport: {width: 820, height: 1180}, hasTouch: true, isMobile: true },
    },
    {
      name: 'wide-chromium',
      use: { ...devices['Desktop Chrome'], viewport: {width: 1920, height: 1080} },
    },
    ...crossBrowserProjects,
  ],

  webServer: {
    command: process.platform === 'win32'
      ? '.\\.tools\\node-v24.19.0-win-x64\\node.exe node_modules\\vinext\\dist\\cli.js start --port 4187'
      : 'node node_modules/vinext/dist/cli.js start --port 4187',
    url: 'http://localhost:4187',
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
