import path from "node:path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import react from "@vitejs/plugin-react";

import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

// エイリアス設定追加
const alias = [
  {
    find: /^@\//,
    replacement: `${path.join(dirname, "src")}/`,
  },
  {
    find: "@",
    replacement: path.join(dirname, "src"),
  },
] as const;

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  // エイリアス設定追加
  resolve: {
    alias,
  },
  test: {
    projects: [
      // ユニットテスト用（integration含む）
      {
        plugins: [react()],
        resolve: {
          alias,
        },
        test: {
          name: "unit",
          environment: "jsdom",
          globals: true,
          setupFiles: ["./vitest.setup.ts"],
          include: [
            "src/**/*.{test,spec}.{ts,tsx}",
            "tests/integration/**/*.{test,spec}.{ts,tsx}",
          ],
        },
      },
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, ".storybook") }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
