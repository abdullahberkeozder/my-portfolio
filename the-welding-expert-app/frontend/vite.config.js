import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import eslint from "vite-plugin-eslint";
// https://vitejs.dev/config/
export default defineConfig({
  server: process.env.CI_SPRING_ORIGIN ? {
    proxy: { "/api/v1": { target: process.env.CI_SPRING_ORIGIN } },
  } : undefined,
  plugins: [react(), eslint()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
    css: true,
    clearMocks: true,
    exclude: ["e2e/**", "node_modules/**", "dist/**", "build/**"],
  },
});
