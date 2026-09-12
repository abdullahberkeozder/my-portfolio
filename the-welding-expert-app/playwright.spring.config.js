import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e/spring", workers: 1, timeout: 45000,
  reporter: [["list"], ["html", { outputFolder: "playwright-spring-report", open: "never" }]],
  use: { baseURL: "http://127.0.0.1:5293", timezoneId: "Europe/Istanbul", trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [
    { name: "mobile", use: { viewport: { width: 390, height: 844 } } },
    { name: "desktop", use: { viewport: { width: 1280, height: 900 } } },
  ],
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 5293 --strictPort",
    url: "http://127.0.0.1:5293/appointment", reuseExistingServer: false,
    env: { VITE_BOOKING_READ_BACKEND: "spring", VITE_BOOKING_WRITE_BACKEND: "spring", VITE_SUPABASE_URL: "https://staging.invalid", VITE_SUPABASE_ANON_KEY: "synthetic-test-key" },
  },
});
