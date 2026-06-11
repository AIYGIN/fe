import { delay, HttpResponse, http, type RequestHandler } from "msw";
import type { ErrorResponseSchema, TodoDto } from "./generated/model";
import {
  getTodoControllerCreateTodoUrl,
  getTodoControllerDeleteTodoUrl,
  getTodoControllerGetTodosUrl,
  getTodoControllerUpdateTodoUrl,
} from "./generated/todos/todos";
import {
  getTodoControllerCreateTodoMockHandler,
  getTodoControllerDeleteTodoMockHandler,
  getTodoControllerGetTodosMockHandler,
  getTodoControllerUpdateTodoMockHandler,
} from "./generated/todos/todos.msw";

export const newestTodoFixture: TodoDto = {
  id: "todo-new",
  title: "新しいTODO",
  completed: false,
  createdAt: "2026-06-05T02:00:00.000Z",
};

export const oldCompletedTodoFixture: TodoDto = {
  id: "todo-old",
  title: "完了済みTODO",
  completed: true,
  createdAt: "2026-06-05T01:00:00.000Z",
};

export const activeTodoFixture: TodoDto = {
  id: "story-active",
  title: "買い物メモを作る",
  completed: false,
  createdAt: "2026-06-05T03:00:00.000Z",
};

export const completedTodoFixture: TodoDto = {
  id: "story-completed",
  title: "朝のレビューを終える",
  completed: true,
  createdAt: "2026-06-05T02:00:00.000Z",
};

export const englishTodoFixture: TodoDto = {
  id: "todo-english",
  title: "Review Storybook",
  completed: false,
  createdAt: "2026-06-05T03:00:00.000Z",
};

export const defaultTodosFixture = [
  newestTodoFixture,
  oldCompletedTodoFixture,
] satisfies TodoDto[];

export const storyTodosFixture = [
  activeTodoFixture,
  completedTodoFixture,
] satisfies TodoDto[];

export const longListTodosFixture = Array.from(
  { length: 24 },
  (_, index): TodoDto => ({
    id: `story-long-${index + 1}`,
    title: `長い一覧のTODO ${String(index + 1).padStart(2, "0")}`,
    completed: index % 3 === 0,
    createdAt: new Date(Date.UTC(2026, 5, 5, 1, 59 - index)).toISOString(),
  }),
);

export const todoErrorFixtures = {
  fetch: { message: "failed" },
  create: { message: "TODOを追加できませんでした" },
  update: { message: "完了状態を更新できませんでした" },
  delete: { message: "TODOを削除できませんでした" },
  partialDelete: { message: "一部のTODOを削除できませんでした" },
} satisfies Record<string, ErrorResponseSchema>;

export const todoMockUrls = {
  collection: `*${getTodoControllerGetTodosUrl()}`,
  create: `*${getTodoControllerCreateTodoUrl()}`,
  update: `*${getTodoControllerUpdateTodoUrl(":id")}`,
  delete: `*${getTodoControllerDeleteTodoUrl(":id")}`,
} as const;

export const createTodoMockHandlers = (
  initialTodos: TodoDto[] = defaultTodosFixture,
): RequestHandler[] => {
  let todos = [...initialTodos];
  let nextCreatedId = 1;

  return [
    getTodoControllerGetTodosMockHandler(() => todos),
    getTodoControllerCreateTodoMockHandler(async ({ request }) => {
      const body = (await request.json()) as { title: string };
      const todo: TodoDto = {
        id: `todo-created-${nextCreatedId}`,
        title: body.title.trim(),
        completed: false,
        createdAt: `2026-06-05T04:00:${String(nextCreatedId).padStart(2, "0")}.000Z`,
      };

      nextCreatedId += 1;
      todos = [todo, ...todos];
      return todo;
    }),
    getTodoControllerUpdateTodoMockHandler(async ({ params, request }) => {
      const id = String(params.id);
      const body = (await request.json()) as { completed: boolean };
      const target = todos.find((todo) => todo.id === id) ?? newestTodoFixture;
      const updatedTodo = { ...target, id, completed: body.completed };

      todos = todos.map((todo) => (todo.id === id ? updatedTodo : todo));
      return updatedTodo;
    }),
    getTodoControllerDeleteTodoMockHandler(({ params }) => {
      const id = String(params.id);
      todos = todos.filter((todo) => todo.id !== id);
    }),
  ];
};

export const createEmptyTodosHandler = () =>
  getTodoControllerGetTodosMockHandler([]);

export const createLoadingTodosHandler = () =>
  getTodoControllerGetTodosMockHandler(async () => {
    await delay("infinite");
    return [];
  });

export const createFetchTodosErrorHandler = () =>
  http.get(todoMockUrls.collection, () =>
    HttpResponse.json(todoErrorFixtures.fetch, { status: 500 }),
  );

export const createTodoErrorHandler = () =>
  http.post(todoMockUrls.create, () =>
    HttpResponse.json(todoErrorFixtures.create, { status: 500 }),
  );

export const createUpdateTodoErrorHandler = () =>
  http.patch(todoMockUrls.update, () =>
    HttpResponse.json(todoErrorFixtures.update, { status: 500 }),
  );

export const createDeleteTodoErrorHandler = () =>
  http.delete(todoMockUrls.delete, () =>
    HttpResponse.json(todoErrorFixtures.delete, { status: 500 }),
  );
