import { css, cx } from "../../../../../styled-system/css";

type InvestmentRatioBarProps = {
  value: number;
  tone?: "blue" | "amber" | "green" | "gray";
  className?: string;
};

export function InvestmentRatioBar({
  value,
  tone = "blue",
  className,
}: InvestmentRatioBarProps) {
  const clampedValue = Math.max(0, Math.min(100, value));

  return (
    <span
      aria-label={`${formatPercent(value)} の比率`}
      className={cx(trackClass, className)}
      role="img"
    >
      <span
        className={fillClass}
        data-tone={tone}
        style={{ width: `${clampedValue}%` }}
      />
    </span>
  );
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

const trackClass = css({
  bg: "#e2e8f0",
  borderRadius: "999px",
  display: "block",
  h: "8px",
  overflow: "hidden",
  w: "100%",
});

const fillClass = css({
  borderRadius: "inherit",
  display: "block",
  h: "100%",
  minW: "4px",
  transition: "width 160ms ease",
  "&[data-tone='blue']": { bg: "#1268df" },
  "&[data-tone='amber']": { bg: "#f5ae32" },
  "&[data-tone='green']": { bg: "#43bf73" },
  "&[data-tone='gray']": { bg: "#94a3b8" },
});
