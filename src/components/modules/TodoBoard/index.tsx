"use client";

import styles from "./styles.module.css";
import { TodoAnnouncement } from "./TodoAnnouncement";
import { TodoComposer } from "./TodoComposer";
import { TodoHeader } from "./TodoHeader";
import { TodoWorkspace } from "./TodoWorkspace";
import type { TodoBoardProps } from "./types";

export type { TodoBoardProps } from "./types";

export function TodoBoard({
  initialFilter,
  initialDraft,
  initialValidationError,
}: TodoBoardProps) {
  return (
    <main className={styles.shell}>
      <div className={styles.container}>
        <TodoHeader />
        <section className={styles.panel} aria-label="TODO管理">
          <TodoComposer
            initialDraft={initialDraft}
            initialValidationError={initialValidationError}
          />
          <TodoWorkspace initialFilter={initialFilter} />
        </section>
      </div>
      <TodoAnnouncement />
    </main>
  );
}
