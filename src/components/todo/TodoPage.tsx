"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createTodo,
  deleteTodo,
  fetchTodos,
  updateTodo,
} from "@/lib/api/todos";
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
  const [todos, setTodos] = useState(initialTodos);
  const [filter, setFilter] = useState<TodoFilter>(initialFilter);
  const [status, setStatus] = useState(initialStatus);
  const [error, setError] = useState(initialError);
  const [draft, setDraft] = useState(initialDraft);
  const [validationError, setValidationError] = useState(
    initialValidationError,
  );
  const [pendingDelete, setPendingDelete] = useState<Todo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const loadTodos = useCallback(async () => {
    setStatus("loading");
    setError("");

    try {
      const items = await fetchTodos();
      setTodos(items);
      setStatus("idle");
    } catch {
      setError("TODO一覧を取得できませんでした");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (autoLoad) {
      void loadTodos();
    }
  }, [autoLoad, loadTodos]);

  const visibleTodos = useMemo(() => {
    if (filter === "active") {
      return todos.filter((todo) => !todo.completed);
    }

    if (filter === "completed") {
      return todos.filter((todo) => todo.completed);
    }

    return todos;
  }, [filter, todos]);

  const activeCount = todos.filter((todo) => !todo.completed).length;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextError = validateTitle(draft);

    if (nextError) {
      setValidationError(nextError);
      return;
    }

    setValidationError("");
    setIsSubmitting(true);

    try {
      const created = await createTodo({ title: draft });
      setTodos((current) => [created, ...current]);
      setDraft("");
    } catch (requestError) {
      setValidationError(
        requestError instanceof Error
          ? requestError.message
          : "TODOを追加できませんでした",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (todo: Todo) => {
    const updated = await updateTodo(todo.id, { completed: !todo.completed });
    setTodos((current) =>
      current.map((item) => (item.id === updated.id ? updated : item)),
    );
  };

  const handleDelete = async () => {
    if (!pendingDelete) {
      return;
    }

    await deleteTodo(pendingDelete.id);
    setTodos((current) =>
      current.filter((todo) => todo.id !== pendingDelete.id),
    );
    setPendingDelete(null);
  };

  const closeDialog = useCallback(() => {
    setPendingDelete(null);
  }, []);

  useEffect(() => {
    if (!pendingDelete) {
      restoreFocusRef.current?.focus();
      restoreFocusRef.current = null;
      return;
    }

    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    cancelButtonRef.current?.focus();
  }, [pendingDelete]);

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
          <div>
            <p className={styles.eyebrow}>TODO v1</p>
            <h1 className={styles.title}>TODOリスト</h1>
          </div>
          <output className={styles.summary} aria-label="未完了件数">
            <span className={styles.summaryValue}>{activeCount}</span>
            <span className={styles.summaryLabel}>未完了</span>
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
                }}
                aria-invalid={validationError ? "true" : "false"}
                aria-describedby={
                  validationError ? "todo-title-error" : undefined
                }
                placeholder="1〜80文字で入力"
              />
              {validationError ? (
                <p className={styles.errorText} id="todo-title-error">
                  {validationError}
                </p>
              ) : null}
            </div>
            <button
              className={styles.button}
              type="submit"
              disabled={isSubmitting}
            >
              追加
            </button>
          </form>

          <fieldset className={styles.filters}>
            <legend className={styles.visuallyHidden}>TODOフィルタ</legend>
            {(Object.keys(filterLabels) as TodoFilter[]).map((value) => (
              <button
                className={styles.filterButton}
                type="button"
                key={value}
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
              >
                {filterLabels[value]}
              </button>
            ))}
          </fieldset>

          <div className={styles.content}>
            {status === "loading" ? (
              <output className={styles.stateBox}>
                <span className={styles.stateBoxStrong}>読み込み中</span>
                TODO一覧を取得しています
              </output>
            ) : null}

            {status === "error" ? (
              <div className={styles.stateBox} role="alert">
                <div>
                  <span className={styles.stateBoxStrong}>{error}</span>
                  <button
                    className={styles.ghostButton}
                    type="button"
                    onClick={loadTodos}
                  >
                    再読み込み
                  </button>
                </div>
              </div>
            ) : null}

            {status === "idle" && visibleTodos.length === 0 ? (
              <div className={styles.stateBox}>
                <span className={styles.stateBoxStrong}>
                  表示するTODOはありません
                </span>
                条件に合うTODOが追加されるとここに表示されます
              </div>
            ) : null}

            {status === "idle" && visibleTodos.length > 0 ? (
              <ul className={styles.list} aria-label="TODO一覧">
                {visibleTodos.map((todo) => (
                  <li className={styles.item} key={todo.id}>
                    <input
                      className={styles.checkbox}
                      type="checkbox"
                      checked={todo.completed}
                      aria-label={`${todo.title}を${todo.completed ? "未完了" : "完了"}にする`}
                      onChange={() => void handleToggle(todo)}
                    />
                    <span
                      className={`${styles.todoTitle} ${
                        todo.completed ? styles.completed : ""
                      }`}
                    >
                      {todo.title}
                    </span>
                    <button
                      className={styles.ghostButton}
                      type="button"
                      onClick={() => setPendingDelete(todo)}
                    >
                      削除: {todo.title}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>
      </div>

      {pendingDelete ? (
        <div className={styles.dialogBackdrop}>
          <div
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            ref={dialogRef}
            onKeyDown={handleDialogKeyDown}
          >
            <h2 className={styles.dialogTitle} id="delete-dialog-title">
              TODOを削除
            </h2>
            <p className={styles.dialogBody}>
              「{pendingDelete.title}
              」を削除します。確定するまで一覧には残ります。
            </p>
            <div className={styles.dialogActions}>
              <button
                className={styles.ghostButton}
                type="button"
                ref={cancelButtonRef}
                onClick={closeDialog}
              >
                キャンセル
              </button>
              <button
                className={styles.dangerButton}
                type="button"
                onClick={handleDelete}
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
