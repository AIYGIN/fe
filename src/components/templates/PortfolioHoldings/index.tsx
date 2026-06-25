import type { CSSProperties } from "react";

import type { PortfolioRequestStatus } from "@/hooks/portfolio/usePortfolio";
import type { PortfolioData } from "@/lib/pages/portfolio/holdings";

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

export function PortfolioHoldingsTemplate({
  state,
  externalLinkUrl = "https://www.rakuten-sec.co.jp/",
  brokerLinkUrl,
  onRetry,
}: PortfolioHoldingsTemplateProps) {
  const linkUrl = brokerLinkUrl ?? externalLinkUrl;
  const isHoldingsLoading = state.holdingsStatus === "loading";
  const isAnalysisLoading = state.analysisStatus === "loading";

  return (
    <main aria-label="portfolio holdings" style={styles.page}>
      <section style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Portfolio</p>
          <h1 style={styles.title}>ポートフォリオ</h1>
        </div>
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.externalLink}
        >
          証券口座を連携
        </a>
      </section>

      {isHoldingsLoading ? (
        <output aria-live="polite" style={styles.card}>
          保有商品を読み込み中です
        </output>
      ) : null}

      {state.holdingsStatus === "not-found" ? (
        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>ポートフォリオが見つかりません</h2>
          <p style={styles.muted}>保有商品はまだありません</p>
        </section>
      ) : null}

      {state.holdingsStatus === "error" ? (
        <section role="alert" style={styles.card}>
          <h2 style={styles.sectionTitle}>
            ポートフォリオを取得できませんでした
          </h2>
          <p style={styles.muted}>
            {state.error ?? "時間をおいてもう一度お試しください。"}
          </p>
          <button type="button" onClick={onRetry} style={styles.button}>
            再試行
          </button>
        </section>
      ) : null}

      {state.data ? (
        <div style={styles.grid}>
          <section aria-label="保有商品" style={styles.card}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>保有商品</h2>
              <span style={styles.muted}>
                更新 {formatDateTime(state.data.lastUpdated.holdings)}
              </span>
            </div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>商品名</th>
                  <th style={styles.numericTh}>構成比</th>
                </tr>
              </thead>
              <tbody>
                {state.data.holdings.map((holding) => (
                  <tr key={holding.holdingId}>
                    <td style={styles.td}>{holding.productName}</td>
                    <td style={styles.numericTd}>
                      {formatPercent(holding.ratio)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section style={styles.card}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>分析比率</h2>
              <span style={styles.muted}>
                更新 {formatDateTime(state.data.lastUpdated.analysis)}
              </span>
            </div>
            {isAnalysisLoading ? (
              <output aria-live="polite" style={styles.muted}>
                分析を取得中
              </output>
            ) : (
              <div style={styles.analysisGrid}>
                <RatioList
                  title="資産配分"
                  items={state.data.analysis.sectorAllocations ?? []}
                />
                <RatioList
                  title="構成銘柄"
                  items={state.data.analysis.constituents ?? []}
                />
                <RatioList
                  title="AIサマリー"
                  items={state.data.analysis.countryAllocations ?? []}
                />
              </div>
            )}
          </section>
        </div>
      ) : null}
    </main>
  );
}

type RatioItem = PortfolioData["analysis"]["sectorAllocations"][number];

function RatioList({ title, items }: { title: string; items: RatioItem[] }) {
  return (
    <section aria-label={title} style={styles.ratioPanel}>
      <h3 style={styles.ratioTitle}>{title}</h3>
      <ul style={styles.ratioList}>
        {items.map((item) => (
          <li key={item.name} style={styles.ratioItem}>
            <span>{item.name}</span>
            <strong>{formatPercent(item.ratio)}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

const styles = {
  page: {
    minHeight: "100%",
    background: "#ffffff",
    color: "#162033",
    padding: "32px",
  },
  header: {
    alignItems: "center",
    borderBottom: "1px solid #dce5f2",
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "24px",
    paddingBottom: "20px",
  },
  eyebrow: {
    color: "#2563eb",
    fontSize: "13px",
    fontWeight: 700,
    margin: "0 0 4px",
  },
  title: {
    fontSize: "28px",
    lineHeight: 1.3,
    margin: 0,
  },
  externalLink: {
    border: "1px solid #2563eb",
    borderRadius: "6px",
    color: "#2563eb",
    fontWeight: 700,
    padding: "10px 14px",
    textDecoration: "none",
  },
  grid: {
    display: "grid",
    gap: "20px",
    gridTemplateColumns: "minmax(0, 1fr)",
  },
  card: {
    background: "#ffffff",
    border: "1px solid #dce5f2",
    borderRadius: "8px",
    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
    padding: "20px",
  },
  sectionHeader: {
    alignItems: "center",
    display: "flex",
    gap: "12px",
    justifyContent: "space-between",
    marginBottom: "16px",
  },
  sectionTitle: {
    fontSize: "18px",
    lineHeight: 1.4,
    margin: 0,
  },
  muted: {
    color: "#5f6f86",
    fontSize: "14px",
    margin: 0,
  },
  table: {
    borderCollapse: "collapse",
    width: "100%",
  },
  th: {
    borderBottom: "1px solid #dce5f2",
    color: "#5f6f86",
    fontSize: "13px",
    padding: "10px 8px",
    textAlign: "left",
  },
  numericTh: {
    borderBottom: "1px solid #dce5f2",
    color: "#5f6f86",
    fontSize: "13px",
    padding: "10px 8px",
    textAlign: "right",
  },
  td: {
    borderBottom: "1px solid #eef3f8",
    padding: "12px 8px",
  },
  numericTd: {
    borderBottom: "1px solid #eef3f8",
    fontVariantNumeric: "tabular-nums",
    fontWeight: 700,
    padding: "12px 8px",
    textAlign: "right",
  },
  analysisGrid: {
    display: "grid",
    gap: "16px",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  },
  ratioPanel: {
    border: "1px solid #eef3f8",
    borderRadius: "6px",
    padding: "14px",
  },
  ratioTitle: {
    color: "#24344d",
    fontSize: "15px",
    margin: "0 0 10px",
  },
  ratioList: {
    display: "grid",
    gap: "8px",
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  ratioItem: {
    alignItems: "center",
    display: "flex",
    gap: "12px",
    justifyContent: "space-between",
  },
  button: {
    background: "#2563eb",
    border: 0,
    borderRadius: "6px",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 700,
    marginTop: "16px",
    padding: "10px 14px",
  },
} satisfies Record<string, CSSProperties>;
