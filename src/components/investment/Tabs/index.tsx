"use client";

import { css } from "../../../../styled-system/css";
import { SegmentedControl } from "../SegmentedControl";

export function InvestmentTabs({
  tabs = ["タブ1", "タブ2", "タブ3", "タブ4"],
  selectedIndex = 0,
}: {
  tabs?: string[];
  selectedIndex?: number;
}) {
  return (
    <div>
      <div
        className={css({
          display: "grid",
          gridTemplateColumns: `repeat(${tabs.length}, 1fr)`,
          borderBottom: "1px solid token(colors.investment-border)",
        })}
        role="tablist"
        aria-label="分析タブ"
      >
        {tabs.map((tab, index) => (
          <button
            aria-selected={index === selectedIndex}
            className={css({
              py: "3",
              color:
                index === selectedIndex
                  ? "investment-blue"
                  : "investment-muted",
              borderBottom:
                index === selectedIndex
                  ? "2px solid token(colors.investment-blue)"
                  : "2px solid transparent",
              fontSize: "sm",
              fontWeight: "700",
              cursor: "pointer",
            })}
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
