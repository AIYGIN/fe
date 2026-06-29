"use client";

import { type ReactNode, useEffect, useState } from "react";

import {
  type DividendAnalysisDetail as DividendAnalysisDetailData,
  type DividendAnalysisOverview,
  type DividendAnalysisRequestStatus,
  type DividendEnterprise,
  useDividendAnalysis,
} from "@/hooks/dividendAnalysis";
import { DividendAnalysisStoreProvider } from "@/stores/dividendAnalysis/provider";

import { css, cx } from "../../../../styled-system/css";
import { InvestmentButton } from "../../investment";
import { DividendAnalysisDetail } from "../../investment/modules/DividendAnalysisDetail";
import { DividendAnalysisRuleDialog } from "../../investment/modules/DividendAnalysisRuleDialog";
import { DividendAnalysisTable } from "../../investment/modules/DividendAnalysisTable";
import { DividendDisclaimer } from "../../investment/modules/DividendDisclaimer";

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
  const [stickySymbolId, setStickySymbolId] = useState<string | null>(null);
  const isLoading = status === "loading";
  const isError = status === "error";
  const isEmpty = status === "empty";

  const isDetailSticky =
    selectedSymbolId !== null && selectedSymbolId === stickySymbolId;

  const handleSelectSymbol = (symbolId: string) => {
    setStickySymbolId((current) => {
      if (current === symbolId) {
        return null;
      }

      return symbolId;
    });

    if (selectedSymbolId !== symbolId) {
      onSelectSymbol(symbolId);
    }
  };

  return (
    <div className={pageClass}>
      <main
        className={cx(
          mainClass,
          isDetailSticky ? stickyContentPaddingClass : undefined,
        )}
      >
        <header className={headerClass}>
          <div>
            <h1 className={titleClass}>高配当分析</h1>
            <p className={leadClass}>
              高配当株の安全性をスコアと各指標から総合的に分析します
            </p>
          </div>
          <div className={headerActionsClass}>
            <p className={updatedAtClass}>
              最終更新: {overview ? formatDateTime(overview.updatedAt) : "-"}
              <span className={refreshIconClass} aria-hidden="true" />
            </p>
            <InvestmentButton
              className={ruleButtonClass}
              onClick={() => setRuleOpen(true)}
              variant="secondary"
            >
              <span className={infoIconClass} aria-hidden="true">
                i
              </span>
              分析ルールについて
            </InvestmentButton>
          </div>
        </header>

        {isError ? (
          <Panel>
            <div className={alertClass} role="alert">
              <p>{error ?? "高配当分析データを取得できませんでした"}</p>
              <InvestmentButton onClick={onRetry} variant="secondary">
                再試行
              </InvestmentButton>
            </div>
          </Panel>
        ) : null}

        {isLoading ? (
          <Panel>
            <p className={loadingClass}>分析データを読み込んでいます</p>
          </Panel>
        ) : null}

        {!isError && !isLoading ? (
          <>
            <Panel
              description="※ スコアは各項目の配点に基づく合計点（100点満点）です"
              title="銘柄一覧（スコア順）"
            >
              {overview ? (
                <div className={srOnlyClass}>
                  <span>{enterprises.length}銘柄</span>
                  <span>データ更新: {formatDateTime(overview.updatedAt)}</span>
                </div>
              ) : null}
              {isEmpty ? (
                <p className={loadingClass}>表示できる銘柄はありません</p>
              ) : (
                <DividendAnalysisTable
                  enterprises={enterprises}
                  onSelectSymbol={handleSelectSymbol}
                  selectedSymbolId={selectedSymbolId}
                />
              )}
            </Panel>

            {isDetailSticky ? (
              <section className={stickyDetailGridClass}>
                {selectedSymbolId ? (
                  <div className={detailPanelClass}>
                    <Panel
                      title={
                        detail ? (
                          <>
                            詳細分析：
                            <span className={detailTitleNameClass}>
                              {detail.companyName}（{detail.symbolId}）
                            </span>
                            <span className={srOnlyClass}>
                              {detail.companyName}
                            </span>
                          </>
                        ) : (
                          "詳細分析"
                        )
                      }
                      titleAriaLabel={detail?.companyName}
                    >
                      {detailStatus === "error" ? (
                        <div className={alertClass} role="alert">
                          <p>
                            {error ?? "高配当分析データを取得できませんでした"}
                          </p>
                          <InvestmentButton
                            onClick={onRetry}
                            variant="secondary"
                          >
                            再試行
                          </InvestmentButton>
                        </div>
                      ) : (
                        <DividendAnalysisDetail
                          detail={detail}
                          showHeading={false}
                          loading={detailStatus === "loading"}
                        />
                      )}
                    </Panel>
                  </div>
                ) : null}
                <AiSummaryPanel
                  detail={detail}
                  loading={detailStatus === "loading"}
                />
              </section>
            ) : null}

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

function Panel({
  children,
  description,
  title,
  titleAriaLabel,
}: {
  children: ReactNode;
  description?: string;
  title?: ReactNode;
  titleAriaLabel?: string;
}) {
  return (
    <section className={panelClass}>
      {title ? (
        <div className={panelHeaderClass}>
          <h2 aria-label={titleAriaLabel} className={panelTitleClass}>
            {title}
          </h2>
        </div>
      ) : null}
      {children}
      {description ? (
        <p className={panelDescriptionClass}>{description}</p>
      ) : null}
    </section>
  );
}

function AiSummaryPanel({
  detail,
  loading,
}: {
  detail: DividendAnalysisDetailData | null;
  loading?: boolean;
}) {
  return (
    <aside className={aiPanelClass} aria-label="AI分析サマリー">
      <h2 className={aiTitleClass}>
        <span className={brainIconClass} aria-hidden="true">
          AI
        </span>
        AI分析サマリー（分析のみ）
      </h2>
      {loading ? (
        <p className={loadingClass}>AI要約を確認しています</p>
      ) : detail ? (
        <>
          <div className={aiHeroClass}>
            <span className={shieldIconClass} aria-hidden="true" />
            <div>
              <p
                className={cx(
                  aiJudgementClass,
                  aiToneClass[detail.safetyLabel],
                )}
              >
                {detail.judgement}
              </p>
              <p className={aiTextClass}>
                配当の持続性は
                {detail.totalScore >= 70 ? "高い" : "慎重な確認が必要"}
                と考えられます
              </p>
            </div>
          </div>
          <div className={aiBoxClass}>
            <h3 className={aiSubTitleClass}>要約</h3>
            {detail.analysisSummary ? (
              <ul className={aiListClass}>
                {splitSummary(detail.analysisSummary).map((summary) => (
                  <li className={aiListItemClass} key={summary}>
                    <span className={checkIconClass} aria-hidden="true" />
                    {summary}
                  </li>
                ))}
                <li className={aiListItemClass}>
                  <span className={checkIconClass} aria-hidden="true" />
                  配当性向は健全な水準で、無理のない配当が継続されています。
                </li>
                <li className={aiListItemClass}>
                  <span className={checkIconClass} aria-hidden="true" />
                  増配率は安定しており、継続的な増配を実現しています。
                </li>
                <li className={cx(aiListItemClass, aiWarningItemClass)}>
                  <span className={warningIconClass} aria-hidden="true" />
                  PERはやや高めの水準で、期待も織り込まれている可能性があります。
                </li>
              </ul>
            ) : (
              <div className={aiTodoBoxClass}>
                <p className={aiTodoClass}>AI要約は準備中です</p>
                <p className={aiTodoTextClass}>
                  現時点では分析サマリーは未提供です。スコアと各指標の詳細のみを確認してください。
                </p>
              </div>
            )}
          </div>
          <p className={aiNoteClass}>
            ※
            本分析は過去のデータに基づくものであり、将来の結果を保証するものではありません。
          </p>
        </>
      ) : (
        <p className={loadingClass}>銘柄を選択するとAI要約を表示します</p>
      )}
    </aside>
  );
}

const pageClass = css({
  bg: "#fcfdff",
  color: "investment-text",
  minH: "100vh",
});

const mainClass = css({
  display: "grid",
  gap: "4",
  mx: "auto",
  p: { base: "4", md: "6", xl: "8" },
  w: "full",
});

const headerClass = css({
  alignItems: { base: "stretch", md: "start" },
  display: "flex",
  flexDirection: { base: "column", md: "row" },
  gap: "4",
  justifyContent: "space-between",
});

const titleClass = css({
  color: "investment-text",
  fontSize: { base: "2xl", md: "3xl" },
  fontWeight: "900",
  letterSpacing: "0",
  lineHeight: "1.15",
  m: 0,
});

const leadClass = css({
  color: "investment-muted",
  fontSize: "sm",
  fontWeight: "800",
  mt: "2",
});

const headerActionsClass = css({
  alignItems: { base: "stretch", md: "end" },
  display: "grid",
  gap: "3",
  justifyItems: { base: "stretch", md: "end" },
});

const updatedAtClass = css({
  alignItems: "center",
  color: "investment-text",
  display: "flex",
  fontSize: "sm",
  fontWeight: "800",
  gap: "2",
  justifyContent: { base: "flex-start", md: "flex-end" },
});

const refreshIconClass = css({
  border: "2px solid token(colors.investment-blue)",
  borderLeftColor: "transparent",
  borderRadius: "999px",
  display: "inline-block",
  h: "4",
  w: "4",
});

const ruleButtonClass = css({
  minH: "10",
  px: "4",
});

const infoIconClass = css({
  alignItems: "center",
  border: "2px solid currentColor",
  borderRadius: "999px",
  display: "inline-flex",
  fontSize: "2xs",
  fontWeight: "900",
  h: "4",
  justifyContent: "center",
  lineHeight: 1,
  w: "4",
});

const panelClass = css({
  bg: "white",
  border: "1px solid #d8e2f2",
  borderRadius: "8px",
  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.03)",
  minW: 0,
  p: { base: "3", md: "4" },
});

const panelHeaderClass = css({
  alignItems: "center",
  display: "flex",
  justifyContent: "space-between",
  mb: "3",
});

const panelTitleClass = css({
  color: "investment-text",
  fontSize: "lg",
  fontWeight: "900",
  letterSpacing: "0",
  lineHeight: "1.35",
  m: 0,
});

const detailTitleNameClass = css({
  color: "investment-blue",
});

const panelDescriptionClass = css({
  color: "investment-muted",
  fontSize: "xs",
  fontWeight: "800",
  mt: "3",
});

const detailPanelClass = css({
  minW: 0,
});

const stickyDetailGridClass = css({
  alignItems: "start",
  bg: "white",
  borderTop: "1px solid token(colors.investment-border-soft)",
  bottom: 0,
  boxShadow: "0 -12px 32px rgba(15, 23, 42, 0.14)",
  height: "33.333dvh",
  left: 0,
  display: "grid",
  gap: "4",
  gridTemplateColumns: {
    base: "1fr",
    xl: "minmax(0, 1fr) minmax(0, 1fr)",
  },
  overflowY: "auto",
  p: { base: "3", md: "4" },
  position: "fixed",
  right: 0,
  zIndex: 20,
});

const stickyContentPaddingClass = css({
  pb: "calc(33.333dvh  24px)",
});

const aiPanelClass = cx(
  panelClass,
  css({
    alignContent: "start",
    bg: "#f7fbff",
    borderColor: "#bcd4ff",
    display: "grid",
    gap: "4",
  }),
);

const srOnlyClass = css({
  border: 0,
  clip: "rect(0, 0, 0, 0)",
  h: "1px",
  overflow: "hidden",
  p: 0,
  position: "absolute",
  whiteSpace: "nowrap",
  w: "1px",
});

const aiTitleClass = css({
  alignItems: "center",
  color: "investment-blue",
  display: "flex",
  fontSize: "lg",
  fontWeight: "900",
  gap: "2",
  m: 0,
});

const brainIconClass = css({
  alignItems: "center",
  border: "2px solid token(colors.investment-blue)",
  borderRadius: "999px",
  display: "inline-flex",
  fontSize: "2xs",
  fontWeight: "900",
  h: "5",
  justifyContent: "center",
  w: "5",
});

const aiHeroClass = css({
  alignItems: "center",
  bg: "white",
  borderRadius: "8px",
  display: "grid",
  gap: "3",
  gridTemplateColumns: "44px minmax(0, 1fr)",
  p: "4",
  minH: "82px",
});

const shieldIconClass = css({
  border: "3px solid token(colors.investment-green)",
  borderRadius: "12px 12px 16px 16px",
  display: "inline-block",
  h: "36px",
  position: "relative",
  w: "30px",
  _after: {
    bg: "investment-green",
    content: '""',
    h: "12px",
    left: "12px",
    position: "absolute",
    top: "8px",
    transform: "rotate(45deg)",
    w: "5px",
  },
});

const aiJudgementClass = css({
  fontSize: "md",
  fontWeight: "900",
});

const aiTextClass = css({
  color: "investment-muted",
  fontSize: "sm",
  fontWeight: "800",
  mt: "1",
});

const aiBoxClass = css({
  bg: "white",
  borderRadius: "8px",
  p: "4",
});

const aiSubTitleClass = css({
  color: "investment-text",
  fontSize: "sm",
  fontWeight: "900",
  m: 0,
});

const aiTodoClass = css({
  color: "investment-text",
  fontSize: "sm",
  fontWeight: "900",
});

const aiTodoBoxClass = css({
  bg: "#f8fafc",
  border: "1px dashed token(colors.investment-border)",
  borderRadius: "8px",
  display: "grid",
  gap: "2",
  mt: "3",
  p: "3",
});

const aiTodoTextClass = css({
  color: "investment-muted",
  fontSize: "sm",
  fontWeight: "800",
  lineHeight: "1.6",
});

const aiListClass = css({
  display: "grid",
  gap: "3",
  listStyle: "none",
  m: 0,
  mt: "3",
  p: 0,
});

const aiListItemClass = css({
  color: "investment-text",
  display: "grid",
  fontSize: "sm",
  fontWeight: "800",
  gap: "2",
  gridTemplateColumns: "18px minmax(0, 1fr)",
  lineHeight: "1.55",
});

const checkIconClass = css({
  bg: "investment-green",
  borderRadius: "999px",
  display: "inline-block",
  h: "4",
  mt: "0.5",
  position: "relative",
  w: "4",
  _after: {
    borderBottom: "2px solid white",
    borderRight: "2px solid white",
    content: '""',
    h: "8px",
    left: "5px",
    position: "absolute",
    top: "2px",
    transform: "rotate(45deg)",
    w: "4px",
  },
});

const warningIconClass = css({
  color: "investment-orange",
  display: "inline-block",
  fontSize: "md",
  fontWeight: "900",
  lineHeight: 1,
  mt: "0.5",
  _before: {
    content: '"△"',
  },
});

const aiWarningItemClass = css({
  color: "investment-text",
});

const aiNoteClass = css({
  color: "investment-muted",
  fontSize: "xs",
  fontWeight: "800",
  lineHeight: "1.6",
  px: "3",
});

const alertClass = css({
  alignItems: "center",
  display: "flex",
  flexWrap: "wrap",
  fontWeight: "800",
  gap: "4",
  justifyContent: "space-between",
});

const loadingClass = css({
  color: "investment-muted",
  fontWeight: "800",
});

const aiToneClass = {
  safe: css({ color: "investment-green" }),
  neutral: css({ color: "investment-orange" }),
  danger: css({ color: "investment-red" }),
} as const;

function formatDateTime(value: string) {
  return value.slice(0, 16).replace("T", " ");
}

function splitSummary(summary: string) {
  return summary
    .split(/(?<=。)/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4);
}
