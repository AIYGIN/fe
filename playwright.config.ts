import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",

  use: {
    baseURL: "http://localhost:3000",
    headless: true,
  },

  webServer: {
    command: "NEXT_PUBLIC_TODO_ENABLE_BROWSER_MOCK=true pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
