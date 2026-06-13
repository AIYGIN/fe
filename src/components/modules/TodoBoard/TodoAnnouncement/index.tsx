"use client";

import { memo } from "react";
import { useTodos } from "@/hooks/todo";
import styles from "../styles.module.css";

export const TodoAnnouncement = memo(function TodoAnnouncement() {
  const announcement = useTodos((state) => state.announcement);

  return (
    <output
      className={styles.visuallyHidden}
      aria-label="操作結果"
      aria-live="polite"
    >
      <span key={announcement.sequence}>{announcement.message}</span>
    </output>
  );
});
