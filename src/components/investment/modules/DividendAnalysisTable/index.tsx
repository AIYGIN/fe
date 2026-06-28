"use client";

import { StatusBadge } from "@/components/investment";
import type { DividendEnterprise } from "@/hooks/dividendAnalysis";

import { css, cx } from "../../../../../styled-system/css";

type DividendAnalysisTableProps = {
  enterprises: DividendEnterprise[];
  selectedSymbolId: string | null;
  onSelectSymbol: (symbolId: string) => void;
};

export function DividendAnalysisTable({
  enterprises,
  selectedSymbolId,
  onSelectSymbol,
}: DividendAnalysisTableProps) {
  if (enterprises.length === 0) {
    return (
      <p className={css({ color: "investment-muted", fontWeight: "700" })}>
        表示できる銘柄はありません
      </p>
    );
  }

  return (
    <div
      className={css({
        display: "grid",
        gap: "2",
      })}
    >
      {enterprises.map((enterprise) => {
        const selected = enterprise.symbolId === selectedSymbolId;

        return (
          <button
            aria-label={`${enterprise.symbolId} ${enterprise.companyName} 詳細を表示`}
            aria-pressed={selected}
            className={cx(
              rowClass,
              selected
                ? css({ borderColor: "investment-blue", bg: "#f8fbff" })
                : undefined,
            )}
            key={enterprise.symbolId}
            onClick={() => onSelectSymbol(enterprise.symbolId)}
            type="button"
          >
            <span
              className={css({
                display: "grid",
                gap: "1",
                minW: 0,
                textAlign: "left",
              })}
            >
              <span
                className={css({
                  color: "investment-muted",
                  fontSize: "xs",
                  fontWeight: "800",
                })}
              >
                {enterprise.rank} / {enterprise.symbolId}
              </span>
              <span
                className={css({
                  color: "investment-text",
                  fontSize: "sm",
                  fontWeight: "800",
                  overflowWrap: "anywhere",
                })}
              >
                {enterprise.companyName}
              </span>
              <span
                className={css({
                  color: "investment-muted",
                  fontSize: "xs",
                  fontWeight: "700",
                })}
              >
                {enterprise.sector}
              </span>
              <span
                className={css({
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "2",
                  mt: "1",
                })}
              >
                <StatusBadge tone={toTone(enterprise.safetyLabel)}>
                  {enterprise.judgement}
                </StatusBadge>
                <span className={pillClass}>
                  FCF:{" "}
                  {enterprise.isFcfNotApplicable
                    ? "N/A"
                    : formatScore(enterprise.scoreBreakdown.fcf.score)}
                </span>
                <span className={pillClass}>
                  減配履歴{" "}
                  {formatScore(
                    enterprise.scoreBreakdown.dividendCutHistory.score,
                  )}
                </span>
                <span className={pillClass}>
                  増配率{" "}
                  {formatScore(enterprise.scoreBreakdown.dividendGrowth.score)}
                </span>
                <span className={pillClass}>
                  配当性向{" "}
                  {formatScore(enterprise.scoreBreakdown.payoutRatio.score)}
                </span>
                <span className={pillClass}>
                  財務指標{" "}
                  {formatScore(
                    enterprise.scoreBreakdown.financialMetrics.score,
                  )}
                </span>
              </span>
            </span>
            <span
              className={css({
                alignItems: "flex-end",
                display: "grid",
                gap: "1",
                justifyItems: "end",
              })}
            >
              <span
                className={css({
                  color: "investment-text",
                  fontSize: "lg",
                  fontWeight: "900",
                })}
              >
                {formatNumber(enterprise.totalScore)}
              </span>
              <span
                className={css({
                  color: "investment-muted",
                  fontSize: "xs",
                  fontWeight: "700",
                })}
              >
                利回り {formatNumber(enterprise.latestDividendYield)}%
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

const rowClass = css({
  alignItems: "center",
  bg: "white",
  border: "1px solid",
  borderColor: "investment-border",
  borderRadius: "8px",
  cursor: "pointer",
  display: "grid",
  gap: "3",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  p: "3",
  textAlign: "left",
  transition: "border-color 160ms ease, background-color 160ms ease",
  _hover: { borderColor: "investment-blue", bg: "#f8fbff" },
});

const pillClass = css({
  bg: "#f8fafc",
  border: "1px solid",
  borderColor: "investment-border",
  borderRadius: "6px",
  color: "investment-muted",
  fontSize: "xs",
  fontWeight: "800",
  px: "2",
  py: "1",
});

function formatNumber(value: number) {
  return new Intl.NumberFormat("ja-JP", {
    maximumFractionDigits: 1,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
  }).format(value);
}

function formatScore(value: number | null) {
  return value === null ? "N/A" : formatNumber(value);
}

function toTone(label: DividendEnterprise["safetyLabel"]) {
  if (label === "safe") {
    return "safe";
  }

  if (label === "neutral") {
    return "watch";
  }

  return "warning";
}
