import { devtools } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import type {
  CreateTodoRequestDto,
  TodoDto,
  UpdateTodoRequestDto,
} from "@/apis/generated/model";
import {
  todoControllerCreateTodo,
  todoControllerDeleteTodo,
  todoControllerGetTodos,
  todoControllerUpdateTodo,
} from "@/apis/generated/todos/todos";

type LoadStatus = "idle" | "loading" | "error";
type Announcement = { message: string; sequence: number };
type RemoveTodosResult = { succeededIds: string[]; failedIds: string[] };
type TodoMutationInput =
  | { type: "add"; todo: TodoDto }
  | { type: "update"; todo: TodoDto }
  | { type: "delete"; ids: string[] };
type TodoMutation = TodoMutationInput & { revision: number };

export type TodoApiStoreOptions = {
  initialTodos: TodoDto[];
  initialStatus: LoadStatus;
  initialError: string;
  autoLoad: boolean;
};

export type TodoApiStoreState = {
  todos: TodoDto[];
  status: LoadStatus;
  loadError: string;
  createError: string;
  toggleErrors: Record<string, string>;
  deleteErrors: Record<string, string>;
  isCreating: boolean;
  pendingToggleIds: Set<string>;
  pendingDeleteIds: Set<string>;
  announcement: Announcement;
  loadTodos: () => Promise<void>;
  addTodo: (request: CreateTodoRequestDto) => Promise<boolean>;
  toggleTodo: (todo: TodoDto) => Promise<void>;
  removeTodos: (targets: TodoDto[]) => Promise<RemoveTodosResult>;
  clearCreateError: () => void;
  clearDeleteErrors: (targets?: TodoDto[]) => void;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }

  return fallback;
};

const extractErrorMessage = (data: unknown): string | undefined => {
  if (typeof data === "object" && data !== null) {
    const message = (data as { message?: unknown }).message;
    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }

  return undefined;
};

const assertSuccess = <T>(
  response: { status: number; data: unknown },
  okStatuses: number[] = [200, 201, 204],
): T => {
  if (okStatuses.includes(response.status)) {
    return response.data as T;
  }

  throw new Error(
    extractErrorMessage(response.data) ?? "TODO API request failed",
  );
};

const applyMutations = (todos: TodoDto[], mutations: TodoMutation[]) =>
  mutations.reduce<TodoDto[]>((current, mutation) => {
    if (mutation.type === "add") {
      return [
        mutation.todo,
        ...current.filter((todo) => todo.id !== mutation.todo.id),
      ];
    }

    if (mutation.type === "update") {
      return current.map((todo) =>
        todo.id === mutation.todo.id ? mutation.todo : todo,
      );
    }

    const deletedIds = new Set(mutation.ids);
    return current.filter((todo) => !deletedIds.has(todo.id));
  }, todos);

