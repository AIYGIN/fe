import { waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it } from "vitest";
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
import { todoMockServer } from "@/apis/todos.mock-server";
import { createTodoApiStore } from "./store";

const activeTodoFixture: TodoDto = {
  id: "todo-active",
  title: "未完了TODO",
  completed: false,
  createdAt: "2026-06-05T02:00:00.000Z",
};

const completedTodoFixture: TodoDto = {
  id: "todo-completed",
  title: "完了済みTODO",
  completed: true,
  createdAt: "2026-06-05T01:00:00.000Z",
};

const createdTodoFixture: TodoDto = {
  id: "todo-created",
  title: "追加したTODO",
  completed: false,
  createdAt: "2026-06-05T03:00:00.000Z",
};

const todoMockUrls = {
  collection: `*${getTodoControllerGetTodosUrl()}`,
  create: `*${getTodoControllerCreateTodoUrl()}`,
  update: `*${getTodoControllerUpdateTodoUrl(":id")}`,
  delete: `*${getTodoControllerDeleteTodoUrl(":id")}`,
} as const;

const createDeferred = <T>() => {
  let resolve: (value: T) => void = () => {};
  const promise = new Promise<T>((nextResolve) => {
    resolve = nextResolve;
  });

  return { promise, resolve };
};

const hasPendingId = (pendingIds: unknown, id: string) => {
  if (pendingIds instanceof Set) {
    return pendingIds.has(id);
  }

  return Array.isArray(pendingIds) && pendingIds.includes(id);
};

const getAnnouncementMessage = (announcement: unknown) => {
  if (typeof announcement === "string") {
    return announcement;
  }

  if (typeof announcement === "object" && announcement !== null) {
    return (announcement as { message?: unknown }).message;
  }

  return undefined;
};

const createStore = (initialTodos: TodoDto[] = []) =>
  createTodoApiStore({
    initialTodos,
    initialStatus: "idle",
    initialError: "",
    autoLoad: false,
  });

