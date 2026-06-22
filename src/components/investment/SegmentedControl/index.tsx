"use client";

import { css } from "../../../../styled-system/css";

export function SegmentedControl({
  items,
  selectedIndex = 0,
}: {
  items: string[];
  selectedIndex?: number;
}) {
  return (
    <div
      className={css({
        display: "inline-flex",
        rounded: "md",
        overflow: "hidden",
        border: "1px solid #cbd5e1",
      })}
    >
      {items.map((item, index) => (
        <button
          aria-pressed={index === selectedIndex}
          className={css({
            minW: "16",
            h: "8",
            px: "4",
            bg: index === selectedIndex ? "#eff6ff" : "white",
            color:
              index === selectedIndex ? "investment-blue" : "investment-text",
            borderRight: index === items.length - 1 ? "0" : "1px solid #cbd5e1",
            fontSize: "xs",
            fontWeight: "800",
            cursor: "pointer",
          })}
          key={item}
          type="button"
        >
          {item}
        </button>
      ))}
    </div>
  );
}
