import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { RequestHandler } from "msw";
import { mswLoader } from "msw-storybook-addon";
import { expect } from "storybook/test";
import {
  activeTodoFixture,
  completedTodoFixture,
  createDeleteTodoErrorHandler,
  createEmptyTodosHandler,
  createFetchTodosErrorHandler,
  createLoadingTodosHandler,
  createTodoErrorHandler,
  createTodoMockHandlers,
  createUpdateTodoErrorHandler,
  defaultTodosFixture,
  longListTodosFixture,
  storyTodosFixture,
} from "@/apis/todos.fixtures";
import { TodoPage } from "./TodoPage";

type TodoStoryParameters = {
  todoHandlerFactory?: () => RequestHandler[];
};

const loadTodoHandlers = async (context: Parameters<typeof mswLoader>[0]) => {
  const { todoHandlerFactory } =
    context.parameters as typeof context.parameters & TodoStoryParameters;

  if (!todoHandlerFactory) {
    return {};
  }

  return mswLoader({
    parameters: {
      ...context.parameters,
      msw: {
        handlers: todoHandlerFactory(),
      },
    },
  });
};

const meta = {
  title: "Todo/TodoPage",
  component: TodoPage,
  loaders: [loadTodoHandlers],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof TodoPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    todoHandlerFactory: () => createTodoMockHandlers(),
  },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByText(defaultTodosFixture[0].title),
    ).toBeInTheDocument();
    await expect(
      await canvas.findByText(defaultTodosFixture[1].title),
    ).toBeInTheDocument();
  },
};

export const Empty: Story = {
  parameters: {
    todoHandlerFactory: () => [createEmptyTodosHandler()],
  },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByText("表示するTODOはありません"),
    ).toBeInTheDocument();
  },
};

export const Loading: Story = {
  parameters: {
    todoHandlerFactory: () => [createLoadingTodosHandler()],
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText("読み込み中")).toBeInTheDocument();
  },
};

export const FetchError: Story = {
  name: "Error",
  parameters: {
    todoHandlerFactory: () => [createFetchTodosErrorHandler()],
  },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByText("TODO一覧を取得できませんでした"),
    ).toBeInTheDocument();
  },
};

export const FilteredActive: Story = {
  args: {
    autoLoad: false,
    initialStatus: "idle",
    initialFilter: "active",
    initialTodos: storyTodosFixture,
  },
};

export const FilteredCompleted: Story = {
  args: {
    autoLoad: false,
    initialStatus: "idle",
    initialFilter: "completed",
    initialTodos: storyTodosFixture,
  },
};

export const SearchNoResults: Story = {
  args: {
    autoLoad: false,
    initialStatus: "idle",
    initialTodos: storyTodosFixture,
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
    initialTodos: storyTodosFixture,
  },
};

export const DeleteConfirm: Story = {
  args: {
    autoLoad: false,
    initialStatus: "idle",
    initialTodos: storyTodosFixture,
  },
  play: async ({ canvas, userEvent }) => {
    const deleteButton = await canvas.findByRole("button", {
      name: `削除: ${activeTodoFixture.title}`,
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
    initialTodos: storyTodosFixture,
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
    initialTodos: [activeTodoFixture],
    initialDraft: " ".repeat(2),
    initialValidationError: "TODOを入力してください",
  },
};

export const CreateErrorRecoverable: Story = {
  args: {
    autoLoad: false,
    initialStatus: "idle",
    initialTodos: storyTodosFixture,
    initialDraft: "入力を保持するTODO",
  },
  parameters: {
    todoHandlerFactory: () => [
      createTodoErrorHandler(),
      ...createTodoMockHandlers(storyTodosFixture),
    ],
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
    initialTodos: storyTodosFixture,
  },
  parameters: {
    todoHandlerFactory: () => [
      createUpdateTodoErrorHandler(),
      ...createTodoMockHandlers(storyTodosFixture),
    ],
  },
  play: async ({ canvas, userEvent }) => {
    const checkbox = await canvas.findByRole("checkbox", {
      name: `${activeTodoFixture.title}を完了にする`,
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
    initialTodos: storyTodosFixture,
  },
  parameters: {
    todoHandlerFactory: () => [
      createDeleteTodoErrorHandler(),
      ...createTodoMockHandlers(storyTodosFixture),
    ],
  },
  play: async ({ canvas, userEvent }) => {
    const deleteButton = await canvas.findByRole("button", {
      name: `削除: ${activeTodoFixture.title}`,
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
    initialTodos: [activeTodoFixture, completedTodoFixture],
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
    initialTodos: longListTodosFixture,
  },
};