describe("todo-api-store", () => {
  beforeEach(() => {
    todoMockServer.resetHandlers();
  });

  it("初期値を受け取り、各画面で独立したstoreインスタンスを作成する", async () => {
    todoMockServer.use(
      getTodoControllerCreateTodoMockHandler(() => createdTodoFixture),
    );
    const firstStore = createTodoApiStore({
      initialTodos: [activeTodoFixture],
      initialStatus: "error",
      initialError: "初期エラー",
      autoLoad: false,
    });
    const secondStore = createTodoApiStore({
      initialTodos: [completedTodoFixture],
      initialStatus: "idle",
      initialError: "",
      autoLoad: false,
    });

    expect(firstStore).not.toBe(secondStore);
    expect(firstStore.getState()).toMatchObject({
      todos: [activeTodoFixture],
      status: "error",
      loadError: "初期エラー",
    });
    expect(secondStore.getState()).toMatchObject({
      todos: [completedTodoFixture],
      status: "idle",
      loadError: "",
    });

    await firstStore.getState().addTodo({ title: createdTodoFixture.title });

    expect(firstStore.getState().todos).toEqual([
      createdTodoFixture,
      activeTodoFixture,
    ]);
    expect(secondStore.getState().todos).toEqual([completedTodoFixture]);
  });

  it("API状態とAPI操作だけを公開し、画面UI状態を含めない", () => {
    const state = createStore().getState();

    expect(state).toMatchObject({
      todos: [],
      status: "idle",
      loadError: "",
      createError: "",
      toggleErrors: {},
      deleteErrors: {},
      isCreating: false,
    });

    for (const uiStateName of [
      "filter",
      "query",
      "draft",
      "validationError",
      "deleteRequest",
      "dialogRef",
      "cancelButtonRef",
      "restoreFocusRef",
      "focusAfterDeleteRef",
    ]) {
      expect(state).not.toHaveProperty(uiStateName);
    }
  });

  it("autoLoadが有効ならstore生成時にTODO一覧の取得を開始して完了する", async () => {
    const response = createDeferred<TodoDto[]>();
    let requestCount = 0;
    todoMockServer.use(
      getTodoControllerGetTodosMockHandler(async () => {
        requestCount += 1;
        return response.promise;
      }),
    );

    const store = createTodoApiStore({
      initialTodos: [],
      initialStatus: "loading",
      initialError: "",
      autoLoad: true,
    });

    await waitFor(() => {
      expect(requestCount).toBe(1);
    });
    expect(store.getState()).toMatchObject({
      todos: [],
      status: "loading",
      loadError: "",
    });

    response.resolve([activeTodoFixture, completedTodoFixture]);

    await waitFor(() => {
      expect(store.getState()).toMatchObject({
        todos: [activeTodoFixture, completedTodoFixture],
        status: "idle",
        loadError: "",
      });
    });
    expect(requestCount).toBe(1);
  });

  it("TODO一覧を取得し、再取得開始時に以前の取得エラーを解除する", async () => {
    const response = createDeferred<TodoDto[]>();
    todoMockServer.use(
      getTodoControllerGetTodosMockHandler(() => response.promise),
    );
    const store = createTodoApiStore({
      initialTodos: [],
      initialStatus: "error",
      initialError: "以前の取得エラー",
      autoLoad: false,
    });

    const request = store.getState().loadTodos();

    expect(store.getState()).toMatchObject({
      status: "loading",
      loadError: "",
    });

    response.resolve([activeTodoFixture, completedTodoFixture]);
    await request;

    expect(store.getState()).toMatchObject({
      todos: [activeTodoFixture, completedTodoFixture],
      status: "idle",
      loadError: "",
    });
  });

  it("TODO一覧の取得失敗時は既存一覧を保持して取得エラーにする", async () => {
    todoMockServer.use(
      http.get(todoMockUrls.collection, () =>
        HttpResponse.json({ message: "failed" }, { status: 500 }),
      ),
    );
    const store = createStore([activeTodoFixture]);

    await store.getState().loadTodos();

    expect(store.getState()).toMatchObject({
      todos: [activeTodoFixture],
      status: "error",
      loadError: "TODO一覧を取得できませんでした",
    });
  });

  it("保留中の一覧取得より後に追加したTODOを古い取得結果で巻き戻さない", async () => {
    const staleLoadResponse = createDeferred<TodoDto[]>();
    let loadRequestCount = 0;
    todoMockServer.use(
      getTodoControllerGetTodosMockHandler(async () => {
        loadRequestCount += 1;
        return staleLoadResponse.promise;
      }),
      getTodoControllerCreateTodoMockHandler(() => createdTodoFixture),
    );
    const store = createStore([activeTodoFixture]);

    const loadRequest = store.getState().loadTodos();
    await waitFor(() => {
      expect(loadRequestCount).toBe(1);
    });

    await store.getState().addTodo({ title: createdTodoFixture.title });
    expect(store.getState().todos).toEqual([
      createdTodoFixture,
      activeTodoFixture,
    ]);

    staleLoadResponse.resolve([activeTodoFixture]);
    await loadRequest;

    expect(store.getState().todos).toEqual([
      createdTodoFixture,
      activeTodoFixture,
    ]);
  });

  it("保留中の一覧取得より後に更新したTODOを古い取得結果で巻き戻さない", async () => {
    const staleLoadResponse = createDeferred<TodoDto[]>();
    const updatedTodo = { ...activeTodoFixture, completed: true };
    let loadRequestCount = 0;
    todoMockServer.use(
      getTodoControllerGetTodosMockHandler(async () => {
        loadRequestCount += 1;
        return staleLoadResponse.promise;
      }),
      getTodoControllerUpdateTodoMockHandler(() => updatedTodo),
    );
    const store = createStore([activeTodoFixture]);

    const loadRequest = store.getState().loadTodos();
    await waitFor(() => {
      expect(loadRequestCount).toBe(1);
    });

    await store.getState().toggleTodo(activeTodoFixture);
    expect(store.getState().todos).toEqual([updatedTodo]);

    staleLoadResponse.resolve([activeTodoFixture]);
    await loadRequest;

    expect(store.getState().todos).toEqual([updatedTodo]);
  });

  it("保留中の一覧取得より後に削除したTODOを古い取得結果で復元しない", async () => {
    const staleLoadResponse = createDeferred<TodoDto[]>();
    let loadRequestCount = 0;
    todoMockServer.use(
      getTodoControllerGetTodosMockHandler(async () => {
        loadRequestCount += 1;
        return staleLoadResponse.promise;
      }),
      getTodoControllerDeleteTodoMockHandler(),
    );
    const store = createStore([activeTodoFixture, completedTodoFixture]);

    const loadRequest = store.getState().loadTodos();
    await waitFor(() => {
      expect(loadRequestCount).toBe(1);
    });

    await store.getState().removeTodos([activeTodoFixture]);
    expect(store.getState().todos).toEqual([completedTodoFixture]);

    staleLoadResponse.resolve([activeTodoFixture, completedTodoFixture]);
    await loadRequest;

    expect(store.getState().todos).toEqual([completedTodoFixture]);
  });

  it("TODO作成中は重複作成を防ぎ、成功時に一覧とannouncementを更新する", async () => {
    const response = createDeferred<TodoDto>();
    let requestCount = 0;
    todoMockServer.use(
      getTodoControllerCreateTodoMockHandler(async () => {
        requestCount += 1;
        return response.promise;
      }),
    );
    const store = createStore([activeTodoFixture]);

    const firstRequest = store
      .getState()
      .addTodo({ title: createdTodoFixture.title });
    const duplicateRequest = store
      .getState()
      .addTodo({ title: createdTodoFixture.title });

    await waitFor(() => {
      expect(requestCount).toBe(1);
    });
    expect(store.getState().isCreating).toBe(true);

    response.resolve(createdTodoFixture);
    await Promise.all([firstRequest, duplicateRequest]);

    expect(store.getState()).toMatchObject({
      todos: [createdTodoFixture, activeTodoFixture],
      isCreating: false,
      createError: "",
    });
    expect(getAnnouncementMessage(store.getState().announcement)).toBe(
      "TODOを追加しました",
    );
  });

  it("TODO作成失敗時は一覧を保持し、作成エラーを明示的に解除できる", async () => {
    todoMockServer.use(
      http.post(todoMockUrls.create, () =>
        HttpResponse.json(
          { message: "TODOを追加できませんでした" },
          { status: 500 },
        ),
      ),
    );
    const store = createStore([activeTodoFixture]);

    await store.getState().addTodo({ title: "失敗するTODO" });

    expect(store.getState()).toMatchObject({
      todos: [activeTodoFixture],
      isCreating: false,
      createError: "TODOを追加できませんでした",
    });

    store.getState().clearCreateError();

    expect(store.getState().createError).toBe("");
  });

  it("完了切り替え中は同じTODOの重複更新を防ぎ、成功時に対象とannouncementを更新する", async () => {
    const updatedTodo = { ...activeTodoFixture, completed: true };
    const response = createDeferred<TodoDto>();
    let requestCount = 0;
    todoMockServer.use(
      getTodoControllerUpdateTodoMockHandler(async () => {
        requestCount += 1;
        return response.promise;
      }),
    );
    const store = createStore([activeTodoFixture, completedTodoFixture]);

    const firstRequest = store.getState().toggleTodo(activeTodoFixture);
    const duplicateRequest = store.getState().toggleTodo(activeTodoFixture);

    await waitFor(() => {
      expect(requestCount).toBe(1);
    });
    expect(
      hasPendingId(store.getState().pendingToggleIds, activeTodoFixture.id),
    ).toBe(true);

    response.resolve(updatedTodo);
    await Promise.all([firstRequest, duplicateRequest]);

    expect(store.getState().todos).toEqual([updatedTodo, completedTodoFixture]);
    expect(
      hasPendingId(store.getState().pendingToggleIds, activeTodoFixture.id),
    ).toBe(false);
    expect(store.getState().toggleErrors[activeTodoFixture.id] ?? "").toBe("");
    expect(getAnnouncementMessage(store.getState().announcement)).toBe(
      "TODOを完了にしました",
    );
  });

  it("完了切り替え失敗時は対象を保持し、再試行開始時に対象エラーを解除する", async () => {
    todoMockServer.use(
      http.patch(todoMockUrls.update, () =>
        HttpResponse.json(
          { message: "完了状態を更新できませんでした" },
          { status: 500 },
        ),
      ),
    );
    const store = createStore([activeTodoFixture]);

    await store.getState().toggleTodo(activeTodoFixture);

    expect(store.getState().todos).toEqual([activeTodoFixture]);
    expect(store.getState().toggleErrors[activeTodoFixture.id]).toBe(
      "完了状態を更新できませんでした",
    );
    expect(
      hasPendingId(store.getState().pendingToggleIds, activeTodoFixture.id),
    ).toBe(false);

    const response = createDeferred<TodoDto>();
    todoMockServer.use(
      getTodoControllerUpdateTodoMockHandler(() => response.promise),
    );
    const retry = store.getState().toggleTodo(activeTodoFixture);

    expect(store.getState().toggleErrors[activeTodoFixture.id] ?? "").toBe("");

    response.resolve({ ...activeTodoFixture, completed: true });
    await retry;
  });

  it("TODO削除中は対象IDの重複削除を防ぎ、成功IDとannouncementを更新する", async () => {
    const response = createDeferred<void>();
    let requestCount = 0;
    todoMockServer.use(
      getTodoControllerDeleteTodoMockHandler(async () => {
        requestCount += 1;
        await response.promise;
      }),
    );
    const store = createStore([activeTodoFixture, completedTodoFixture]);

    const firstRequest = store
      .getState()
      .removeTodos([activeTodoFixture, completedTodoFixture]);

    await waitFor(() => {
      expect(requestCount).toBe(2);
    });
    expect(
      hasPendingId(store.getState().pendingDeleteIds, activeTodoFixture.id),
    ).toBe(true);
    expect(
      hasPendingId(store.getState().pendingDeleteIds, completedTodoFixture.id),
    ).toBe(true);

    const duplicateResult = await store
      .getState()
      .removeTodos([activeTodoFixture]);
    expect(duplicateResult).toEqual({ succeededIds: [], failedIds: [] });
    expect(requestCount).toBe(2);

    response.resolve(undefined);
    await expect(firstRequest).resolves.toEqual({
      succeededIds: [activeTodoFixture.id, completedTodoFixture.id],
      failedIds: [],
    });

    expect(store.getState().todos).toEqual([]);
    expect(
      hasPendingId(store.getState().pendingDeleteIds, activeTodoFixture.id),
    ).toBe(false);
    expect(
      hasPendingId(store.getState().pendingDeleteIds, completedTodoFixture.id),
    ).toBe(false);
    expect(getAnnouncementMessage(store.getState().announcement)).toBe(
      "2件のTODOを削除しました",
    );
  });

  it("一括削除が一部失敗した場合は成功分だけ削除して失敗IDを返す", async () => {
    todoMockServer.use(
      http.delete(todoMockUrls.delete, ({ params }) => {
        if (String(params.id) === activeTodoFixture.id) {
          return new HttpResponse(null, { status: 204 });
        }

        return HttpResponse.json(
          { message: "TODO API request failed" },
          { status: 500 },
        );
      }),
    );
    const store = createStore([activeTodoFixture, completedTodoFixture]);

    const result = await store
      .getState()
      .removeTodos([activeTodoFixture, completedTodoFixture]);

    expect(result).toEqual({
      succeededIds: [activeTodoFixture.id],
      failedIds: [completedTodoFixture.id],
    });
    expect(store.getState().todos).toEqual([completedTodoFixture]);
    expect(store.getState().deleteErrors[completedTodoFixture.id]).toBe(
      "一部のTODOを削除できませんでした",
    );
    expect(
      hasPendingId(store.getState().pendingDeleteIds, activeTodoFixture.id),
    ).toBe(false);
    expect(
      hasPendingId(store.getState().pendingDeleteIds, completedTodoFixture.id),
    ).toBe(false);
  });

  it("削除失敗時は一覧を保持し、削除エラーを明示的に解除できる", async () => {
    todoMockServer.use(
      http.delete(todoMockUrls.delete, () =>
        HttpResponse.json(
          { message: "TODOを削除できませんでした" },
          { status: 500 },
        ),
      ),
    );
    const store = createStore([activeTodoFixture]);

    await store.getState().removeTodos([activeTodoFixture]);

    expect(store.getState().todos).toEqual([activeTodoFixture]);
    expect(store.getState().deleteErrors[activeTodoFixture.id]).toBe(
      "TODOを削除できませんでした",
    );

    store.getState().clearDeleteErrors();

    expect(store.getState().deleteErrors[activeTodoFixture.id] ?? "").toBe("");
  });
});
