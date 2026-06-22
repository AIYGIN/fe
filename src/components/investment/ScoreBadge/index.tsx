import { css, cx } from "../../../../styled-system/css";
import {
  type InvestmentTone,
  scoreToTone,
  toneForegroundClass,
  toneLabel,
  toneTokens,
} from "../shared";

export function ScoreBadge({
  score,
  tone = scoreToTone(score),
  label = toneLabel[tone],
  size = "md",
}: {
  score: number;
  tone?: InvestmentTone;
  label?: string;
  size?: "sm" | "md";
}) {
  const token = toneTokens[tone];
  const pct = Math.max(0, Math.min(100, score));
  const diameter = size === "sm" ? 72 : 80;
  const radius = diameter / 2 - 4;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct / 100);

  return (
    <span
      className={css({
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        rounded: "full",
        bg: "white",
        color: "investment-text",
      })}
      style={{
        width: diameter,
        height: diameter,
      }}
      role="img"
      aria-label={`スコア ${score}、${label}`}
    >
      <svg
        aria-hidden="true"
        className={css({ position: "absolute", inset: "0" })}
        width={diameter}
        height={diameter}
        viewBox={`0 0 ${diameter} ${diameter}`}
      >
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          stroke={token.softRing}
          strokeWidth="4"
        />
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          stroke={token.ring}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${diameter / 2} ${diameter / 2})`}
        />
      </svg>
      <span
        className={css({
          position: "relative",
          fontSize: size === "sm" ? "xl" : "2xl",
          fontWeight: "800",
          lineHeight: "1",
        })}
      >
        {score}
      </span>
      <span
        className={cx(
          css({
            position: "relative",
            mt: "1",
            fontSize: "2xs",
            fontWeight: "700",
          }),
          toneForegroundClass[tone],
        )}
      >
        {label}
      </span>
    </span>
  );
}
