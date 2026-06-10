import { afterEach, describe, expect, it, vi } from "vitest";
import type { TodoDto } from "./generated/model";

const importGeneratedTodoApi = () => import("./generated/todos/todos");

const todo: TodoDto = {
  id: "todo-1",
  title: "既存TODO",
  completed: false,
  createdAt: "2026-06-05T01:00:00.000Z",
};

const jsonResponse = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });

const operationCases = [
  {
    name: "GET",
    path: "/todos",
    response: () => jsonResponse([todo], 200),
    invoke: async (options: RequestInit) => {
      const { todoControllerGetTodos } = await importGeneratedTodoApi();
      return todoControllerGetTodos(options);
    },
    expectedInit: {
      method: "GET",
      cache: "no-store",
      traceId: "get-todos",
      contentType: undefined,
      body: undefined,
    },
  },
  {
    name: "POST",
    path: "/todos",
    response: () => jsonResponse(todo, 201),
    invoke: async (options: RequestInit) => {
      const { todoControllerCreateTodo } = await importGeneratedTodoApi();
      return todoControllerCreateTodo({ title: todo.title }, options);
    },
    expectedInit: {
      method: "POST",
      cache: "no-store",
      traceId: "create-todo",
      contentType: "application/json",
      body: JSON.stringify({ title: todo.title }),
    },
  },
  {
    name: "PATCH",
    path: `/todos/${todo.id}`,
    response: () => jsonResponse({ ...todo, completed: true }, 200),
    invoke: async (options: RequestInit) => {
      const { todoControllerUpdateTodo } = await importGeneratedTodoApi();
      return todoControllerUpdateTodo(todo.id, { completed: true }, options);
    },
    expectedInit: {
      method: "PATCH",
      cache: "no-store",
      traceId: "update-todo",
      contentType: "application/json",
      body: JSON.stringify({ completed: true }),
    },
  },
  {
    name: "DELETE",
    path: `/todos/${todo.id}`,
    response: () => new Response(null, { status: 204 }),
    invoke: async (options: RequestInit) => {
      const { todoControllerDeleteTodo } = await importGeneratedTodoApi();
      return todoControllerDeleteTodo(todo.id, options);
    },
    expectedInit: {
      method: "DELETE",
      cache: "no-store",
      traceId: "delete-todo",
      contentType: undefined,
      body: undefined,
    },
  },
] as const;

describe("Orval生成クライアントの共通request契約", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.resetModules();
    vi.useRealTimers();
  });

  it("環境変数がない場合はデフォルトhostへ相対URLを解決する", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_HOST", "");
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse([todo], 200));
    vi.stubGlobal("fetch", fetchMock);
    const { todoControllerGetTodos } = await importGeneratedTodoApi();

    await todoControllerGetTodos();

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/todos",
      expect.any(Object),
    );
  });

  it.each(operationCases)(
    "$nameで共通設定を優先し、fetchのsignalを5秒で中断しつつ既存RequestInitを保持する",
    async ({ expectedInit, invoke, path, response }) => {
      vi.useFakeTimers();
      vi.spyOn(AbortSignal, "timeout").mockImplementation((milliseconds) => {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), milliseconds);
        return controller.signal;
      });
      vi.stubEnv("NEXT_PUBLIC_API_HOST", "https://todo-api.example.com/");
      const callerSignal = new AbortController().signal;
      const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(response());
      vi.stubGlobal("fetch", fetchMock);

      await invoke({
        cache: expectedInit.cache,
        credentials: "omit",
        signal: callerSignal,
        headers: { "X-Trace-Id": expectedInit.traceId },
      });

      expect.soft(fetchMock).toHaveBeenCalledOnce();
      const [requestUrl, requestInit] = fetchMock.mock.calls[0] ?? [];
      const headers = new Headers(requestInit?.headers);
      const timeoutSignal = requestInit?.signal;

      expect.soft(requestUrl).toBe(`https://todo-api.example.com${path}`);
      expect.soft(requestInit).toEqual(
        expect.objectContaining({
          method: expectedInit.method,
          cache: expectedInit.cache,
          credentials: "include",
          signal: expect.any(AbortSignal),
        }),
      );
      expect.soft(timeoutSignal).not.toBe(callerSignal);
      expect.soft(requestInit?.body).toBe(expectedInit.body);
      expect.soft(headers.get("X-Trace-Id")).toBe(expectedInit.traceId);
      expect
        .soft(headers.get("Content-Type"))
        .toBe(expectedInit.contentType ?? null);

      expect.soft(timeoutSignal).toBeInstanceOf(AbortSignal);
      expect.soft(timeoutSignal?.aborted).toBe(false);
      expect.soft(callerSignal.aborted).toBe(false);

      await vi.advanceTimersByTimeAsync(4_999);
      expect.soft(timeoutSignal?.aborted).toBe(false);

      await vi.advanceTimersByTimeAsync(1);
      expect.soft(timeoutSignal?.aborted).toBe(true);
      expect.soft(callerSignal.aborted).toBe(false);
    },
  );
});
