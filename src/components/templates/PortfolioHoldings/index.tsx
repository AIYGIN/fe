"use client";

import { useEffect } from "react";

import type { PortfolioRequestStatus } from "@/hooks/portfolio/usePortfolio";
import { usePortfolio } from "@/hooks/portfolio/usePortfolio";
import type { PortfolioData } from "@/lib/pages/portfolio/holdings";
import { PortfolioStoreProvider } from "@/stores/portfolio/provider";

import { css } from "../../../../styled-system/css";
import { InvestmentPanel } from "../../investment/modules/InvestmentPanel";
import { InvestmentRatioBar } from "../../investment/modules/InvestmentRatioBar";
import { PortfolioAiSummarySection } from "../../investment/modules/PortfolioAiSummarySection";
import { PortfolioBrokerLinkSection } from "../../investment/modules/PortfolioBrokerLinkSection";
import { PortfolioConstituentsSection } from "../../investment/modules/PortfolioConstituentsSection";
import { PortfolioHeader } from "../../investment/modules/PortfolioHeader";
import { PortfolioHoldingsSection } from "../../investment/modules/PortfolioHoldingsSection";
import { PortfolioRatioBreakdownSection } from "../../investment/modules/PortfolioRatioBreakdownSection";

export type PortfolioHoldingsViewState = {
  holdingsStatus: PortfolioRequestStatus;
  analysisStatus: PortfolioRequestStatus;
  data: PortfolioData | null;
  error: string | null;
};

export type PortfolioHoldingsTemplateProps = {
  state: PortfolioHoldingsViewState;
  externalLinkUrl?: string;
  brokerLinkUrl?: string;
  onRetry?: () => void;
};

export function PortfolioHoldingsPage() {
  return (
    <PortfolioStoreProvider>
      <PortfolioHoldingsPageContent />
    </PortfolioStoreProvider>
  );
}

function PortfolioHoldingsPageContent() {
  const portfolio = usePortfolio();
  const load = usePortfolio((state) => state.load);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <PortfolioHoldingsTemplate onRetry={portfolio.load} state={portfolio} />
  );
}

export function PortfolioHoldingsTemplate({
  state,
  externalLinkUrl = "https://site.sbisec.co.jp/account/nisa/portfolio",
  brokerLinkUrl,
  onRetry,
}: PortfolioHoldingsTemplateProps) {
  const linkUrl = brokerLinkUrl ?? externalLinkUrl;
  const isHoldingsLoading = state.holdingsStatus === "loading";
  const isAnalysisLoading = state.analysisStatus === "loading";
  const lastUpdated =
    state.data?.lastUpdated.analysis || state.data?.lastUpdated.holdings;

  return (
    <main
      aria-label="portfolio holdings"
      className={pageClass}
      style={{ padding: "clamp(18px, 2.7vw, 32px)" }}
    >
      <PortfolioHeader lastUpdated={lastUpdated} onRefresh={onRetry} />

      {isHoldingsLoading ? (
        <StatusPanel message="保有商品を読み込み中です" />
      ) : null}

      {state.holdingsStatus === "not-found" ? (
        <StatusPanel
          message="ポートフォリオが見つかりません"
          subMessage="保有商品はまだありません"
        />
      ) : null}

      {state.holdingsStatus === "error" ? (
        <StatusPanel
          message="ポートフォリオを取得できませんでした"
          onRetry={onRetry}
          subMessage={state.error ?? "時間をおいてもう一度お試しください。"}
        />
      ) : null}

      {state.data ? (
        <>
          <div className={topGridClass}>
            <PortfolioHoldingsSection holdings={state.data.holdings} />
            <PortfolioBrokerLinkSection linkUrl={linkUrl} />
          </div>

          <div className={middleGridClass}>
            <PortfolioRatioBreakdownSection
              items={state.data.analysis.sectorAllocations ?? []}
              title="セクター比率（全体）"
            />
            <PortfolioConstituentsSection
              items={state.data.analysis.constituents ?? []}
            />
            <PortfolioRatioBreakdownSection
              items={state.data.analysis.countryAllocations ?? []}
              title="国・地域別比率（全体）"
            />
          </div>

          <div className={bottomGridClass}>
            <BiasCheckSection data={state.data} />
            <PortfolioAiSummarySection isLoading={isAnalysisLoading} />
          </div>

          <DataNote />
        </>
      ) : null}
    </main>
  );
}

