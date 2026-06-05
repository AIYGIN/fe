import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { delay, HttpResponse, http } from "msw";
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

export const DeleteConfirm: Story = {
  args: {
    autoLoad: false,
    initialStatus: "idle",
    initialTodos: [activeTodo, completedTodo],
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: `削除: ${activeTodo.title}` }),
    );
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
