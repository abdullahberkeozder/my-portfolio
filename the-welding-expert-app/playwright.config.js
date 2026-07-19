import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 2,
  use: {
    baseURL: "http://127.0.0.1:5292",
    channel: "msedge",
    viewport: { width: 390, height: 844 },
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 5292 --strictPort",
    url: "http://127.0.0.1:5292/appointment",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
