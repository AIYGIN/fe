import { css } from "../../../../../styled-system/css";
import { InvestmentPanel } from "../InvestmentPanel";

type PortfolioAiSummarySectionProps = {
  isLoading?: boolean;
};

export function PortfolioAiSummarySection({
  isLoading = false,
}: PortfolioAiSummarySectionProps) {
  return (
    <InvestmentPanel
      action={<span className={badgeClass}>TODO</span>}
      className={panelClass}
      title="AI要約（Coming Soon）"
    >
      <div aria-busy={isLoading} className={contentClass}>
        <div className={iconClass}>◌</div>
        <p className={leadClass}>
          {isLoading
            ? "AIによるポートフォリオ分析と要約を準備中です"
            : "AIによるポートフォリオ分析と要約を準備中です"}
        </p>
        <ul className={listClass}>
          <li>ポートフォリオの特徴分析</li>
          <li>強み・弱みの整理</li>
          <li>改善提案の提示</li>
          <li>長期的なリスク評価</li>
        </ul>
        <p className={releaseClass}>近日リリース予定！お楽しみに。</p>
      </div>
    </InvestmentPanel>
  );
}

const panelClass = css({
  minH: "420px",
});

const badgeClass = css({
  bg: "#eaf2ff",
  borderRadius: "5px",
  color: "#1268df",
  display: "inline-flex",
  fontSize: "11px",
  fontWeight: 900,
  px: "8px",
  py: "4px",
});

const contentClass = css({
  alignItems: "center",
  color: "#64748b",
  display: "flex",
  flexDir: "column",
  fontSize: "14px",
  fontWeight: 600,
  justifyContent: "center",
  minH: "316px",
  textAlign: "center",
});

const iconClass = css({
  alignItems: "center",
  border: "3px solid",
  borderColor: "#cbd5e1",
  borderRadius: "999px",
  color: "#cbd5e1",
  display: "inline-flex",
  fontSize: "42px",
  h: "58px",
  justifyContent: "center",
  lineHeight: 1,
  mb: "18px",
  w: "58px",
});

const leadClass = css({
  lineHeight: 1.7,
  m: 0,
});

const listClass = css({
  display: "grid",
  gap: "6px",
  lineHeight: 1.65,
  listStyle: "disc",
  m: "14px 0 0",
  p: 0,
  textAlign: "left",
});

const releaseClass = css({
  color: "#64748b",
  lineHeight: 1.7,
  m: "34px 0 0",
});
