import { css } from "../../../../../styled-system/css";
import { InvestmentPanel } from "../InvestmentPanel";

type PortfolioBrokerLinkSectionProps = {
  linkUrl: string;
};

export function PortfolioBrokerLinkSection({
  linkUrl,
}: PortfolioBrokerLinkSectionProps) {
  return (
    <InvestmentPanel
      description="実際の保有状況・評価額・損益はこちら"
      title="SBI証券で確認する"
    >
      <a
        className={buttonClass}
        href={linkUrl}
        rel="noopener noreferrer"
        target="_blank"
      >
        SBI証券 NISAポートフォリオへ ↗
      </a>
      <p className={urlClass}>{linkUrl}</p>
      <p className={noteClass}>※ 新しいタブでSBI証券のページが開きます</p>
    </InvestmentPanel>
  );
}

const buttonClass = css({
  alignItems: "center",
  bg: "#1268df",
  borderRadius: "6px",
  boxShadow: "0 8px 16px rgba(18, 104, 223, 0.2)",
  color: "white",
  display: "flex",
  fontSize: "16px",
  fontWeight: 800,
  justifyContent: "center",
  minH: "54px",
  textDecoration: "none",
  w: "100%",
});

const urlClass = css({
  color: "#1268df",
  fontSize: "15px",
  fontWeight: 700,
  lineHeight: 1.6,
  m: "18px 0 0",
  overflowWrap: "anywhere",
});

const noteClass = css({
  color: "#64748b",
  fontSize: "12px",
  fontWeight: 600,
  lineHeight: 1.7,
  m: "34px 0 0",
});
