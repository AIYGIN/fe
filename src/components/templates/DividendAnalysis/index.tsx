"use client";

import { useEffect, useState } from "react";

import {
  type DividendAnalysisDetail as DividendAnalysisDetailData,
  type DividendAnalysisOverview,
  type DividendAnalysisRequestStatus,
  type DividendEnterprise,
  useDividendAnalysis,
} from "@/hooks/dividendAnalysis";
import { DividendAnalysisStoreProvider } from "@/stores/dividendAnalysis/provider";

import { css } from "../../../../styled-system/css";
import { InvestmentButton, MetricCard, SideNavigation } from "../../investment";
import { DividendAnalysisDetail } from "../../investment/modules/DividendAnalysisDetail";
import { DividendAnalysisRuleDialog } from "../../investment/modules/DividendAnalysisRuleDialog";
import { DividendAnalysisTable } from "../../investment/modules/DividendAnalysisTable";
import { DividendDisclaimer } from "../../investment/modules/DividendDisclaimer";
import { InvestmentPanel } from "../../investment/modules/InvestmentPanel";

type DividendAnalysisPageProps = {
  autoLoad?: boolean;
};

export type DividendAnalysisTemplateProps = {
  detail: DividendAnalysisDetailData | null;
  detailStatus: DividendAnalysisRequestStatus;
  enterprises: DividendEnterprise[];
  error: string | null;
  onRetry: () => void;
  onSelectSymbol: (symbolId: string) => void;
  overview: DividendAnalysisOverview | null;
  selectedSymbolId: string | null;
  status: DividendAnalysisRequestStatus;
};

export function DividendAnalysisPage({
  autoLoad = true,
}: DividendAnalysisPageProps) {
  return (
    <DividendAnalysisStoreProvider>
      <DividendAnalysisPageContent autoLoad={autoLoad} />
    </DividendAnalysisStoreProvider>
  );
}

function DividendAnalysisPageContent({
  autoLoad,
}: Required<DividendAnalysisPageProps>) {
  const detail = useDividendAnalysis((state) => state.detail);
  const detailStatus = useDividendAnalysis((state) => state.detailStatus);
  const error = useDividendAnalysis((state) => state.error);
  const load = useDividendAnalysis((state) => state.load);
  const retry = useDividendAnalysis((state) => state.retry);
  const overview = useDividendAnalysis((state) => state.overview);
  const overviewStatus = useDividendAnalysis((state) => state.overviewStatus);
  const selectEnterprise = useDividendAnalysis(
    (state) => state.selectEnterprise,
  );
  const selectedSymbolId = useDividendAnalysis(
    (state) => state.selectedSymbolId,
  );

  useEffect(() => {
    if (autoLoad) {
      void load();
    }
  }, [autoLoad, load]);

  return (
    <DividendAnalysisTemplate
      detail={detail}
      detailStatus={detailStatus}
      enterprises={overview?.enterprises ?? []}
      error={error}
      onRetry={() => void retry()}
      onSelectSymbol={(symbolId) => void selectEnterprise(symbolId)}
      overview={overview}
      selectedSymbolId={selectedSymbolId}
      status={overviewStatus}
    />
  );
}

