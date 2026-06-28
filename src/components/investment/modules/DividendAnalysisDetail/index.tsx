import { StatusBadge } from "@/components/investment";
import type { DividendAnalysisDetail as DividendAnalysisDetailData } from "@/hooks/dividendAnalysis";

import { css, cx } from "../../../../../styled-system/css";
import { DividendMetricDetailTable } from "../DividendMetricDetailTable";
import { InvestmentDonutChart } from "../InvestmentDonutChart";
import styles from "./styles.module.css";

type DividendAnalysisDetailProps = {
  detail: DividendAnalysisDetailData | null;
  loading?: boolean;
  showHeading?: boolean;
};

export function DividendAnalysisDetail({
  detail,
  loading,
  showHeading = true,
}: DividendAnalysisDetailProps) {
  if (loading) {
    return (
      <p className={css({ color: "investment-muted", fontWeight: "700" })}>
        詳細データを読み込んでいます
      </p>
    );
  }

  if (!detail) {
    return (
      <p className={css({ color: "investment-muted", fontWeight: "700" })}>
        銘柄を選択すると詳細を表示します
      </p>
    );
  }

  return (
    <div className={css({ display: "grid", gap: "4" })}>
      {showHeading ? (
        <div className={css({ minW: 0 })}>
          <h2 className={companyHeadingClass}>{detail.companyName}</h2>
          <p className={companySubTextClass}>
            {detail.symbolId} / {detail.sector}
          </p>
        </div>
      ) : null}
      <div className={styles.detailBody}>
        <ScoreSummaryCard detail={detail} />
        <DividendMetricDetailTable
          metrics={detail.metrics}
          scoreBreakdown={detail.scoreBreakdown}
        />
      </div>
    </div>
  );
}

function ScoreSummaryCard({ detail }: { detail: DividendAnalysisDetailData }) {
  const tone = toTone(detail.safetyLabel);

  return (
    <section className={scoreCardClass} aria-label="配当安全性スコア">
      <h3 className={sectionTitleClass}>配当安全性スコア</h3>
      <p className={styles.scoreValueRow}>
        <span className={cx(scoreValueClass, toneTextClass[tone])}>
          {Math.round(detail.totalScore)}
        </span>
        <span
          className={css({
            color: "investment-muted",
            fontSize: "2xl",
            fontWeight: "800",
          })}
        >
          /100
        </span>
      </p>
      <StatusBadge tone={tone}>{detail.judgement}</StatusBadge>
      <div className={styles.breakdown}>
        <h4 className={sectionTitleClass}>スコア内訳</h4>
        <div className={styles.breakdownBody}>
          <div className={styles.chartScale}>
            <InvestmentDonutChart
              items={toDonutItems(detail)}
              label="スコア内訳"
            />
          </div>
          <dl className={styles.legend}>
            {toDonutItems(detail).map((item) => (
              <div className={styles.legendRow} key={item.name}>
                <span
                  className={styles.legendSwatch}
                  style={{ backgroundColor: item.color }}
                />
                <dt className={legendLabelClass}>{item.name}</dt>
                <dd className={legendValueClass}>
                  {formatNumber(item.weight)}%
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

const scoreCardClass = styles.scoreCard;

const companyHeadingClass = css({
  color: "investment-text",
  fontSize: "xl",
  fontWeight: "900",
  lineHeight: "1.35",
  m: 0,
  overflowWrap: "anywhere",
});

const companySubTextClass = css({
  color: "investment-muted",
  fontSize: "sm",
  fontWeight: "800",
  mt: "1",
});

const sectionTitleClass = css({
  color: "investment-text",
  fontSize: "sm",
  fontWeight: "900",
  lineHeight: "1.35",
  m: 0,
});

const scoreValueClass = css({
  fontSize: "5xl",
  fontWeight: "900",
  letterSpacing: "0",
  lineHeight: 1,
});

const legendLabelClass = css({
  color: "investment-muted",
  fontSize: "xs",
  fontWeight: "800",
});

const legendValueClass = css({
  color: "investment-text",
  fontSize: "xs",
  fontWeight: "900",
  m: 0,
});

const toneTextClass = {
  safe: css({ color: "investment-green" }),
  watch: css({ color: "investment-orange" }),
  danger: css({ color: "investment-red" }),
} as const;

function formatNumber(value: number) {
  return new Intl.NumberFormat("ja-JP", {
    maximumFractionDigits: 1,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
  }).format(value);
}

function toDonutItems(detail: DividendAnalysisDetailData) {
  const entries = [
    [
      "FCF",
      detail.scoreBreakdown.fcf.score ?? 0,
      detail.scoreBreakdown.fcf.maxScore,
      "#22c55e",
    ],
    [
      "減配履歴",
      detail.scoreBreakdown.dividendCutHistory.score,
      detail.scoreBreakdown.dividendCutHistory.maxScore,
      "#16a34a",
    ],
    [
      "増配率",
      detail.scoreBreakdown.dividendGrowth.score,
      detail.scoreBreakdown.dividendGrowth.maxScore,
      "#f59e0b",
    ],
    [
      "配当性向",
      detail.scoreBreakdown.dividendYield.score,
      detail.scoreBreakdown.dividendYield.maxScore,
      "#8b5cf6",
    ],
    [
      "利回り",
      detail.scoreBreakdown.payoutRatio.score,
      detail.scoreBreakdown.payoutRatio.maxScore,
      "#60a5fa",
    ],
    [
      "財務指標",
      detail.scoreBreakdown.financialMetrics.score,
      detail.scoreBreakdown.financialMetrics.maxScore,
      "#ef4444",
    ],
  ] as const;
  const total = entries.reduce((sum, [, score]) => sum + score, 0);

  return entries.map(([name, score, maxScore, color]) => ({
    name,
    color,
    ratio: total > 0 ? (score / total) * 100 : 0,
    weight: maxScore,
  }));
}

function toTone(label: DividendAnalysisDetailData["safetyLabel"]) {
  if (label === "safe") {
    return "safe";
  }

  if (label === "neutral") {
    return "watch";
  }

  return "danger";
}
