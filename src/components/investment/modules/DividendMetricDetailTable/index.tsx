import { StatusBadge } from "@/components/investment";
import type { DividendAnalysisDetail } from "@/hooks/dividendAnalysis";

import { css } from "../../../../../styled-system/css";

type DividendMetricDetailTableProps = {
  metrics: DividendAnalysisDetail["metrics"];
  scoreBreakdown: DividendAnalysisDetail["scoreBreakdown"];
};

export function DividendMetricDetailTable({
  metrics,
  scoreBreakdown,
}: DividendMetricDetailTableProps) {
  const rows = [
    {
      label: "FCF",
      value:
        scoreBreakdown.fcf.isNotApplicable || metrics.fcf === null
          ? "FCF N/A"
          : formatCurrency(metrics.fcf),
      score: scoreBreakdown.fcf.score,
      maxScore: scoreBreakdown.fcf.maxScore,
      detail: scoreBreakdown.fcf.reason,
    },
    {
      label: "配当性向",
      value: `${formatNumber(metrics.payoutRatio)}%`,
      score: scoreBreakdown.payoutRatio.score,
      maxScore: scoreBreakdown.payoutRatio.maxScore,
      detail: scoreBreakdown.payoutRatio.reason,
    },
    {
      label: "10年配当成長率",
      value: `${formatNumber(metrics.dividendGrowthRate10y)}%`,
      score: scoreBreakdown.dividendGrowth.score,
      maxScore: scoreBreakdown.dividendGrowth.maxScore,
      detail: scoreBreakdown.dividendGrowth.reason,
    },
    {
      label: "10年減配回数",
      value: `${formatNumber(metrics.dividendCutCount10y)}回`,
      score: scoreBreakdown.dividendCutHistory.score,
      maxScore: scoreBreakdown.dividendCutHistory.maxScore,
      detail: scoreBreakdown.dividendCutHistory.reason,
    },
    {
      label: "配当利回り",
      value: "スコア評価",
      score: scoreBreakdown.dividendYield.score,
      maxScore: scoreBreakdown.dividendYield.maxScore,
      detail: scoreBreakdown.dividendYield.reason,
    },
    {
      label: "PER / PBR / ROE",
      value: `${formatNumber(metrics.per)} / ${formatNumber(
        metrics.pbr,
      )} / ${formatNumber(metrics.roe)}%`,
      score: scoreBreakdown.financialMetrics.score,
      maxScore: scoreBreakdown.financialMetrics.maxScore,
      detail: scoreBreakdown.financialMetrics.reason,
    },
  ];

  return (
    <dl className={css({ display: "grid", gap: "2" })}>
      {rows.map((row) => (
        <div
          className={css({
            borderBottom: "1px solid",
            borderColor: "investment-border",
            display: "grid",
            gap: "1",
            pb: "3",
          })}
          key={row.label}
        >
          <dt
            className={css({
              color: "investment-muted",
              fontSize: "xs",
              fontWeight: "800",
            })}
          >
            {row.label}
          </dt>
          <dd className={css({ m: 0 })}>
            <div
              className={css({
                alignItems: "center",
                display: "flex",
                flexWrap: "wrap",
                gap: "2",
              })}
            >
              <span
                className={css({
                  color: "investment-text",
                  fontSize: "sm",
                  fontWeight: "900",
                })}
              >
                {row.value}
              </span>
              <StatusBadge tone={getScoreTone(row.score, row.maxScore)}>
                評価 {getScoreLabel(row.score, row.maxScore)}
              </StatusBadge>
              <span
                className={css({
                  color: "investment-muted",
                  fontSize: "xs",
                  fontWeight: "800",
                })}
              >
                得点 {formatScore(row.score)} / {row.maxScore}
              </span>
            </div>
          </dd>
          {row.detail ? (
            <dd
              className={css({
                color: "investment-muted",
                fontSize: "xs",
                lineHeight: "1.5",
                m: 0,
              })}
            >
              詳細: {row.detail}
            </dd>
          ) : null}
        </div>
      ))}
    </dl>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("ja-JP", {
    maximumFractionDigits: 1,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
  }).format(value);
}

function formatCurrency(value: number) {
  return `${new Intl.NumberFormat("ja-JP", {
    maximumFractionDigits: 0,
  }).format(value)}円`;
}

function formatScore(score: number | null) {
  return score === null ? "N/A" : formatNumber(score);
}

function getScoreLabel(score: number | null, maxScore: number) {
  if (score === null) {
    return "対象外";
  }

  const ratio = score / maxScore;
  if (ratio >= 0.75) {
    return "良好";
  }

  if (ratio >= 0.5) {
    return "注意";
  }

  return "要確認";
}

function getScoreTone(score: number | null, maxScore: number) {
  if (score === null) {
    return "neutral";
  }

  const ratio = score / maxScore;
  if (ratio >= 0.75) {
    return "safe";
  }

  if (ratio >= 0.5) {
    return "watch";
  }

  return "warning";
}
