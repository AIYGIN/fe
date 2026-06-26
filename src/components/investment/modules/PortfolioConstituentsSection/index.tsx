import type { PortfolioData } from "@/lib/pages/portfolio/holdings";

import { css } from "../../../../../styled-system/css";
import { InvestmentPanel } from "../InvestmentPanel";

type ConstituentItem = PortfolioData["analysis"]["constituents"][number];

type PortfolioConstituentsSectionProps = {
  items: ConstituentItem[];
};

export function PortfolioConstituentsSection({
  items,
}: PortfolioConstituentsSectionProps) {
  const topItems = items.slice(0, 10);
  const total = topItems.reduce((sum, item) => sum + item.ratio, 0);

  return (
    <InvestmentPanel title="上位10銘柄（全体）">
      <div className={tableClass}>
        <div className={headClass}>
          <span>銘柄</span>
          <span>比率</span>
        </div>
        {topItems.map((item, index) => (
          <div className={rowClass} key={item.name}>
            <span className={rankClass}>{index + 1}</span>
            <span className={logoClass}>{getLogoText(item.name)}</span>
            <span className={nameClass}>{item.name}</span>
            <strong className={valueClass}>{formatPercent(item.ratio)}</strong>
          </div>
        ))}
        <div className={totalClass}>
          <span>合計</span>
          <strong>{formatPercent(total)}</strong>
        </div>
      </div>
      <p className={footnoteClass}>※ ETFの構成比率を加重平均</p>
    </InvestmentPanel>
  );
}

function getLogoText(name: string): string {
  return name.trim().charAt(0).toUpperCase();
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

const tableClass = css({
  display: "grid",
  minH: "272px",
});

const headClass = css({
  borderBottom: "1px solid",
  borderColor: "#dbe3ef",
  color: "#64748b",
  display: "grid",
  fontSize: "12px",
  fontWeight: 800,
  gridTemplateColumns: "42px 22px minmax(0, 1fr) 62px",
  pb: "9px",
  "& span:first-child": {
    gridColumn: "3",
  },
  "& span:last-child": {
    gridColumn: "4",
    textAlign: "right",
  },
});

const rowClass = css({
  alignItems: "center",
  borderBottom: "1px solid",
  borderColor: "#e5eaf2",
  display: "grid",
  gap: "9px",
  gridTemplateColumns: "24px 22px minmax(0, 1fr) 62px",
  minH: "28px",
});

const rankClass = css({
  color: "#111827",
  fontSize: "12px",
  fontWeight: 800,
});

const logoClass = css({
  alignItems: "center",
  bg: "#f1f5f9",
  borderRadius: "5px",
  color: "#0f172a",
  display: "inline-flex",
  fontSize: "10px",
  fontWeight: 900,
  h: "16px",
  justifyContent: "center",
  w: "16px",
});

const nameClass = css({
  color: "#111827",
  fontSize: "13px",
  fontWeight: 700,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const valueClass = css({
  color: "#111827",
  fontSize: "13px",
  fontVariantNumeric: "tabular-nums",
  fontWeight: 800,
  textAlign: "right",
});

const totalClass = css({
  alignItems: "center",
  color: "#111827",
  display: "grid",
  fontSize: "15px",
  fontWeight: 800,
  gridTemplateColumns: "1fr 70px",
  pt: "12px",
});

const footnoteClass = css({
  color: "#64748b",
  fontSize: "12px",
  fontWeight: 600,
  lineHeight: 1.7,
  m: "14px 0 0",
});
