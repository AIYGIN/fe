import { setupWorker } from "msw/browser";
import type {
  CreateTodoRequestDto,
  TodoDto,
  UpdateTodoRequestDto,
} from "./generated/model";
import {
  getTodoControllerCreateTodoMockHandler,
  getTodoControllerDeleteTodoMockHandler,
  getTodoControllerGetTodosMockHandler,
  getTodoControllerUpdateTodoMockHandler,
} from "./generated/todos/todos.msw";

let workerPromise: Promise<void> | undefined;

const defaultApiHost = "http://localhost:3001";
const apiOrigin = new URL(process.env.NEXT_PUBLIC_API_HOST || defaultApiHost)
  .origin;

const createTodoHandlers = () => {
  let todos: TodoDto[] = [];
  let nextTodoSequence = 1;

  return [
    getTodoControllerGetTodosMockHandler(() => todos),
    getTodoControllerCreateTodoMockHandler(async ({ request }) => {
      const { title } = (await request.json()) as CreateTodoRequestDto;
      const sequence = nextTodoSequence++;
      const todo: TodoDto = {
        id: `mock-todo-${sequence}`,
        title: title.trim(),
        completed: false,
        createdAt: new Date(Date.UTC(2026, 0, 1, 0, 0, sequence)).toISOString(),
      };

      todos = [todo, ...todos];
      return todo;
    }),
    getTodoControllerDeleteTodoMockHandler(({ params }) => {
      todos = todos.filter((todo) => todo.id !== params.id);
    }),
    getTodoControllerUpdateTodoMockHandler(async ({ params, request }) => {
      const { completed } = (await request.json()) as UpdateTodoRequestDto;
      const target = todos.find((todo) => todo.id === params.id);

      if (!target) {
        throw new Error(`Unknown TODO: ${String(params.id)}`);
      }

      const updated = { ...target, completed };
      todos = todos.map((todo) => (todo.id === target.id ? updated : todo));
      return updated;
    }),
  ];
};

export const enableTodoMocking = async () => {
  if (
    typeof window === "undefined" ||
    process.env.NODE_ENV === "production" ||
    process.env.NODE_ENV === "test" ||
    !("serviceWorker" in navigator)
  ) {
    return;
  }

  workerPromise ??= Promise.resolve().then(async () => {
    await setupWorker(...createTodoHandlers()).start({
      onUnhandledRequest(request, print) {
        if (new URL(request.url).origin === apiOrigin) {
          print.error();
          throw new Error(
            `Unhandled API request: ${request.method} ${request.url}`,
          );
        }
      },
    });
  });

  await workerPromise;
};
