"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useTodos } from "@/hooks/todo";
import type { TodoFilter } from "@/types/todo";
import { TodoDeleteDialog } from "../TodoDeleteDialog";
import { TodoListContent } from "../TodoListContent";
import { TodoToolbar } from "../TodoToolbar";
import type { DeleteRequest, Todo } from "../types";

type TodoWorkspaceProps = {
  initialFilter: TodoFilter;
};

export const TodoWorkspace = memo(function TodoWorkspace({
  initialFilter,
}: TodoWorkspaceProps) {
  const {
    todos,
    status,
    loadError,
    deleteErrors,
    pendingDeleteIds,
    loadTodos,
    removeTodos,
    clearDeleteErrors,
  } = useTodos(
    useShallow((state) => ({
      todos: state.todos,
      status: state.status,
      loadError: state.loadError,
      deleteErrors: state.deleteErrors,
      pendingDeleteIds: state.pendingDeleteIds,
      loadTodos: state.loadTodos,
      removeTodos: state.removeTodos,
      clearDeleteErrors: state.clearDeleteErrors,
    })),
  );
  const isBulkDeleteBlocked = useTodos((state) =>
    state.todos.some(
      (todo) => todo.completed && state.pendingToggleIds.has(todo.id),
    ),
  );
  const [filter, setFilter] = useState<TodoFilter>(initialFilter);
  const [query, setQuery] = useState("");
  const [deleteRequest, setDeleteRequest] = useState<DeleteRequest | null>(
    null,
  );
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const focusAfterDeleteRef = useRef(false);

  const counts = useMemo(
    () => ({
      all: todos.length,
      active: todos.filter((todo) => !todo.completed).length,
      completed: todos.filter((todo) => todo.completed).length,
    }),
    [todos],
  );
  const visibleTodos = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    return todos.filter((todo) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "active" && !todo.completed) ||
        (filter === "completed" && todo.completed);
      const matchesQuery =
        normalizedQuery.length === 0 ||
        todo.title.toLocaleLowerCase().includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });
  }, [filter, query, todos]);
  const completedTodos = useMemo(
    () => todos.filter((todo) => todo.completed),
    [todos],
  );
  const isDeletePending =
    deleteRequest?.todos.some((todo) => pendingDeleteIds.has(todo.id)) ?? false;
  const dialogError = deleteRequest
    ? deleteRequest.todos
        .map((todo) => deleteErrors[todo.id])
        .find((message) => message)
    : "";

  const openDeleteDialog = useCallback(
    (request: DeleteRequest) => {
      clearDeleteErrors(request.todos);
      setDeleteRequest(request);
    },
    [clearDeleteErrors],
  );
  const openSingleDeleteDialog = useCallback(
    (todo: Todo) => {
      openDeleteDialog({ kind: "single", todos: [todo] });
    },
    [openDeleteDialog],
  );
  const closeDialog = useCallback(() => {
    if (!isDeletePending) {
      setDeleteRequest(null);
    }
  }, [isDeletePending]);

  const handleDelete = async () => {
    if (!deleteRequest || isDeletePending) {
      return;
    }

    const result = await removeTodos(deleteRequest.todos);
    if (result.failedIds.length === 0) {
      focusAfterDeleteRef.current = true;
      setDeleteRequest(null);
      return;
    }

    const failedIds = new Set(result.failedIds);
    setDeleteRequest({
      kind: deleteRequest.kind,
      todos: deleteRequest.todos.filter((todo) => failedIds.has(todo.id)),
    } as DeleteRequest);
  };

  useEffect(() => {
    if (deleteRequest) {
      if (!restoreFocusRef.current) {
        restoreFocusRef.current = document.activeElement as HTMLElement | null;
        cancelButtonRef.current?.focus();
      }
      return;
    }

    if (focusAfterDeleteRef.current) {
      focusAfterDeleteRef.current = false;
      restoreFocusRef.current = null;
      const nextControl =
        document.querySelector<HTMLInputElement>(
          'input[type="checkbox"]:not(:disabled)',
        ) ?? document.querySelector<HTMLInputElement>("#todo-title");
      nextControl?.focus();
    } else {
      restoreFocusRef.current?.focus();
      restoreFocusRef.current = null;
    }
  }, [deleteRequest]);

  const handleDialogKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeDialog();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusableElements = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ) ?? [],
    ).filter((element) => !element.hasAttribute("disabled"));
    const firstElement = focusableElements[0];
    const lastElement = focusableElements.at(-1);

    if (focusableElements.length === 0) {
      event.preventDefault();
    } else if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement?.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement?.focus();
    }
  };

  return (
    <>
      <TodoToolbar
        filter={filter}
        query={query}
        counts={counts}
        isBulkDeleteBlocked={isBulkDeleteBlocked}
        onFilterChange={setFilter}
        onQueryChange={setQuery}
        onBulkDelete={() =>
          openDeleteDialog({ kind: "bulk", todos: completedTodos })
        }
      />
      <TodoListContent
        status={status}
        loadError={loadError}
        query={query}
        visibleTodos={visibleTodos}
        onReload={loadTodos}
        onDelete={openSingleDeleteDialog}
      />

      {deleteRequest ? (
        <TodoDeleteDialog
          request={deleteRequest}
          error={dialogError}
          isPending={isDeletePending}
          dialogRef={dialogRef}
          cancelButtonRef={cancelButtonRef}
          onCancel={closeDialog}
          onConfirm={() => void handleDelete()}
          onKeyDown={handleDialogKeyDown}
        />
      ) : null}
    </>
  );
});