function StatusPanel({
  message,
  subMessage,
  onRetry,
}: {
  message: string;
  subMessage?: string;
  onRetry?: () => void;
}) {
  return (
    <InvestmentPanel>
      <div className={statusClass} role={onRetry ? "alert" : "status"}>
        <h2>{message}</h2>
        {subMessage ? <p>{subMessage}</p> : null}
        {onRetry ? (
          <button className={retryButtonClass} onClick={onRetry} type="button">
            再試行
          </button>
        ) : null}
      </div>
    </InvestmentPanel>
  );
}

function BiasCheckSection({ data }: { data: PortfolioData }) {
  const countryTop = data.analysis.countryAllocations?.[0];
  const sectorTop = data.analysis.sectorAllocations?.[0];
  const holdingTop = data.holdings[0];
  const checks = [
    {
      label: `${countryTop?.name ?? "主要国"}比率`,
      ratio: countryTop?.ratio ?? 0,
      target: "目安：50%以下",
      result: (countryTop?.ratio ?? 0) > 50 ? "やや高め" : "適正範囲内",
      tone: (countryTop?.ratio ?? 0) > 50 ? "amber" : "green",
    },
    {
      label: `${sectorTop?.name ?? "主要セクター"}比率`,
      ratio: sectorTop?.ratio ?? 0,
      target: "目安：20%前後",
      result: (sectorTop?.ratio ?? 0) > 20 ? "やや高め" : "適正範囲内",
      tone: (sectorTop?.ratio ?? 0) > 20 ? "amber" : "green",
    },
    {
      label: `高配当比率（${holdingTop?.productName ?? "保有商品"}系）`,
      ratio: holdingTop?.ratio ?? 0,
      target: "目安：20〜30%",
      result:
        (holdingTop?.ratio ?? 0) >= 20 && (holdingTop?.ratio ?? 0) <= 30
          ? "適正範囲内"
          : "要確認",
      tone:
        (holdingTop?.ratio ?? 0) >= 20 && (holdingTop?.ratio ?? 0) <= 30
          ? "green"
          : "amber",
    },
    {
      label: "新興国比率",
      ratio:
        data.analysis.countryAllocations?.find((item) =>
          item.name.includes("新興"),
        )?.ratio ?? 0,
      target: "目安：5〜20%",
      result: "適正範囲内",
      tone: "green",
    },
    {
      label: "債券比率",
      ratio: 0,
      target: "目安：必要に応じて検討",
      result: "未保有",
      tone: "gray",
    },
  ] as const;

  return (
    <InvestmentPanel
      className={biasPanelClass}
      title="偏りチェック（自動判定）"
    >
      <div className={biasTableClass}>
        <div className={biasHeadClass}>
          <span />
          <span>倍持</span>
          <span>許容範囲内</span>
          <span>概要</span>
          <span />
        </div>
        {checks.map((check) => (
          <div className={biasRowClass} key={check.label}>
            <span className={statusIconClass} data-tone={check.tone}>
              {check.tone === "green" ? "✓" : check.tone === "gray" ? "−" : "△"}
            </span>
            <strong>{check.label}</strong>
            <span className={biasValueClass}>{formatPercent(check.ratio)}</span>
            <span>{check.target}</span>
            <span>{check.result}</span>
            <InvestmentRatioBar tone={check.tone} value={check.ratio} />
          </div>
        ))}
      </div>
      <div className={infoClass}>
        <strong>i</strong>
        <p>
          偏りチェックは一般的な考え方に基づく目安です。
          <br />
          最終的な投資判断はご自身の方針に基づいて行ってください。
        </p>
      </div>
    </InvestmentPanel>
  );
}

function DataNote() {
  return (
    <section className={dataNoteClass} style={{ padding: "18px 22px" }}>
      <div className={dataTextClass}>
        <strong>i</strong>
        <div>
          <h2>データについて</h2>
          <p>
            本画面のデータは、各ETFの公開情報をもとに算出しています。
            <br />
            構成銘柄・比率は日々変動するため、実際の数値と異なる場合があります。
          </p>
        </div>
      </div>
    </section>
  );
}

function formatPercent(value: number): string {
  return `${value.toFixed(value % 1 === 0 ? 0 : 1)}%`;
}

const pageClass = css({
  bg: "#f8fafc",
  color: "#111827",
  display: "grid",
  gap: "16px",
  minH: "100%",
  padding: { base: "18px", md: "32px" },
});

const topGridClass = css({
  display: "grid",
  gap: "16px",
  gridTemplateColumns: {
    base: "1fr",
    lg: "minmax(0, 1.65fr) minmax(320px, 1fr)",
  },
  mb: "16px",
});

const middleGridClass = css({
  display: "grid",
  gap: "16px",
  gridTemplateColumns: { base: "1fr", lg: "repeat(3, minmax(0, 1fr))" },
  mb: "16px",
});

