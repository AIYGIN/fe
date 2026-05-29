import type { Preview } from "@storybook/nextjs-vite";

// mswの設定追加
import { initialize, mswLoader } from "msw-storybook-addon";
import { sampleHandlers } from "../src/lib/msw/handlers/sample";

// mswの初期化
initialize({ onUnhandledRequest: "warn" }, [...sampleHandlers]);

const preview: Preview = {
  // mswの設定追加
  loaders: [mswLoader],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
  },
};

export default preview;
