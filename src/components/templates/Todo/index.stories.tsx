import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { RequestHandler } from "msw";
import { delay, HttpResponse, http } from "msw";
import { mswLoader } from "msw-storybook-addon";
import { expect } from "storybook/test";
import { createAuthMockHandlers } from "@/apis/auth.mock-handlers";
import type { TodoDto } from "@/apis/generated/model";
import {
  getTodoControllerCreateTodoUrl,
  getTodoControllerDeleteTodoUrl,
  getTodoControllerGetTodosUrl,
  getTodoControllerUpdateTodoUrl,
} from "@/apis/generated/todos/todos";
import {
  getTodoControllerCreateTodoMockHandler,
  getTodoControllerDeleteTodoMockHandler,
  getTodoControllerGetTodosMockHandler,
  getTodoControllerUpdateTodoMockHandler,
} from "@/apis/generated/todos/todos.msw";
import { TodoTemplate } from ".";

type TodoStoryParameters = {
  authHandlerFactory?: () => RequestHandler[];
  todoHandlerFactory?: () => RequestHandler[];
};

const newestTodoFixture: TodoDto = {
  id: "todo-new",
  title: "新しいTODO",
  completed: false,
  createdAt: "2026-06-05T02:00:00.000Z",
};

const oldCompletedTodoFixture: TodoDto = {
  id: "todo-old",
  title: "完了済みTODO",
  completed: true,
  createdAt: "2026-06-05T01:00:00.000Z",
};

const activeTodoFixture: TodoDto = {
  id: "story-active",
  title: "買い物メモを作る",
  completed: false,
  createdAt: "2026-06-05T03:00:00.000Z",
};

const completedTodoFixture: TodoDto = {
  id: "story-completed",
  title: "朝のレビューを終える",
  completed: true,
  createdAt: "2026-06-05T02:00:00.000Z",
};

const secondCompletedTodoFixture: TodoDto = {
  id: "story-completed-second",
  title: "週次レポートを提出する",
  completed: true,
  createdAt: "2026-06-05T01:00:00.000Z",
};

const authUserFixture = {
  displayName: "Cookie User",
  profileImageUrl: "/next.svg",
};

const defaultTodosFixture: TodoDto[] = [
  newestTodoFixture,
  oldCompletedTodoFixture,
];
const storyTodosFixture: TodoDto[] = [activeTodoFixture, completedTodoFixture];
const longListTodosFixture = Array.from(
  { length: 24 },
  (_, index): TodoDto => ({
    id: `story-long-${index + 1}`,
    title: `長い一覧のTODO ${String(index + 1).padStart(2, "0")}`,
    completed: index % 3 === 0,
    createdAt: new Date(Date.UTC(2026, 5, 5, 1, 59 - index)).toISOString(),
  }),
);

const todoErrorFixtures = {
  fetch: { message: "failed" },
  create: { message: "TODOを追加できませんでした" },
  update: { message: "完了状態を更新できませんでした" },
  delete: { message: "TODOを削除できませんでした" },
} as const;

const todoMockUrls = {
  collection: `*${getTodoControllerGetTodosUrl()}`,
  create: `*${getTodoControllerCreateTodoUrl()}`,
  update: `*${getTodoControllerUpdateTodoUrl(":id")}`,
  delete: `*${getTodoControllerDeleteTodoUrl(":id")}`,
} as const;

const loadTodoHandlers = async (context: Parameters<typeof mswLoader>[0]) => {
  const { authHandlerFactory, todoHandlerFactory } =
    context.parameters as typeof context.parameters & TodoStoryParameters;

  return mswLoader({
    parameters: {
      ...context.parameters,
      msw: {
        handlers: [
          ...(authHandlerFactory?.() ??
            createAuthMockHandlers({
              session: "authenticated",
              logout: "success",
              user: authUserFixture,
            })),
          ...(todoHandlerFactory?.() ?? []),
        ],
      },
    },
  });
};

const meta = {
  title: "Todo/TodoTemplate",
  component: TodoTemplate,
  args: {
    initialAuthStatus: "authenticated",
    initialAuthUser: authUserFixture,
  },
  loaders: [loadTodoHandlers],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof TodoTemplate>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    todoHandlerFactory: () => [
      getTodoControllerGetTodosMockHandler(() => defaultTodosFixture),
    ],
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

export const AuthChecking: Story = {
  args: {
    autoCheckAuth: false,
    initialAuthStatus: "checking",
    initialAuthUser: null,
  },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByText("ログイン状態を確認しています"),
    ).toBeInTheDocument();
  },
};

export const AuthError: Story = {
  args: {
    autoCheckAuth: false,
    initialAuthStatus: "error",
    initialAuthUser: null,
    initialAuthError: "認証状態を確認できませんでした",
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      "認証状態を確認できませんでした",
    );
    await expect(
      await canvas.findByRole("button", { name: "再試行" }),
    ).toBeEnabled();
  },
};

export const AuthenticatedAccount: Story = {
  args: {
    autoLoad: false,
    initialStatus: "idle",
    initialTodos: defaultTodosFixture,
    initialAuthStatus: "authenticated",
    initialAuthUser: authUserFixture,
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText("Cookie User")).toBeInTheDocument();
    await expect(
      await canvas.findByRole("button", { name: "ログアウト" }),
    ).toBeEnabled();
  },
};

