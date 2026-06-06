"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTodos } from "@/hooks/useTodos";
import type { Todo, TodoFilter } from "@/types/todo";
import styles from "./TodoPage.module.css";

type TodoPageProps = {
  initialTodos?: Todo[];
  initialFilter?: TodoFilter;
  initialStatus?: "idle" | "loading" | "error";
  initialError?: string;
  initialDraft?: string;
  initialValidationError?: string;
  autoLoad?: boolean;
};

type DeleteRequest =
  | { kind: "single"; todos: [Todo] }
  | { kind: "bulk"; todos: Todo[] };

const filterLabels: Record<TodoFilter, string> = {
  all: "すべて",
  active: "未完了",
  completed: "完了",
};

const validateTitle = (value: string) => {
  const title = value.trim();

  if (title.length === 0) {
    return "TODOを入力してください";
  }

  if (title.length > 80) {
    return "TODOは80文字以内で入力してください";
  }

  return null;
};

export function TodoPage({
  initialTodos = [],
  initialFilter = "all",
  initialStatus = "loading",
  initialError = "",
  initialDraft = "",
  initialValidationError = "",
  autoLoad = true,
}: TodoPageProps) {
  const {
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
  } = useTodos({
    initialTodos,
    initialStatus,
    initialError,
    autoLoad,
  });
  const [filter, setFilter] = useState<TodoFilter>(initialFilter);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState(initialDraft);
  const [validationError, setValidationError] = useState(
    initialValidationError,
  );
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextError = validateTitle(draft);

    if (nextError) {
      setValidationError(nextError);
      return;
    }

    setValidationError("");
    const created = await addTodo(draft.trim());
    if (created) {
      setDraft("");
    }
  };

  const openDeleteDialog = (request: DeleteRequest) => {
    clearDeleteErrors(request.todos);
    setDeleteRequest(request);
  };

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

    if (focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements.at(-1);

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement?.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  return (
    <main className={styles.shell}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.heading}>
            <p className={styles.intro}>
              TODOリスト
            </p>
          </div>
          <output className={styles.summary} aria-label="未完了件数">
            <span className={styles.summaryValue}>{counts.active}</span>
            <span className={styles.summaryLabel}>未完了のタスク</span>
          </output>
        </header>

        <section className={styles.panel} aria-label="TODO管理">
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="todo-title">
                新しいTODO
              </label>
              <input
                id="todo-title"
                className={styles.input}
                value={draft}
                maxLength={120}
                onChange={(event) => {
                  setDraft(event.target.value);
                  setValidationError("");
                  clearCreateError();
                }}
                aria-invalid={validationError || createError ? "true" : "false"}
                aria-describedby={
                  validationError || createError
                    ? "todo-title-error"
                    : undefined
                }
                placeholder="次に終わらせることは？"
              />
              {validationError || createError ? (
                <p
                  className={styles.errorText}
                  id="todo-title-error"
                  role={createError ? "alert" : undefined}
                >
                  {validationError || createError}
                </p>
              ) : (
                <p className={styles.hint}>1〜80文字で入力できます</p>
              )}
            </div>
            <button
              className={styles.primaryButton}
              type="submit"
              disabled={isCreating}
            >
              {isCreating ? "追加中..." : "追加"}
            </button>
          </form>

          <div className={styles.workspaceBar}>
            <div className={styles.searchField}>
              <label className={styles.visuallyHidden} htmlFor="todo-search">
                TODOを検索
              </label>
              <input
                id="todo-search"
                className={styles.searchInput}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="TODOを検索"
              />
            </div>

            <fieldset className={styles.filters}>
              <legend className={styles.visuallyHidden}>TODOフィルタ</legend>
              {(Object.keys(filterLabels) as TodoFilter[]).map((value) => (
                <button
                  className={styles.filterButton}
                  type="button"
                  key={value}
                  aria-label={filterLabels[value]}
                  aria-pressed={filter === value}
                  onClick={() => setFilter(value)}
                >
                  <span>{filterLabels[value]}</span>
                  <span className={styles.filterCount}>{counts[value]}</span>
                </button>
              ))}
            </fieldset>
          </div>

          <div className={styles.progressRow}>
            <div
              className={styles.progress}
              role="progressbar"
              aria-label="完了進捗"
              aria-valuemin={0}
              aria-valuenow={counts.completed}
              aria-valuemax={counts.all}
            >
              <span className={styles.progressText}>
                {counts.completed} / {counts.all}件完了
              </span>
              <span className={styles.progressTrack} aria-hidden="true">
                <span
                  className={styles.progressValue}
                  style={{
                    width:
                      counts.all === 0
                        ? "0%"
                        : `${(counts.completed / counts.all) * 100}%`,
                  }}
                />
              </span>
            </div>
            <button
              className={styles.bulkDeleteButton}
              type="button"
              disabled={completedTodos.length === 0}
              aria-label={`完了済みを一括削除（${completedTodos.length}件）`}
              onClick={() =>
                openDeleteDialog({ kind: "bulk", todos: completedTodos })
              }
            >
              完了済みを整理
              <span>{completedTodos.length}件</span>
            </button>
          </div>

          <div className={styles.content}>
            {status === "loading" ? (
              <output className={styles.stateBox}>
                <span className={styles.stateIcon}>•••</span>
                <span className={styles.stateBoxStrong}>読み込み中</span>
                TODO一覧を取得しています
              </output>
            ) : null}

            {status === "error" ? (
              <div className={styles.stateBox} role="alert">
                <span className={styles.stateIcon}>!</span>
                <span className={styles.stateBoxStrong}>{loadError}</span>
                <button
                  className={styles.secondaryButton}
                  type="button"
                  onClick={loadTodos}
                >
                  再読み込み
                </button>
              </div>
            ) : null}

            {status === "idle" && visibleTodos.length === 0 ? (
              <div className={styles.stateBox}>
                <span className={styles.stateIcon}>✓</span>
                <span className={styles.stateBoxStrong}>
                  {query.trim()
                    ? "検索条件に一致するTODOはありません"
                    : "表示するTODOはありません"}
                </span>
                {query.trim()
                  ? "検索語を変えるか、別のフィルタを選んでください"
                  : "条件に合うTODOが追加されるとここに表示されます"}
              </div>
            ) : null}

            {status === "idle" && visibleTodos.length > 0 ? (
              <ul className={styles.list} aria-label="TODO一覧">
                {visibleTodos.map((todo) => {
                  const isTogglePending = pendingToggleIds.has(todo.id);

                  return (
                    <li className={styles.item} key={todo.id}>
                      <label className={styles.checkControl}>
                        <input
                          className={styles.checkbox}
                          type="checkbox"
                          checked={todo.completed}
                          disabled={isTogglePending}
                          aria-label={`${todo.title}を${todo.completed ? "未完了" : "完了"}にする`}
                          onChange={() => void toggleTodo(todo)}
                        />
                        <span
                          className={styles.customCheck}
                          aria-hidden="true"
                        />
                      </label>
                      <div className={styles.todoBody}>
                        <span
                          className={`${styles.todoTitle} ${
                            todo.completed ? styles.completed : ""
                          }`}
                        >
                          {todo.title}
                        </span>
                        <span className={styles.todoMeta}>
                          {isTogglePending
                            ? "更新中..."
                            : todo.completed
                              ? "完了"
                              : "未完了"}
                        </span>
                        {toggleErrors[todo.id] ? (
                          <span className={styles.rowError} role="alert">
                            {toggleErrors[todo.id]}
                          </span>
                        ) : null}
                      </div>
                      <button
                        className={styles.deleteButton}
                        type="button"
                        disabled={pendingDeleteIds.has(todo.id)}
                        onClick={() =>
                          openDeleteDialog({ kind: "single", todos: [todo] })
                        }
                      >
                        削除: {todo.title}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        </section>
      </div>

      <output
        className={styles.visuallyHidden}
        aria-label="操作結果"
        aria-live="polite"
      >
        <span key={announcement.sequence}>{announcement.message}</span>
      </output>

      {deleteRequest ? (
        <div className={styles.dialogBackdrop}>
          <div
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            aria-describedby="delete-dialog-body"
            ref={dialogRef}
            onKeyDown={handleDialogKeyDown}
          >
            <div className={styles.dialogMark} aria-hidden="true">
              !
            </div>
            <h2 className={styles.dialogTitle} id="delete-dialog-title">
              {deleteRequest.kind === "bulk"
                ? "完了済みTODOを一括削除"
                : "TODOを削除"}
            </h2>
            <p className={styles.dialogBody} id="delete-dialog-body">
              {deleteRequest.kind === "bulk"
                ? `完了済みのTODO ${deleteRequest.todos.length}件を削除します。`
                : `「${deleteRequest.todos[0].title}」を削除します。確定するまで一覧には残ります。`}
            </p>
            {dialogError ? (
              <p className={styles.dialogError} role="alert">
                {dialogError}
              </p>
            ) : null}
            <div className={styles.dialogActions}>
              <button
                className={styles.secondaryButton}
                type="button"
                ref={cancelButtonRef}
                disabled={isDeletePending}
                onClick={closeDialog}
              >
                キャンセル
              </button>
              <button
                className={styles.dangerButton}
                type="button"
                disabled={isDeletePending}
                onClick={() => void handleDelete()}
              >
                {isDeletePending
                  ? "削除中..."
                  : deleteRequest.kind === "bulk"
                    ? `${deleteRequest.todos.length}件を削除する`
                    : "削除する"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
