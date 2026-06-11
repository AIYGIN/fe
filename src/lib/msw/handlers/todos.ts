import {
  HttpResponse,
  type HttpResponseResolver,
  http,
  type RequestHandler,
} from "msw";
import type { TodoDto } from "@/apis/generated/model";

export const todoHandlersUrl = {
  collection: "*/api/todos",
  detail: "*/api/todos/:id",
} as const;

export const generatedTodoHandlersUrl = {
  collection: /^https?:\/\/[^/]+\/todos$/,
  detail: /^https?:\/\/[^/]+\/todos\/[^/]+$/,
} as const;

const forwardGeneratedRequest: HttpResponseResolver = async ({ request }) => {
  const targetUrl = new URL(request.url);
  targetUrl.pathname = `/api${targetUrl.pathname}`;
  const hasBody = !["GET", "HEAD"].includes(request.method);

  return fetch(targetUrl, {
    method: request.method,
    headers: request.headers,
    body: hasBody ? await request.arrayBuffer() : undefined,
  });
};

const createInitialTodos = (): TodoDto[] => [
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

const sortNewestFirst = (items: TodoDto[]) =>
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

export const resetTodoStore = (items: TodoDto[] = createInitialTodos()) => {
  todos = sortNewestFirst(items);
  nextId = todos.length + 1;
};

const getTodosHandler: HttpResponseResolver = () =>
  HttpResponse.json(sortNewestFirst(todos));

const getTodoId = (
  request: Request,
  id: string | readonly string[] | undefined,
) =>
  typeof id === "string"
    ? id
    : (new URL(request.url).pathname.split("/").pop() ?? "");

const createTodoHandler: HttpResponseResolver = async ({ request }) => {
  const body = (await request.json().catch(() => ({}))) as {
    title?: unknown;
  };
  const validationError = validateTitle(body.title);

  if (validationError) {
    return HttpResponse.json({ message: validationError }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const todo: TodoDto = {
    id: `todo-${nextId}`,
    title,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  nextId += 1;
  todos = [todo, ...todos];

  return HttpResponse.json(todo, { status: 201 });
};

const updateTodoHandler: HttpResponseResolver = async ({ params, request }) => {
  const id = getTodoId(request, params.id);
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
};

const deleteTodoHandler: HttpResponseResolver = ({ params, request }) => {
  const id = getTodoId(request, params.id);
  const exists = todos.some((todo) => todo.id === id);

  if (!exists) {
    return HttpResponse.json(
      { message: "TODOが見つかりません" },
      { status: 404 },
    );
  }

  todos = todos.filter((todo) => todo.id !== id);

  return new HttpResponse(null, { status: 204 });
};

const generatedHandler = (resolver: HttpResponseResolver) =>
  process.env.VITEST ? forwardGeneratedRequest : resolver;

export const todoHandlers: RequestHandler[] = [
  http.get(
    generatedTodoHandlersUrl.collection,
    generatedHandler(getTodosHandler),
  ),
  http.post(
    generatedTodoHandlersUrl.collection,
    generatedHandler(createTodoHandler),
  ),
  http.patch(
    generatedTodoHandlersUrl.detail,
    generatedHandler(updateTodoHandler),
  ),
  http.delete(
    generatedTodoHandlersUrl.detail,
    generatedHandler(deleteTodoHandler),
  ),
  http.get(todoHandlersUrl.collection, getTodosHandler),
  http.post(todoHandlersUrl.collection, createTodoHandler),
  http.patch(todoHandlersUrl.detail, updateTodoHandler),
  http.delete(todoHandlersUrl.detail, deleteTodoHandler),
];
