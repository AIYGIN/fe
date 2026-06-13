"use client";

import { memo, useMemo } from "react";
import { useTodos } from "@/hooks/todo";
import styles from "../styles.module.css";

export const TodoHeader = memo(function TodoHeader() {
  const todos = useTodos((state) => state.todos);
  const activeCount = useMemo(
    () => todos.filter((todo) => !todo.completed).length,
    [todos],
  );

  return (
    <header className={styles.header}>
      <div className={styles.heading}>
        <h1 className={styles.intro}>TODOリスト</h1>
      </div>
      <output className={styles.summary} aria-label="未完了件数">
        <span className={styles.summaryValue}>{activeCount}</span>
        <span className={styles.summaryLabel}>未完了のタスク</span>
      </output>
    </header>
  );
});
