"use client";

import { memo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useTodos } from "@/hooks/todo";
import styles from "../styles.module.css";
import type { Todo } from "../types";

type TodoRowProps = {
  todoId: string;
  onDelete: (todo: Todo) => void;
};

export const TodoRow = memo(function TodoRow({
  todoId,
  onDelete,
}: TodoRowProps) {
  const { todo, toggleError, isTogglePending, isDeletePending, toggleTodo } =
    useTodos(
      useShallow((state) => ({
        todo: state.todos.find((item) => item.id === todoId),
        toggleError: state.toggleErrors[todoId],
        isTogglePending: state.pendingToggleIds.has(todoId),
        isDeletePending: state.pendingDeleteIds.has(todoId),
        toggleTodo: state.toggleTodo,
      })),
    );

  if (!todo) {
    return null;
  }

  return (
    <li className={styles.item}>
      <label className={styles.checkControl}>
        <input
          className={styles.checkbox}
          type="checkbox"
          checked={todo.completed}
          disabled={isTogglePending || isDeletePending}
          aria-label={`${todo.title}を${todo.completed ? "未完了" : "完了"}にする`}
          onChange={() => void toggleTodo(todo)}
        />
        <span className={styles.customCheck} aria-hidden="true" />
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
          {isTogglePending ? "更新中..." : todo.completed ? "完了" : "未完了"}
        </span>
        {toggleError ? (
          <span className={styles.rowError} role="alert">
            {toggleError}
          </span>
        ) : null}
      </div>
      <button
        className={styles.deleteButton}
        type="button"
        disabled={isDeletePending || isTogglePending}
        onClick={() => onDelete(todo)}
      >
        削除: {todo.title}
      </button>
    </li>
  );
});
