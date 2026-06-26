import { css } from "../../../../../styled-system/css";

type PortfolioHeaderProps = {
  lastUpdated?: string;
  onRefresh?: () => void;
};

export function PortfolioHeader({
  lastUpdated,
  onRefresh,
}: PortfolioHeaderProps) {
  return (
    <header className={headerClass}>
      <div>
        <h1 className={titleClass}>ポートフォリオ</h1>
        <p className={leadClass}>
          保有資産の全体像を可視化し、投資方針との整合性を確認します
        </p>
      </div>
      <div className={updatedClass}>
        <span>最終更新: {lastUpdated ? formatDateTime(lastUpdated) : "-"}</span>
        <button
          aria-label="データを更新"
          className={refreshButtonClass}
          onClick={onRefresh}
          type="button"
        >
          ↻
        </button>
      </div>
    </header>
  );
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

const headerClass = css({
  alignItems: { base: "flex-start", md: "center" },
  display: "flex",
  flexDir: { base: "column", md: "row" },
  gap: "16px",
  justifyContent: "space-between",
  mb: "24px",
});

const titleClass = css({
  color: "#0f172a",
  fontSize: { base: "28px", md: "30px" },
  fontWeight: 800,
  letterSpacing: "0",
  lineHeight: 1.25,
  m: 0,
});

const leadClass = css({
  color: "#475569",
  fontSize: "15px",
  fontWeight: 600,
  lineHeight: 1.7,
  m: "10px 0 0",
});

const updatedClass = css({
  alignItems: "center",
  color: "#475569",
  display: "flex",
  fontSize: "12px",
  fontWeight: 700,
  gap: "10px",
  whiteSpace: "nowrap",
});

const refreshButtonClass = css({
  alignItems: "center",
  bg: "transparent",
  border: "0",
  color: "#334155",
  cursor: "pointer",
  display: "inline-flex",
  fontSize: "20px",
  h: "28px",
  justifyContent: "center",
  lineHeight: 1,
  p: 0,
  w: "28px",
});