export const createTodoApiStore = ({
  initialTodos,
  initialStatus,
  initialError,
  autoLoad,
}: TodoApiStoreOptions) => {
  let loadRequest: Promise<void> | null = null;
  let mutationRevision = 0;
  let mutationHistory: TodoMutation[] = [];

  const recordMutation = (mutation: TodoMutationInput): void => {
    mutationRevision += 1;
    mutationHistory.push({ ...mutation, revision: mutationRevision });
  };

  const store = createStore<TodoApiStoreState>()(
    devtools(
      (set, get) => {
        const announce = (message: string) => {
          set((state) => ({
            announcement: {
              message,
              sequence: state.announcement.sequence + 1,
            },
          }));
        };

        return {
          todos: initialTodos,
          status: initialStatus,
          loadError: initialError,
          createError: "",
          toggleErrors: {},
          deleteErrors: {},
          isCreating: false,
          pendingToggleIds: new Set(),
          pendingDeleteIds: new Set(),
          announcement: { message: "", sequence: 0 },
          loadTodos: () => {
            if (loadRequest) {
              return loadRequest;
            }

            const loadRevision = mutationRevision;
            set({ status: "loading", loadError: "" });

            loadRequest = (async () => {
              try {
                const todos = assertSuccess<TodoDto[]>(
                  await todoControllerGetTodos(),
                );
                const laterMutations = mutationHistory.filter(
                  (mutation) => mutation.revision > loadRevision,
                );

                set({
                  todos: applyMutations(todos, laterMutations),
                  status: "idle",
                });
              } catch {
                set({
                  status: "error",
                  loadError: "TODO一覧を取得できませんでした",
                });
              } finally {
                mutationHistory = [];
                loadRequest = null;
              }
            })();

            return loadRequest;
          },
          addTodo: async (request) => {
            if (get().isCreating) {
              return false;
            }

            set({ createError: "", isCreating: true });

            try {
              const created = assertSuccess<TodoDto>(
                await todoControllerCreateTodo(request),
              );
              recordMutation({ type: "add", todo: created });
              set((state) => ({ todos: [created, ...state.todos] }));
              announce("TODOを追加しました");
              return true;
            } catch (error) {
              set({
                createError: getErrorMessage(
                  error,
                  "TODOを追加できませんでした",
                ),
              });
              return false;
            } finally {
              set({ isCreating: false });
            }
          },
          toggleTodo: async (todo) => {
            if (
              get().pendingToggleIds.has(todo.id) ||
              get().pendingDeleteIds.has(todo.id)
            ) {
              return;
            }

            set((state) => ({
              toggleErrors: { ...state.toggleErrors, [todo.id]: "" },
              pendingToggleIds: new Set(state.pendingToggleIds).add(todo.id),
            }));

            try {
              const request: UpdateTodoRequestDto = {
                completed: !todo.completed,
              };
              const updated = assertSuccess<TodoDto>(
                await todoControllerUpdateTodo(todo.id, request),
              );

              recordMutation({ type: "update", todo: updated });

              set((state) => ({
                todos: state.todos.map((item) =>
                  item.id === updated.id ? updated : item,
                ),
              }));

              announce(
                updated.completed
                  ? "TODOを完了にしました"
                  : "TODOを未完了にしました",
              );
            } catch (error) {
              set((state) => ({
                toggleErrors: {
                  ...state.toggleErrors,
                  [todo.id]: getErrorMessage(
                    error,
                    "完了状態を更新できませんでした",
                  ),
                },
              }));
            } finally {
              set((state) => {
                const pendingToggleIds = new Set(state.pendingToggleIds);
                pendingToggleIds.delete(todo.id);
                return { pendingToggleIds };
              });
            }
          },
          removeTodos: async (targets) => {
            const targetIds = targets
              .map((todo) => todo.id)
              .filter(
                (id) =>
                  !get().pendingDeleteIds.has(id) &&
                  !get().pendingToggleIds.has(id),
              );

            if (targetIds.length === 0) {
              return { succeededIds: [], failedIds: [] };
            }

            set((state) => {
              const deleteErrors = { ...state.deleteErrors };
              const pendingDeleteIds = new Set(state.pendingDeleteIds);

              for (const id of targetIds) {
                deleteErrors[id] = "";
                pendingDeleteIds.add(id);
              }

              return { deleteErrors, pendingDeleteIds };
            });

            const results = await Promise.allSettled(
              targetIds.map(async (id) => {
                assertSuccess<void>(await todoControllerDeleteTodo(id), [204]);
                return id;
              }),
            );

            const succeededIds: string[] = [];
            const failedIds: string[] = [];
            const failedReasons: Record<string, unknown> = {};

            results.forEach((result, index) => {
              const id = targetIds[index];

              if (result.status === "fulfilled") {
                succeededIds.push(id);
              } else {
                failedIds.push(id);
                failedReasons[id] = result.reason;
              }
            });

            const fallbackMessage =
              succeededIds.length > 0 && failedIds.length > 0
                ? "一部のTODOを削除できませんでした"
                : "TODOを削除できませんでした";

            if (succeededIds.length > 0) {
              recordMutation({ type: "delete", ids: succeededIds });
            }

            set((state) => {
              const deletedIds = new Set(succeededIds);
              const deleteErrors = { ...state.deleteErrors };
              const pendingDeleteIds = new Set(state.pendingDeleteIds);

              for (const id of failedIds) {
                const message = getErrorMessage(
                  failedReasons[id],
                  fallbackMessage,
                );
                deleteErrors[id] =
                  message === "TODO API request failed"
                    ? fallbackMessage
                    : message;
              }

              for (const id of targetIds) {
                pendingDeleteIds.delete(id);
              }

              return {
                todos:
                  succeededIds.length === 0
                    ? state.todos
                    : state.todos.filter((todo) => !deletedIds.has(todo.id)),
                deleteErrors,
                pendingDeleteIds,
              };
            });

            if (succeededIds.length > 0) {
              announce(
                succeededIds.length === 1
                  ? "TODOを削除しました"
                  : `${succeededIds.length}件のTODOを削除しました`,
              );
            }

            return { succeededIds, failedIds };
          },
          clearCreateError: () => set({ createError: "" }),
          clearDeleteErrors: (targets) => {
            set((state) => {
              const deleteErrors = { ...state.deleteErrors };
              const ids =
                targets?.map((todo) => todo.id) ?? Object.keys(deleteErrors);

              for (const id of ids) {
                deleteErrors[id] = "";
              }

              return { deleteErrors };
            });
          },
        };
      },
      { name: "todo-store" },
    ),
  );

  if (autoLoad) {
    void store.getState().loadTodos();
  }

  return store;
};

export type TodoApiStore = ReturnType<typeof createTodoApiStore>;