const bottomGridClass = css({
  display: "grid",
  gap: "16px",
  gridTemplateColumns: {
    base: "1fr",
    lg: "minmax(0, 1.55fr) minmax(340px, 1fr)",
  },
  mb: "16px",
});

const statusClass = css({
  alignItems: "flex-start",
  display: "flex",
  flexDir: "column",
  gap: "12px",
  "& h2": {
    color: "#111827",
    fontSize: "18px",
    fontWeight: 800,
    m: 0,
  },
  "& p": {
    color: "#64748b",
    fontSize: "14px",
    fontWeight: 600,
    m: 0,
  },
});

const retryButtonClass = css({
  bg: "#1268df",
  border: 0,
  borderRadius: "6px",
  color: "white",
  cursor: "pointer",
  fontWeight: 800,
  mt: "4px",
  px: "16px",
  py: "10px",
});

const biasPanelClass = css({
  minH: "420px",
});

const biasTableClass = css({
  display: "grid",
});

const biasHeadClass = css({
  borderBottom: "1px solid",
  borderColor: "#dbe3ef",
  color: "#64748b",
  display: "grid",
  fontSize: "12px",
  fontWeight: 800,
  gridTemplateColumns:
    "24px minmax(120px, 1fr) 78px minmax(120px, 1fr) 92px 90px",
  pb: "10px",
});

const biasRowClass = css({
  alignItems: "center",
  borderBottom: "1px solid",
  borderColor: "#e5eaf2",
  color: "#111827",
  display: "grid",
  fontSize: "13px",
  fontWeight: 700,
  gap: "12px",
  gridTemplateColumns: {
    base: "24px minmax(0, 1fr) 70px",
    md: "24px minmax(120px, 1fr) 78px minmax(120px, 1fr) 92px 90px",
  },
  minH: "48px",
  py: "8px",
  "& > span:nth-of-type(3), & > span:nth-of-type(4)": {
    display: { base: "none", md: "block" },
  },
  "& > span:nth-of-type(4)": {
    color: "#334155",
  },
  "& > span:last-child": {
    display: { base: "none", md: "block" },
  },
});

const statusIconClass = css({
  alignItems: "center",
  borderRadius: "999px",
  color: "white",
  display: "inline-flex",
  fontSize: "13px",
  fontWeight: 900,
  h: "18px",
  justifyContent: "center",
  w: "18px",
  "&[data-tone='amber']": { bg: "#f59e0b" },
  "&[data-tone='green']": { bg: "#43bf73" },
  "&[data-tone='gray']": { bg: "#94a3b8" },
});

const biasValueClass = css({
  fontVariantNumeric: "tabular-nums",
  fontWeight: 900,
});

const infoClass = css({
  alignItems: "flex-start",
  bg: "#eaf4ff",
  borderRadius: "6px",
  color: "#1268df",
  display: "flex",
  gap: "12px",
  mt: "18px",
  px: "16px",
  py: "12px",
  "& strong": {
    alignItems: "center",
    border: "1px solid",
    borderColor: "#1268df",
    borderRadius: "999px",
    display: "inline-flex",
    flexShrink: 0,
    fontSize: "12px",
    h: "18px",
    justifyContent: "center",
    w: "18px",
  },
  "& p": {
    fontSize: "13px",
    fontWeight: 700,
    lineHeight: 1.65,
    m: 0,
  },
});

const dataNoteClass = css({
  alignItems: { base: "flex-start", md: "center" },
  bg: "#f1f7ff",
  border: "1px solid",
  borderColor: "#bfdbfe",
  borderRadius: "8px",
  display: "flex",
  flexDir: { base: "column", md: "row" },
  gap: "18px",
  justifyContent: "space-between",
  padding: "18px 22px",
});

const dataTextClass = css({
  alignItems: "flex-start",
  color: "#0f172a",
  display: "flex",
  gap: "12px",
  "& strong": {
    alignItems: "center",
    border: "1px solid",
    borderColor: "#1268df",
    borderRadius: "999px",
    color: "#1268df",
    display: "inline-flex",
    flexShrink: 0,
    fontSize: "12px",
    h: "18px",
    justifyContent: "center",
    mt: "2px",
    w: "18px",
  },
  "& h2": {
    fontSize: "14px",
    fontWeight: 900,
    lineHeight: 1.4,
    m: 0,
  },
  "& p": {
    color: "#475569",
    fontSize: "12px",
    fontWeight: 700,
    lineHeight: 1.65,
    m: "8px 0 0",
  },
});
