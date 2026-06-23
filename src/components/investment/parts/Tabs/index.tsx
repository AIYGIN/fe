"use client";

import { css, cx } from "../../../../../styled-system/css";
import { SegmentedControl } from "../SegmentedControl";

export function InvestmentTabs({
  tabs = ["タブ1", "タブ2", "タブ3", "タブ4"],
  selectedIndex = 0,
}: {
  tabs?: string[];
  selectedIndex?: number;
}) {
  return (
    <div className={css({ w: "full" })}>
      <div
        className={css({
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          borderBottom: "1px solid token(colors.investment-border)",
        })}
        role="tablist"
        aria-label="分析タブ"
      >
        {tabs.map((tab, index) => (
          <button
            aria-selected={index === selectedIndex}
            className={cx(
              tabButton,
              index === selectedIndex ? tabButtonSelected : tabButtonIdle,
            )}
            key={tab}
            role="tab"
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}

const tabButton = css({
  flex: "1",
  minW: "0",
  h: "10",
  px: "4",
  color: "investment-muted",
  borderBottom: "2px solid transparent",
  fontSize: "sm",
  fontWeight: "700",
  cursor: "pointer",
  transition: "color 160ms ease, border-color 160ms ease",
  _hover: { color: "investment-blue" },
  _focusVisible: {
    outline: "3px solid token(colors.investment-blue-soft)",
    outlineOffset: "-3px",
  },
});

const tabButtonSelected = css({
  color: "investment-blue",
  borderBottomColor: "investment-blue",
});

const tabButtonIdle = css({
  color: "investment-muted",
});

export function InvestmentTabsWithSegments() {
  return (
    <div>
      <InvestmentTabs />
      <p
        className={css({ mt: "5", mb: "3", fontSize: "sm", fontWeight: "800" })}
      >
        セグメント
      </p>
      <SegmentedControl
        items={["すべて", "ETF", "日本株", "米国株", "その他"]}
      />
    </div>
  );
}
