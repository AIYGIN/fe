"use client";

import { css, cx } from "../../../../../styled-system/css";

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
        bg: "white",
      })}
    >
      {items.map((item, index) => (
        <button
          aria-pressed={index === selectedIndex}
          className={cx(
            segmentButton,
            index === selectedIndex ? segmentButtonSelected : segmentButtonIdle,
            index === items.length - 1 ? segmentButtonLast : undefined,
          )}
          key={item}
          type="button"
        >
          {item}
        </button>
      ))}
    </div>
  );
}

const segmentButton = css({
  minW: "16",
  h: "8",
  px: "4",
  bg: "white",
  borderRight: "1px solid #cbd5e1",
  color: "investment-text",
  fontSize: "xs",
  fontWeight: "800",
  cursor: "pointer",
  transition:
    "background-color 160ms ease, border-color 160ms ease, color 160ms ease",
  _hover: { color: "investment-blue", bg: "#f8fbff" },
  _focusVisible: {
    outline: "3px solid token(colors.investment-blue-soft)",
    outlineOffset: "-3px",
  },
});

const segmentButtonSelected = css({
  bg: "#eff6ff",
  color: "investment-blue",
  boxShadow: "inset 0 0 0 1px token(colors.investment-blue)",
});

const segmentButtonIdle = css({
  bg: "white",
});

const segmentButtonLast = css({
  borderRight: "0",
});
