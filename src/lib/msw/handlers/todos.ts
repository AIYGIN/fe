import { HttpResponse, http, type RequestHandler } from "msw";
import type { Todo } from "@/types/todo";

export const todoHandlersUrl = {
  collection: "*/api/todos",
  detail: "*/api/todos/:id",
} as const;

const createInitialTodos = (): Todo[] => [
  {
    id: "todo-2",
    title: "Storybookの状態を確認する",
    completed: false,
    createdAt: "2026-06-05T01:00:00.000Z",
  },
  {
    id: "todo-1",
    title: "TODO APIモックを用意する",
    completed: true,
    createdAt: "2026-06-05T00:30:00.000Z",
  },
];

let todos = createInitialTodos();
let nextId = 3;

const sortNewestFirst = (items: Todo[]) =>
  [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

const validateTitle = (value: unknown) => {
  if (typeof value !== "string") {
    return "TODOを入力してください";
  }

  const title = value.trim();

  if (title.length === 0) {
    return "TODOを入力してください";
  }

  if (title.length > 80) {
    return "TODOは80文字以内で入力してください";
  }

  return null;
};

export const resetTodoStore = (items: Todo[] = createInitialTodos()) => {
  todos = sortNewestFirst(items);
  nextId = todos.length + 1;
};

export const todoHandlers: RequestHandler[] = [
  http.get(todoHandlersUrl.collection, () => {
    return HttpResponse.json(sortNewestFirst(todos));
  }),

  http.post(todoHandlersUrl.collection, async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as {
      title?: unknown;
    };
    const validationError = validateTitle(body.title);

    if (validationError) {
      return HttpResponse.json({ message: validationError }, { status: 400 });
    }

    const todo: Todo = {
      id: `todo-${nextId}`,
      title: body.title?.trim() ?? "",
      completed: false,
      createdAt: new Date().toISOString(),
    };

    nextId += 1;
    todos = [todo, ...todos];

    return HttpResponse.json(todo, { status: 201 });
  }),

  http.patch(todoHandlersUrl.detail, async ({ params, request }) => {
    const id = String(params.id);
    const body = (await request.json().catch(() => ({}))) as {
      completed?: unknown;
    };
    const target = todos.find((todo) => todo.id === id);

    if (!target) {
      return HttpResponse.json(
        { message: "TODOが見つかりません" },
        { status: 404 },
      );
    }

    if (typeof body.completed !== "boolean") {
      return HttpResponse.json(
        { message: "完了状態を指定してください" },
        { status: 400 },
      );
    }

    const updated = { ...target, completed: body.completed };
    todos = todos.map((todo) => (todo.id === id ? updated : todo));

    return HttpResponse.json(updated);
  }),

  http.delete(todoHandlersUrl.detail, ({ params }) => {
    const id = String(params.id);
    const exists = todos.some((todo) => todo.id === id);

    if (!exists) {
      return HttpResponse.json(
        { message: "TODOが見つかりません" },
        { status: 404 },
      );
    }

    todos = todos.filter((todo) => todo.id !== id);

    return new HttpResponse(null, { status: 204 });
  }),
];