export const LogoutPending: Story = {
  args: {
    autoLoad: false,
    initialStatus: "idle",
    initialTodos: defaultTodosFixture,
    initialAuthStatus: "authenticated",
    initialAuthUser: authUserFixture,
  },
  parameters: {
    authHandlerFactory: () =>
      createAuthMockHandlers({
        session: "authenticated",
        logout: "pending",
        user: authUserFixture,
      }),
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      await canvas.findByRole("button", { name: "ログアウト" }),
    );

    await expect(
      await canvas.findByRole("button", { name: "ログアウト" }),
    ).toBeDisabled();
    await expect(
      await canvas.findByText("ログアウトしています"),
    ).toBeInTheDocument();
  },
};

export const LogoutError: Story = {
  args: {
    autoLoad: false,
    initialStatus: "idle",
    initialTodos: defaultTodosFixture,
    initialAuthStatus: "authenticated",
    initialAuthUser: authUserFixture,
  },
  parameters: {
    authHandlerFactory: () =>
      createAuthMockHandlers({
        session: "authenticated",
        logout: "api-error",
        user: authUserFixture,
      }),
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      await canvas.findByRole("button", { name: "ログアウト" }),
    );

    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      "ログアウトできませんでした",
    );
  },
};

export const Empty: Story = {
  parameters: {
    todoHandlerFactory: () => [getTodoControllerGetTodosMockHandler(() => [])],
  },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByText("表示するTODOはありません"),
    ).toBeInTheDocument();
  },
};

export const Loading: Story = {
  parameters: {
    todoHandlerFactory: () => [
      getTodoControllerGetTodosMockHandler(async () => {
        await delay("infinite");
        return [];
      }),
    ],
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText("読み込み中")).toBeInTheDocument();
  },
};

export const FetchError: Story = {
  name: "Error",
  parameters: {
    todoHandlerFactory: () => [
      http.get(todoMockUrls.collection, () =>
        HttpResponse.json(todoErrorFixtures.fetch, { status: 500 }),
      ),
    ],
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
      http.post(todoMockUrls.create, () =>
        HttpResponse.json(todoErrorFixtures.create, { status: 500 }),
      ),
      getTodoControllerGetTodosMockHandler(() => storyTodosFixture),
    ],
  },
  play: async ({ canvas, userEvent }) => {
    const createButton = await canvas.findByRole("button", { name: "追加" });
    await userEvent.click(createButton);

    const alert = await canvas.findByRole("alert");
    await expect(alert).toHaveTextContent("TODOを追加できませんでした");
  },
};

export const CreatePending: Story = {
  args: {
    autoLoad: false,
    initialStatus: "idle",
    initialTodos: storyTodosFixture,
    initialDraft: "作成中のTODO",
  },
  parameters: {
    todoHandlerFactory: () => [
      getTodoControllerCreateTodoMockHandler(async () => {
        await delay("infinite");
        return activeTodoFixture;
      }),
    ],
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(await canvas.findByRole("button", { name: "追加" }));

    const pendingButton = await canvas.findByRole("button", {
      name: "追加中...",
    });
    await expect(pendingButton).toBeDisabled();
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
      http.patch(todoMockUrls.update, () =>
        HttpResponse.json(todoErrorFixtures.update, { status: 500 }),
      ),
      getTodoControllerGetTodosMockHandler(() => storyTodosFixture),
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

export const TogglePending: Story = {
  args: {
    autoLoad: false,
    initialStatus: "idle",
    initialTodos: storyTodosFixture,
  },
  parameters: {
    todoHandlerFactory: () => [
      getTodoControllerUpdateTodoMockHandler(async () => {
        await delay("infinite");
        return { ...activeTodoFixture, completed: true };
      }),
    ],
  },
  play: async ({ canvas, userEvent }) => {
    const checkbox = await canvas.findByRole("checkbox", {
      name: `${activeTodoFixture.title}を完了にする`,
    });
    await userEvent.click(checkbox);

    await expect(checkbox).toBeDisabled();
    await expect(await canvas.findByText("更新中...")).toBeInTheDocument();
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
      http.delete(todoMockUrls.delete, () =>
        HttpResponse.json(todoErrorFixtures.delete, { status: 500 }),
      ),
      getTodoControllerGetTodosMockHandler(() => storyTodosFixture),
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

export const DeletePending: Story = {
  args: {
    autoLoad: false,
    initialStatus: "idle",
    initialTodos: storyTodosFixture,
  },
  parameters: {
    todoHandlerFactory: () => [
      getTodoControllerDeleteTodoMockHandler(async () => {
        await delay("infinite");
      }),
    ],
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      await canvas.findByRole("button", {
        name: `削除: ${activeTodoFixture.title}`,
      }),
    );
    await userEvent.click(
      await canvas.findByRole("button", { name: "削除する" }),
    );

    const pendingButton = await canvas.findByRole("button", {
      name: "削除中...",
    });
    await expect(pendingButton).toBeDisabled();
    await expect(
      await canvas.findByRole("button", { name: "キャンセル" }),
    ).toBeDisabled();
  },
};

export const BulkDeletePending: Story = {
  args: {
    autoLoad: false,
    initialStatus: "idle",
    initialTodos: [
      activeTodoFixture,
      completedTodoFixture,
      secondCompletedTodoFixture,
    ],
  },
  parameters: {
    todoHandlerFactory: () => [
      getTodoControllerDeleteTodoMockHandler(async () => {
        await delay("infinite");
      }),
    ],
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      await canvas.findByRole("button", {
        name: "完了済みを一括削除（2件）",
      }),
    );

    const confirmButton = await canvas.findByRole("button", {
      name: "2件を削除する",
    });
    const cancelButton = await canvas.findByRole("button", {
      name: "キャンセル",
    });
    await userEvent.click(confirmButton);

    await expect(confirmButton).toBeDisabled();
    await expect(confirmButton).toHaveTextContent("削除中...");
    await expect(cancelButton).toBeDisabled();
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
