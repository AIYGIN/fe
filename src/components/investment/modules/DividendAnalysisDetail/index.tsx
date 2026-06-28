import {
  MetricCard,
  ScoreCard,
  StatusBadge,
  WarningCard,
} from "@/components/investment";
import type { DividendAnalysisDetail as DividendAnalysisDetailData } from "@/hooks/dividendAnalysis";

import { css } from "../../../../../styled-system/css";
import { DividendMetricDetailTable } from "../DividendMetricDetailTable";
import { InvestmentDonutChart } from "../InvestmentDonutChart";

type DividendAnalysisDetailProps = {
  detail: DividendAnalysisDetailData | null;
  loading?: boolean;
};

export function DividendAnalysisDetail({
  detail,
  loading,
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
      <div
        className={css({
          alignItems: "start",
          display: "grid",
          gap: "4",
          gridTemplateColumns: { base: "1fr", md: "auto minmax(0, 1fr)" },
        })}
      >
        <ScoreCard score={Math.round(detail.totalScore)} />
        <InvestmentDonutChart items={toDonutItems(detail)} label="スコア内訳" />
        <div className={css({ minW: 0 })}>
          <h2
            className={css({
              color: "investment-text",
              fontSize: "xl",
              fontWeight: "900",
              lineHeight: "1.35",
              m: 0,
              overflowWrap: "anywhere",
            })}
          >
            {detail.companyName}
          </h2>
          <p
            className={css({
              color: "investment-muted",
              fontSize: "sm",
              fontWeight: "700",
              mt: "1",
            })}
          >
            選択銘柄詳細
          </p>
          <div
            className={css({
              alignItems: "center",
              display: "flex",
              flexWrap: "wrap",
              gap: "2",
              mt: "3",
            })}
          >
            <StatusBadge tone={toTone(detail.safetyLabel)}>
              {detail.judgement}
            </StatusBadge>
            <span
              className={css({
                color: "investment-muted",
                fontSize: "sm",
                fontWeight: "700",
              })}
            >
              {detail.symbolId} / {detail.sector}
            </span>
          </div>
          <p
            className={css({
              color: "investment-muted",
              fontSize: "sm",
              fontWeight: "700",
              mt: "4",
            })}
          >
            AI要約は準備中です
          </p>
        </div>
      </div>
      <div
        className={css({
          display: "grid",
          gap: "3",
          gridTemplateColumns: { base: "1fr", md: "repeat(3, minmax(0, 1fr))" },
        })}
      >
        <MetricCard
          label="配当性向"
          value={`${formatNumber(detail.metrics.payoutRatio)}%`}
        />
        <MetricCard
          label="10年増配率"
          value={`${formatNumber(detail.metrics.dividendGrowthRate10y)}%`}
        />
        <MetricCard label="データ基準日" value={detail.dataAsOfDate} />
      </div>
      {detail.isFcfNotApplicable ? (
        <WarningCard title="FCFの扱い">
          金融業のためFCFはこの項目の評価対象外です
        </WarningCard>
      ) : null}
      <DividendMetricDetailTable
        metrics={detail.metrics}
        scoreBreakdown={detail.scoreBreakdown}
      />
    </div>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("ja-JP", {
    maximumFractionDigits: 1,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
  }).format(value);
}

function toDonutItems(detail: DividendAnalysisDetailData) {
  const entries = [
    ["FCF", detail.scoreBreakdown.fcf.score ?? 0, "#2563eb"],
    ["減配履歴", detail.scoreBreakdown.dividendCutHistory.score, "#059669"],
    ["増配率", detail.scoreBreakdown.dividendGrowth.score, "#f59e0b"],
    ["配当性向", detail.scoreBreakdown.payoutRatio.score, "#7c3aed"],
    ["利回り", detail.scoreBreakdown.dividendYield.score, "#dc2626"],
    ["財務指標", detail.scoreBreakdown.financialMetrics.score, "#0891b2"],
  ] as const;
  const total = entries.reduce((sum, [, score]) => sum + score, 0);

  return entries.map(([name, score, color]) => ({
    name,
    color,
    ratio: total > 0 ? (score / total) * 100 : 0,
  }));
}

function toTone(label: DividendAnalysisDetailData["safetyLabel"]) {
  if (label === "safe") {
    return "safe";
  }

  if (label === "neutral") {
    return "watch";
  }

  return "warning";
}
