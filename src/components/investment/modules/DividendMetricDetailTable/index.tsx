import { StatusBadge } from "@/components/investment";
import type { DividendAnalysisDetail } from "@/hooks/dividendAnalysis";

import { css, cx } from "../../../../../styled-system/css";
import type { InvestmentTone } from "../../parts/tone";

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
      index: 1,
      label: "FCF",
      allocation: scoreBreakdown.fcf.maxScore,
      value:
        scoreBreakdown.fcf.isNotApplicable || metrics.fcf === null
          ? "FCF N/A"
          : formatCurrency(metrics.fcf),
      score: scoreBreakdown.fcf.score,
      maxScore: scoreBreakdown.fcf.maxScore,
      detail: scoreBreakdown.fcf.reason,
      visual: "bars",
    },
    {
      index: 2,
      label: "減配履歴",
      allocation: scoreBreakdown.dividendCutHistory.maxScore,
      value: `${scoreBreakdown.dividendCutHistory.periodYears}年`,
      score: scoreBreakdown.dividendCutHistory.score,
      maxScore: scoreBreakdown.dividendCutHistory.maxScore,
      detail: scoreBreakdown.dividendCutHistory.reason,
      visual: "dots",
    },
    {
      index: 3,
      label: "増配率（年平均）",
      allocation: scoreBreakdown.dividendGrowth.maxScore,
      value: `${formatNumber(metrics.dividendGrowthRate10y)}%`,
      score: scoreBreakdown.dividendGrowth.score,
      maxScore: scoreBreakdown.dividendGrowth.maxScore,
      detail: scoreBreakdown.dividendGrowth.reason,
      visual: "line",
    },
    {
      index: 4,
      label: "配当性向",
      allocation: scoreBreakdown.payoutRatio.maxScore,
      value: `${formatNumber(metrics.payoutRatio)}%`,
      score: scoreBreakdown.payoutRatio.score,
      maxScore: scoreBreakdown.payoutRatio.maxScore,
      detail: scoreBreakdown.payoutRatio.reason,
      visual: "gauge",
    },
    {
      index: 5,
      label: "配当利回り",
      allocation: scoreBreakdown.dividendYield.maxScore,
      value: "目安レンジ内",
      score: scoreBreakdown.dividendYield.score,
      maxScore: scoreBreakdown.dividendYield.maxScore,
      detail: scoreBreakdown.dividendYield.reason,
      visual: "gauge",
    },
    {
      index: 6,
      label: "財務指標\n(PER / PBR / ROE)",
      allocation: scoreBreakdown.financialMetrics.maxScore,
      value: `PER ${formatNumber(metrics.per)} / PBR ${formatNumber(
        metrics.pbr,
      )} / ROE ${formatNumber(metrics.roe)}%`,
      score: scoreBreakdown.financialMetrics.score,
      maxScore: scoreBreakdown.financialMetrics.maxScore,
      detail: scoreBreakdown.financialMetrics.reason,
      visual: "line",
    },
  ];

  return (
    <div className={css({ overflowX: "auto" })}>
      <table className={tableClass}>
        <thead>
          <tr>
            {["項目", "配点", "評価・判定", "得点", "詳細", ""].map(
              (header) => (
                <th className={headerCellClass} key={header} scope="col">
                  {header}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const tone = getScoreTone(row.score, row.maxScore);

            return (
              <tr className={rowClass} key={row.label}>
                <td className={metricCellClass}>
                  <span className={cx(indexClass, toneTextClass[tone])}>
                    {row.index}
                  </span>
                  <span>
                    {row.label.split("\n").map((line) => (
                      <span className={css({ display: "block" })} key={line}>
                        {line}
                      </span>
                    ))}
                  </span>
                </td>
                <td className={bodyCellClass}>{row.allocation}点</td>
                <td className={bodyCellClass}>
                  <StatusBadge tone={tone}>
                    評価 {getScoreLabel(row.score, row.maxScore)}
                  </StatusBadge>
                </td>
                <td className={cx(bodyCellClass, toneTextClass[tone])}>
                  得点 {formatScore(row.score)} / {row.maxScore}
                </td>
                <td className={detailCellClass}>
                  <span
                    className={css({
                      color: "investment-text",
                      fontWeight: "900",
                    })}
                  >
                    {row.value}
                  </span>
                  <span className={css({ display: "block", mt: "1" })}>
                    詳細: {row.detail}
                  </span>
                </td>
                <td className={visualCellClass}>
                  <MiniVisual kind={row.visual} tone={tone} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p
        className={css({
          color: "investment-muted",
          fontSize: "xs",
          fontWeight: "800",
          mt: "3",
        })}
      >
        ※ 財務指標の配点内訳：ROE（4点）・PER（3点）・PBR（3点）
      </p>
    </div>
  );
}

function MiniVisual({ kind, tone }: { kind: string; tone: InvestmentTone }) {
  if (kind === "dots") {
    return (
      <span className={miniDotsClass}>
        {[0, 1, 2, 3].map((dot) => (
          <span className={cx(dotClass, toneBgClass[tone])} key={dot} />
        ))}
      </span>
    );
  }

  if (kind === "bars") {
    return (
      <span className={miniBarsClass}>
        {[18, 28, 38, 48].map((height) => (
          <span
            className={cx(barClass, toneBgClass[tone])}
            key={height}
            style={{ height }}
          />
        ))}
      </span>
    );
  }

  if (kind === "gauge") {
    return (
      <span className={gaugeClass}>
        <span className={cx(gaugeFillClass, toneBgClass[tone])} />
        <span className={cx(gaugeKnobClass, toneBgClass[tone])} />
      </span>
    );
  }

  return (
    <span className={miniLineClass}>
      {[0, 1, 2, 3].map((dot) => (
        <span
          className={cx(lineDotClass, toneBgClass[tone])}
          key={dot}
          style={{ transform: `translateY(${dot % 2 === 0 ? 8 : 0}px)` }}
        />
      ))}
    </span>
  );
}

const tableClass = css({
  borderCollapse: "collapse",
  color: "investment-text",
  fontSize: "sm",
  minW: "720px",
  w: "full",
});

const headerCellClass = css({
  borderBottom: "1px solid token(colors.investment-border)",
  color: "investment-muted",
  fontSize: "xs",
  fontWeight: "800",
  pb: "3",
  px: "3",
  textAlign: "left",
  whiteSpace: "nowrap",
});

const rowClass = css({
  borderBottom: "1px solid token(colors.investment-border-soft)",
});

const bodyCellClass = css({
  fontWeight: "800",
  px: "3",
  py: "3",
  verticalAlign: "middle",
  whiteSpace: "nowrap",
});

const metricCellClass = cx(
  bodyCellClass,
  css({
    alignItems: "center",
    display: "flex",
    gap: "3",
    minW: "150px",
  }),
);

const indexClass = css({
  alignItems: "center",
  border: "2px solid currentColor",
  borderRadius: "999px",
  display: "inline-flex",
  flexShrink: 0,
  fontSize: "xs",
  fontWeight: "900",
  h: "6",
  justifyContent: "center",
  w: "6",
});

const detailCellClass = cx(
  bodyCellClass,
  css({
    color: "investment-muted",
    lineHeight: "1.45",
    minW: "210px",
    whiteSpace: "normal",
  }),
);

const visualCellClass = cx(bodyCellClass, css({ minW: "92px" }));

const miniBarsClass = css({
  alignItems: "end",
  display: "inline-grid",
  gap: "2",
  gridTemplateColumns: "repeat(4, 8px)",
  h: "48px",
});

const barClass = css({
  borderRadius: "2px 2px 0 0",
  display: "block",
  opacity: 0.65,
  w: "8px",
});

const miniDotsClass = css({
  alignItems: "center",
  display: "inline-flex",
  gap: "2",
});

const dotClass = css({
  borderRadius: "999px",
  display: "block",
  h: "8px",
  w: "8px",
});

const miniLineClass = css({
  alignItems: "center",
  display: "inline-flex",
  gap: "3",
  minH: "34px",
});

const lineDotClass = css({
  borderRadius: "999px",
  display: "block",
  h: "7px",
  w: "7px",
});

const gaugeClass = css({
  bg: "#e9eef6",
  borderRadius: "999px",
  display: "inline-block",
  h: "8px",
  position: "relative",
  w: "72px",
});

const gaugeFillClass = css({
  borderRadius: "999px",
  display: "block",
  h: "full",
  w: "70%",
});

const gaugeKnobClass = css({
  border: "2px solid white",
  borderRadius: "999px",
  boxShadow: "0 0 0 1px rgba(15, 23, 42, 0.08)",
  display: "block",
  h: "12px",
  left: "66%",
  position: "absolute",
  top: "-2px",
  w: "12px",
});

const toneTextClass: Record<InvestmentTone, string> = {
  safe: css({ color: "investment-green" }),
  good: css({ color: "investment-green" }),
  watch: css({ color: "investment-orange" }),
  warning: css({ color: "investment-orange" }),
  danger: css({ color: "investment-red" }),
  neutral: css({ color: "investment-blue" }),
};

const toneBgClass: Record<InvestmentTone, string> = {
  safe: css({ bg: "investment-green" }),
  good: css({ bg: "investment-green" }),
  watch: css({ bg: "investment-orange" }),
  warning: css({ bg: "investment-orange" }),
  danger: css({ bg: "investment-red" }),
  neutral: css({ bg: "investment-blue" }),
};

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
  if (ratio >= 0.85) {
    return "満点";
  }

  if (ratio >= 0.7) {
    return "良好";
  }

  if (ratio >= 0.45) {
    return "注意";
  }

  return "要確認";
}

function getScoreTone(score: number | null, maxScore: number): InvestmentTone {
  if (score === null) {
    return "neutral";
  }

  const ratio = score / maxScore;
  if (ratio >= 0.7) {
    return "safe";
  }

  if (ratio >= 0.45) {
    return "warning";
  }

  return "danger";
}
