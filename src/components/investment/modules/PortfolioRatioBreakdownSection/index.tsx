import type { PortfolioData } from "@/lib/pages/portfolio/holdings";

import { css } from "../../../../../styled-system/css";
import type { InvestmentDonutItem } from "../InvestmentDonutChart";
import { InvestmentDonutChart } from "../InvestmentDonutChart";
import { InvestmentPanel } from "../InvestmentPanel";

type RatioItem = PortfolioData["analysis"]["sectorAllocations"][number];

type PortfolioRatioBreakdownSectionProps = {
  title: string;
  items: RatioItem[];
  footnote?: string;
};

const chartColors = [
  "#1268df",
  "#4fbe72",
  "#f5ae32",
  "#8b6fe8",
  "#49bfd0",
  "#f27b53",
  "#f27b69",
  "#8f74df",
  "#94a3b8",
  "#cbd5e1",
];

export function PortfolioRatioBreakdownSection({
  title,
  items,
  footnote = "※ ETFの構成比率を加重平均",
}: PortfolioRatioBreakdownSectionProps) {
  const donutItems = toDonutItems(items);

  return (
    <InvestmentPanel title={title}>
      <div className={contentClass}>
        <InvestmentDonutChart items={donutItems} />
        <ul className={legendClass}>
          {donutItems.map((item, index) => (
            <li className={legendItemClass} key={`${item.name}-${index}`}>
              <span
                className={dotClass}
                style={{ backgroundColor: item.color }}
              />
              <span className={nameClass}>{item.name}</span>
              <strong className={valueClass}>
                {formatPercent(item.ratio)}
              </strong>
            </li>
          ))}
        </ul>
      </div>
      <p className={footnoteClass}>{footnote}</p>
    </InvestmentPanel>
  );
}

function toDonutItems(items: RatioItem[]): InvestmentDonutItem[] {
  return items.slice(0, 10).map((item, index) => ({
    color: chartColors[index % chartColors.length],
    name: item.name,
    ratio: item.ratio,
  }));
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

const contentClass = css({
  alignItems: "center",
  display: "grid",
  gap: "14px",
  gridTemplateColumns: { base: "1fr", md: "176px minmax(0, 1fr)" },
  minH: "270px",
});

const legendClass = css({
  display: "grid",
  gap: "10px",
  listStyle: "none",
  m: 0,
  padding: 0,
});

const legendItemClass = css({
  alignItems: "center",
  color: "#111827",
  display: "grid",
  fontSize: "12px",
  fontWeight: 700,
  gap: "8px",
  gridTemplateColumns: "8px minmax(0, 1fr) 44px",
});

const dotClass = css({
  borderRadius: "999px",
  h: "8px",
  w: "8px",
});

const nameClass = css({
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const valueClass = css({
  fontVariantNumeric: "tabular-nums",
  textAlign: "right",
});

const footnoteClass = css({
  color: "#64748b",
  fontSize: "12px",
  fontWeight: 600,
  lineHeight: 1.7,
  m: "16px 0 0",
});
