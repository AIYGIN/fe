"use client";

import { css } from "../../../../../styled-system/css";

export function Pagination({
  pages = ["‹", "1", "2", "3", "...", "10", "›"],
  current = "1",
}: {
  pages?: string[];
  current?: string;
}) {
  return (
    <nav
      aria-label="ページネーション"
      className={css({ display: "flex", alignItems: "center", gap: "2" })}
    >
      {pages.map((item) =>
        item === "..." ? (
          <span
            className={css({ px: "3", color: "investment-muted" })}
            key={item}
          >
            ...
          </span>
        ) : (
          <button
            aria-current={item === current ? "page" : undefined}
            className={css({
              minW: "8",
              h: "8",
              px: "2",
              rounded: "md",
              border: "1px solid #cbd5e1",
              bg: item === current ? "investment-blue" : "white",
              color: item === current ? "white" : "investment-text",
              fontWeight: "700",
              cursor: "pointer",
            })}
            key={item}
            type="button"
          >
            {item}
          </button>
        ),
      )}
    </nav>
  );
}
