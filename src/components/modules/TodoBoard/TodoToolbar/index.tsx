import type { TodoFilter } from "@/types/todo";
import styles from "../styles.module.css";

const filterLabels: Record<TodoFilter, string> = {
  all: "すべて",
  active: "未完了",
  completed: "完了",
};

type TodoCounts = Record<TodoFilter, number>;

type TodoToolbarProps = {
  filter: TodoFilter;
  query: string;
  counts: TodoCounts;
  isBulkDeleteBlocked: boolean;
  onFilterChange: (filter: TodoFilter) => void;
  onQueryChange: (query: string) => void;
  onBulkDelete: () => void;
};

export function TodoToolbar({
  filter,
  query,
  counts,
  isBulkDeleteBlocked,
  onFilterChange,
  onQueryChange,
  onBulkDelete,
}: TodoToolbarProps) {
  return (
    <>
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
            onChange={(event) => onQueryChange(event.target.value)}
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
              onClick={() => onFilterChange(value)}
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
          disabled={counts.completed === 0 || isBulkDeleteBlocked}
          aria-label={`完了済みを一括削除（${counts.completed}件）`}
          onClick={onBulkDelete}
        >
          完了済みを整理
          <span>{counts.completed}件</span>
        </button>
      </div>
    </>
  );
}
