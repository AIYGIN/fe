import type { Preview } from "@storybook/nextjs-vite";

import { initialize, mswLoader } from "msw-storybook-addon";
import { createTodoMockHandlers } from "../src/apis/todos.fixtures";

initialize({ onUnhandledRequest: "warn" }, createTodoMockHandlers());

const preview: Preview = {
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
