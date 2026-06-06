import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { delay, HttpResponse, http } from "msw";
import { expect } from "storybook/test";
import { TodoPage } from "./TodoPage";

const activeTodo = {
  id: "story-active",
  title: "買い物メモを作る",
  completed: false,
  createdAt: "2026-06-05T03:00:00.000Z",
};

const completedTodo = {
  id: "story-completed",
  title: "朝のレビューを終える",
  completed: true,
  createdAt: "2026-06-05T02:00:00.000Z",
};

const longListTodos = Array.from({ length: 24 }, (_, index) => ({
  id: `story-long-${index + 1}`,
  title: `長い一覧のTODO ${String(index + 1).padStart(2, "0")}`,
  completed: index % 3 === 0,
  createdAt: new Date(Date.UTC(2026, 5, 5, 1, 59 - index)).toISOString(),
}));

const meta = {
  title: "Todo/TodoPage",
  component: TodoPage,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof TodoPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  parameters: {
    msw: {
      handlers: [http.get("*/api/todos", () => HttpResponse.json([]))],
    },
  },
};

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("*/api/todos", async () => {
          await delay("infinite");
          return HttpResponse.json([]);
        }),
      ],
    },
  },
};

export const FetchError: Story = {
  name: "Error",
  parameters: {
    msw: {
      handlers: [
        http.get("*/api/todos", () =>
          HttpResponse.json({ message: "failed" }, { status: 500 }),
        ),
      ],
    },
  },
};

export const FilteredActive: Story = {
  args: {
    autoLoad: false,
    initialStatus: "idle",
    initialFilter: "active",
    initialTodos: [activeTodo, completedTodo],
  },
};

export const FilteredCompleted: Story = {
  args: {
    autoLoad: false,
    initialStatus: "idle",
    initialFilter: "completed",
    initialTodos: [activeTodo, completedTodo],
  },
};

export const SearchNoResults: Story = {
  args: {
    autoLoad: false,
    initialStatus: "idle",
    initialTodos: [activeTodo, completedTodo],
  },
  play: async ({ canvas, userEvent }) => {
    const searchbox = await canvas.findByRole("searchbox", {
      name: "TODOを検索",
    });
    await userEvent.type(searchbox, "一致しない検索語");
    const noResults = await canvas.findByText(
      "検索条件に一致するTODOはありません",
    );
    await expect(noResults).toBeInTheDocument();
  },
};

export const CompletionProgress: Story = {
  args: {
    autoLoad: false,
    initialStatus: "idle",
    initialTodos: [activeTodo, completedTodo],
  },
};

export const DeleteConfirm: Story = {
  args: {
    autoLoad: false,
    initialStatus: "idle",
    initialTodos: [activeTodo, completedTodo],
  },
  play: async ({ canvas, userEvent }) => {
    const deleteButton = await canvas.findByRole("button", {
      name: `削除: ${activeTodo.title}`,
    });
    await userEvent.click(deleteButton);

    const dialog = await canvas.findByRole("dialog", {
      name: "TODOを削除",
    });
    await expect(dialog).toBeInTheDocument();
  },
};

export const BulkDeleteConfirm: Story = {
  args: {
    autoLoad: false,
    initialStatus: "idle",
    initialTodos: [activeTodo, completedTodo],
  },
  play: async ({ canvas, userEvent }) => {
    const bulkDeleteButton = await canvas.findByRole("button", {
      name: "完了済みを一括削除（1件）",
    });
    await userEvent.click(bulkDeleteButton);

    const dialog = await canvas.findByRole("dialog", {
      name: "完了済みTODOを一括削除",
    });
    await expect(dialog).toBeInTheDocument();
  },
};

export const ValidationError: Story = {
  args: {
    autoLoad: false,
    initialStatus: "idle",
    initialTodos: [activeTodo],
    initialDraft: " ".repeat(2),
    initialValidationError: "TODOを入力してください",
  },
};

export const CreateErrorRecoverable: Story = {
  args: {
    autoLoad: false,
    initialStatus: "idle",
    initialTodos: [activeTodo, completedTodo],
    initialDraft: "入力を保持するTODO",
  },
  parameters: {
    msw: {
      handlers: [
        http.post("*/api/todos", () =>
          HttpResponse.json(
            { message: "TODOを追加できませんでした" },
            { status: 500 },
          ),
        ),
      ],
    },
  },
  play: async ({ canvas, userEvent }) => {
    const createButton = await canvas.findByRole("button", { name: "追加" });
    await userEvent.click(createButton);

    const alert = await canvas.findByRole("alert");
    await expect(alert).toHaveTextContent("TODOを追加できませんでした");
  },
};

export const ToggleError: Story = {
  args: {
    autoLoad: false,
    initialStatus: "idle",
    initialTodos: [activeTodo, completedTodo],
  },
  parameters: {
    msw: {
      handlers: [
        http.patch("*/api/todos/:id", () =>
          HttpResponse.json(
            { message: "完了状態を更新できませんでした" },
            { status: 500 },
          ),
        ),
      ],
    },
  },
  play: async ({ canvas, userEvent }) => {
    const checkbox = await canvas.findByRole("checkbox", {
      name: `${activeTodo.title}を完了にする`,
    });
    await userEvent.click(checkbox);

    const alert = await canvas.findByRole("alert");
    await expect(alert).toHaveTextContent("完了状態を更新できませんでした");
  },
};

export const DeleteError: Story = {
  args: {
    autoLoad: false,
    initialStatus: "idle",
    initialTodos: [activeTodo, completedTodo],
  },
  parameters: {
    msw: {
      handlers: [
        http.delete("*/api/todos/:id", () =>
          HttpResponse.json(
            { message: "TODOを削除できませんでした" },
            { status: 500 },
          ),
        ),
      ],
    },
  },
  play: async ({ canvas, userEvent }) => {
    const deleteButton = await canvas.findByRole("button", {
      name: `削除: ${activeTodo.title}`,
    });
    await userEvent.click(deleteButton);

    const dialog = await canvas.findByRole("dialog", { name: "TODOを削除" });
    await userEvent.click(
      await canvas.findByRole("button", { name: "削除する" }),
    );

    const alert = await canvas.findByRole("alert");
    await expect(alert).toHaveTextContent("TODOを削除できませんでした");
    await expect(dialog).toBeInTheDocument();
  },
};

export const Mobile: Story = {
  args: {
    autoLoad: false,
    initialStatus: "idle",
    initialTodos: [activeTodo, completedTodo],
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};

export const LongList: Story = {
  args: {
    autoLoad: false,
    initialStatus: "idle",
    initialTodos: longListTodos,
  },
};