export function DividendAnalysisTemplate({
  detail,
  detailStatus,
  enterprises,
  error,
  onRetry,
  onSelectSymbol,
  overview,
  selectedSymbolId,
  status,
}: DividendAnalysisTemplateProps) {
  const [ruleOpen, setRuleOpen] = useState(false);
  const isLoading = status === "loading";
  const isError = status === "error";
  const isEmpty = status === "empty";

  return (
    <div
      className={css({
        bg: "#f4f7fb",
        color: "investment-text",
        display: "flex",
        minH: "100vh",
      })}
    >
      <div className={css({ display: { base: "none", lg: "block" } })}>
        <SideNavigation currentHref="/dividend" />
      </div>
      <main
        className={css({
          display: "grid",
          gap: "5",
          maxW: "7xl",
          mx: "auto",
          p: { base: "4", md: "6" },
          w: "full",
        })}
      >
        <header
          className={css({
            alignItems: { base: "stretch", md: "center" },
            display: "flex",
            flexDirection: { base: "column", md: "row" },
            gap: "4",
            justifyContent: "space-between",
          })}
        >
          <div>
            <h1
              className={css({
                color: "investment-text",
                fontSize: { base: "2xl", md: "3xl" },
                fontWeight: "900",
                letterSpacing: "0",
                lineHeight: "1.2",
                m: 0,
              })}
            >
              高配当分析
            </h1>
            <p
              className={css({
                color: "investment-muted",
                fontSize: "sm",
                fontWeight: "700",
                mt: "2",
              })}
            >
              保存済みデータをもとにした参考スコアを確認できます
            </p>
          </div>
          <InvestmentButton
            onClick={() => setRuleOpen(true)}
            variant="secondary"
          >
            ルール
          </InvestmentButton>
        </header>

        {isError ? (
          <InvestmentPanel>
            <div
              className={css({
                alignItems: "center",
                display: "flex",
                flexWrap: "wrap",
                gap: "4",
                justifyContent: "space-between",
              })}
              role="alert"
            >
              <p className={css({ fontWeight: "800" })}>
                {error ?? "高配当分析データを取得できませんでした"}
              </p>
              <InvestmentButton onClick={onRetry} variant="secondary">
                再試行
              </InvestmentButton>
            </div>
          </InvestmentPanel>
        ) : null}

        {isLoading ? (
          <InvestmentPanel>
            <p
              className={css({ color: "investment-muted", fontWeight: "800" })}
            >
              分析データを読み込んでいます
            </p>
          </InvestmentPanel>
        ) : null}

        {!isError && !isLoading ? (
          <>
            <section
              className={css({
                display: "grid",
                gap: "4",
                gridTemplateColumns: {
                  base: "1fr",
                  md: "repeat(3, minmax(0, 1fr))",
                },
              })}
            >
              <MetricCard
                label="表示銘柄"
                value={`${enterprises.length}銘柄`}
              />
              <MetricCard
                label="データ更新"
                value={overview ? formatDateTime(overview.updatedAt) : "-"}
                subText={
                  overview
                    ? `データ更新: ${formatDateTime(overview.updatedAt)}`
                    : undefined
                }
              />
              <MetricCard
                label="データ基準日"
                value={overview?.dataAsOfDate ?? "-"}
                subText={
                  overview
                    ? `データ基準日: ${overview.dataAsOfDate}`
                    : undefined
                }
              />
            </section>

            <div
              className={css({
                alignItems: "start",
                display: "grid",
                gap: "5",
                gridTemplateColumns: {
                  base: "1fr",
                  xl: "minmax(0, 0.95fr) minmax(0, 1.05fr)",
                },
              })}
            >
              <InvestmentPanel
                description="総合スコアの高い順に表示しています"
                title="銘柄一覧"
              >
                {isEmpty ? (
                  <p
                    className={css({
                      color: "investment-muted",
                      fontWeight: "800",
                    })}
                  >
                    表示できる銘柄はありません
                  </p>
                ) : (
                  <DividendAnalysisTable
                    enterprises={enterprises}
                    onSelectSymbol={onSelectSymbol}
                    selectedSymbolId={selectedSymbolId}
                  />
                )}
              </InvestmentPanel>
              <InvestmentPanel title="分析詳細">
                {detailStatus === "error" ? (
                  <div
                    className={css({
                      alignItems: "center",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "4",
                      justifyContent: "space-between",
                    })}
                    role="alert"
                  >
                    <p className={css({ fontWeight: "800" })}>
                      {error ?? "詳細データを取得できませんでした"}
                    </p>
                    <InvestmentButton onClick={onRetry} variant="secondary">
                      再試行
                    </InvestmentButton>
                  </div>
                ) : (
                  <DividendAnalysisDetail
                    detail={detail}
                    loading={detailStatus === "loading"}
                  />
                )}
              </InvestmentPanel>
            </div>

            {overview ? (
              <DividendDisclaimer
                dataAsOfDate={overview.dataAsOfDate}
                disclaimers={overview.disclaimers}
                isRealtime={overview.isRealtime}
                updatedAt={overview.updatedAt}
              />
            ) : null}
          </>
        ) : null}
      </main>
      <DividendAnalysisRuleDialog onOpenChange={setRuleOpen} open={ruleOpen} />
    </div>
  );
}

function formatDateTime(value: string) {
  return value.slice(0, 16).replace("T", " ");
}
