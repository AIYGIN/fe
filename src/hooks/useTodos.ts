"use client";

import { useCallback, useEffect, useState } from "react";
import type { TodoDto } from "@/apis/generated/model";
import {
  todoControllerCreateTodo,
  todoControllerDeleteTodo,
  todoControllerGetTodos,
  todoControllerUpdateTodo,
} from "@/apis/generated/todos/todos";

type LoadStatus = "idle" | "loading" | "error";

type UseTodosOptions = {
  initialTodos: TodoDto[];
  initialStatus: LoadStatus;
  initialError: string;
  autoLoad: boolean;
};

type RemoveTodosResult = {
  succeededIds: string[];
  failedIds: string[];
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

export function useTodos({
  initialTodos,
  initialStatus,
  initialError,
  autoLoad,
}: UseTodosOptions) {
  const [todos, setTodos] = useState(initialTodos);
  const [status, setStatus] = useState<LoadStatus>(initialStatus);
  const [loadError, setLoadError] = useState(initialError);
  const [createError, setCreateError] = useState("");
  const [toggleErrors, setToggleErrors] = useState<Record<string, string>>({});
  const [deleteErrors, setDeleteErrors] = useState<Record<string, string>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [pendingToggleIds, setPendingToggleIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [pendingDeleteIds, setPendingDeleteIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [announcement, setAnnouncement] = useState({
    message: "",
    sequence: 0,
  });

  const announce = (message: string) => {
    setAnnouncement((current) => ({
      message,
      sequence: current.sequence + 1,
    }));
  };

  const loadTodos = useCallback(async () => {
    setStatus("loading");
    setLoadError("");

    try {
      const items = assertSuccess<TodoDto[]>(await todoControllerGetTodos());
      setTodos(items);
      setStatus("idle");
    } catch {
      setLoadError("TODO一覧を取得できませんでした");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (autoLoad) {
      void loadTodos();
    }
  }, [autoLoad, loadTodos]);

  const addTodo = async (title: string) => {
    if (isCreating) {
      return false;
    }

    setCreateError("");
    setIsCreating(true);

    try {
      const created = assertSuccess<TodoDto>(
        await todoControllerCreateTodo({ title }),
      );
      setTodos((current) => [created, ...current]);
      announce("TODOを追加しました");
      return true;
    } catch (error) {
      setCreateError(getErrorMessage(error, "TODOを追加できませんでした"));
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  const toggleTodo = async (todo: TodoDto) => {
    if (pendingToggleIds.has(todo.id)) {
      return;
    }

    setToggleErrors((current) => ({ ...current, [todo.id]: "" }));
    setPendingToggleIds((current) => new Set(current).add(todo.id));

    try {
      const updated = assertSuccess<TodoDto>(
        await todoControllerUpdateTodo(todo.id, {
          completed: !todo.completed,
        }),
      );
      setTodos((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      announce(
        updated.completed ? "TODOを完了にしました" : "TODOを未完了にしました",
      );
    } catch (error) {
      setToggleErrors((current) => ({
        ...current,
        [todo.id]: getErrorMessage(error, "完了状態を更新できませんでした"),
      }));
    } finally {
      setPendingToggleIds((current) => {
        const next = new Set(current);
        next.delete(todo.id);
        return next;
      });
    }
  };

  const removeTodos = async (targets: TodoDto[]) => {
    const targetIds = targets
      .map((todo) => todo.id)
      .filter((id) => !pendingDeleteIds.has(id));

    if (targetIds.length === 0) {
      return {
        succeededIds: [],
        failedIds: [],
      } satisfies RemoveTodosResult;
    }

    setDeleteErrors((current) => {
      const next = { ...current };
      for (const id of targetIds) {
        next[id] = "";
      }
      return next;
    });
    setPendingDeleteIds((current) => {
      const next = new Set(current);
      for (const id of targetIds) {
        next.add(id);
      }
      return next;
    });

    const results = await Promise.allSettled(
      targetIds.map(async (id) => {
        await assertSuccess<void>(await todoControllerDeleteTodo(id), [204]);
        return id;
      }),
    );
    const succeededIds: string[] = [];
    const failedIds: string[] = [];
    const failedReasons: Record<string, unknown> = {};
    const failedMessages: Record<string, string> = {};

    results.forEach((result, index) => {
      const id = targetIds[index];

      if (result.status === "fulfilled") {
        succeededIds.push(id);
        return;
      }

      failedIds.push(id);
      failedReasons[id] = result.reason;
    });

    const partialDelete = succeededIds.length > 0 && failedIds.length > 0;
    const fallbackMessage = partialDelete
      ? "一部のTODOを削除できませんでした"
      : "TODOを削除できませんでした";

    failedIds.forEach((id) => {
      const message = getErrorMessage(failedReasons[id], fallbackMessage);
      failedMessages[id] =
        message === "TODO API request failed" ? fallbackMessage : message;
    });

    if (succeededIds.length > 0) {
      const deletedIds = new Set(succeededIds);
      setTodos((current) => current.filter((todo) => !deletedIds.has(todo.id)));
      announce(
        succeededIds.length === 1
          ? "TODOを削除しました"
          : `${succeededIds.length}件のTODOを削除しました`,
      );
    }

    if (failedIds.length > 0) {
      setDeleteErrors((current) => {
        const next = { ...current };
        for (const id of failedIds) {
          next[id] = failedMessages[id];
        }
        return next;
      });
    }

    setPendingDeleteIds((current) => {
      const next = new Set(current);
      for (const id of targetIds) {
        next.delete(id);
      }
      return next;
    });

    return {
      succeededIds,
      failedIds,
    } satisfies RemoveTodosResult;
  };

  const clearCreateError = () => setCreateError("");

  const clearDeleteErrors = (targets: TodoDto[]) => {
    setDeleteErrors((current) => {
      const next = { ...current };
      for (const todo of targets) {
        next[todo.id] = "";
      }
      return next;
    });
  };

  return {
    todos,
    status,
    loadError,
    createError,
    toggleErrors,
    deleteErrors,
    isCreating,
    pendingToggleIds,
    pendingDeleteIds,
    announcement,
    loadTodos,
    addTodo,
    toggleTodo,
    removeTodos,
    clearCreateError,
    clearDeleteErrors,
  };
}
