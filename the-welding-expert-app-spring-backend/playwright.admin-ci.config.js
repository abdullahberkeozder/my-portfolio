import { defineConfig } from "@playwright/test";
import { apiOrigin } from "./e2e/admin-ci/isolation.mjs";

export default defineConfig({
  testDir: "./e2e/admin-ci",
  testMatch: "**/*.spec.js",
  workers: 1,
  retries: 0,
  timeout: 90000,
  expect: { timeout: 10000 },
  reporter: [["list"], ["html", { outputFolder: "playwright-admin-report", open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:5294", timezoneId: "Europe/Istanbul",
    // Real sessions and hybrid detail responses contain tokens; never retain network traces.
    trace: "off", video: "off", screenshot: "only-on-failure", serviceWorkers: "block",
  },
  projects: [
    { name: "mobile-admin", use: { viewport: { width: 390, height: 844 } } },
    { name: "desktop-admin", use: { viewport: { width: 1280, height: 900 } } },
  ],
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 5294 --strictPort",
    url: "http://127.0.0.1:5294/login", reuseExistingServer: false,
    env: {
      VITE_SUPABASE_URL: apiOrigin, VITE_SUPABASE_ANON_KEY: process.env.UMUT_TEST_ANON_KEY || "",
      VITE_BOOKING_READ_BACKEND: "spring", VITE_BOOKING_WRITE_BACKEND: "spring",
      VITE_BOOKING_ADMIN_BACKEND: "spring",
    },
  },
});
