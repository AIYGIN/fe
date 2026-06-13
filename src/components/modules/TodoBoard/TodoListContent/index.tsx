import styles from "../styles.module.css";
import { TodoRow } from "../TodoRow";
import type { Todo } from "../types";

type TodoListContentProps = {
  status: "idle" | "loading" | "error";
  loadError: string;
  query: string;
  visibleTodos: Todo[];
  onReload: () => void;
  onDelete: (todo: Todo) => void;
};

export function TodoListContent({
  status,
  loadError,
  query,
  visibleTodos,
  onReload,
  onDelete,
}: TodoListContentProps) {
  return (
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
            onClick={onReload}
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
          {visibleTodos.map((todo) => (
            <TodoRow key={todo.id} todoId={todo.id} onDelete={onDelete} />
          ))}
        </ul>
      ) : null}
    </div>
  );
}
