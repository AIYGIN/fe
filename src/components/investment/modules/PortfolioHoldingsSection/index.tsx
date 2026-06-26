import type { PortfolioData } from "@/lib/pages/portfolio/holdings";

import { css } from "../../../../../styled-system/css";
import { InvestmentPanel } from "../InvestmentPanel";
import { InvestmentRatioBar } from "../InvestmentRatioBar";

type PortfolioHoldingsSectionProps = {
  holdings: PortfolioData["holdings"];
};

export function PortfolioHoldingsSection({
  holdings,
}: PortfolioHoldingsSectionProps) {
  const total = holdings.reduce((sum, holding) => sum + holding.ratio, 0);

  return (
    <InvestmentPanel title="保有商品（手入力）">
      <div className={tableClass}>
        <div className={headClass}>
          <span>商品・ファンド名</span>
          <span>投資比率</span>
        </div>
        {holdings.map((holding, index) => (
          <div className={rowClass} key={`${holding.holdingId}-${index}`}>
            <div className={productClass}>
              <span>{holding.productName}</span>
            </div>
            <strong className={ratioClass}>
              {formatPercent(holding.ratio)}
            </strong>
            <InvestmentRatioBar
              tone={index === 0 ? "blue" : "amber"}
              value={holding.ratio}
            />
          </div>
        ))}
        <div className={totalClass}>
          <span>合計</span>
          <strong>{formatPercent(total)}</strong>
          <span />
        </div>
      </div>
      <p className={noteClass}>
        ※
        投資比率は手入力の目安です。実際の評価額・損益はSBI証券をご確認ください。
      </p>
    </InvestmentPanel>
  );
}

function formatPercent(value: number): string {
  return `${value.toFixed(value % 1 === 0 ? 0 : 1)}%`;
}

const tableClass = css({
  display: "grid",
  gap: 0,
});

const headClass = css({
  borderBottom: "1px solid",
  borderColor: "#dbe3ef",
  color: "#64748b",
  display: "grid",
  fontSize: "13px",
  fontWeight: 800,
  gridTemplateColumns: { base: "1fr 72px", md: "1fr 72px 210px" },
  pb: "12px",
  px: "4px",
  "& span:last-child": {
    gridColumn: { base: "2", md: "2 / 4" },
    textAlign: { base: "right", md: "left" },
  },
});

const rowClass = css({
  alignItems: "center",
  borderBottom: "1px solid",
  borderColor: "#e5eaf2",
  display: "grid",
  gap: { base: "8px", md: "18px" },
  gridTemplateColumns: { base: "1fr 72px", md: "1fr 72px 210px" },
  minH: "48px",
  py: "9px",
});

const productClass = css({
  alignItems: "center",
  color: "#111827",
  display: "flex",
  fontSize: "14px",
  fontWeight: 800,
  gap: "14px",
  minW: 0,
});

const ratioClass = css({
  color: "#111827",
  fontSize: "15px",
  fontVariantNumeric: "tabular-nums",
  textAlign: "right",
});

const totalClass = css({
  alignItems: "center",
  color: "#111827",
  display: "grid",
  fontSize: "15px",
  fontWeight: 800,
  gridTemplateColumns: { base: "1fr 72px", md: "1fr 72px 210px" },
  pt: "12px",
});

const noteClass = css({
  color: "#475569",
  fontSize: "12px",
  fontWeight: 600,
  lineHeight: 1.7,
  m: "22px 0 0",
});
