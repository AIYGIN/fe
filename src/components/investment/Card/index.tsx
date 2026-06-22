import type { ReactNode } from "react";
import { css, cx } from "../../../../styled-system/css";
import { StatusBadge } from "../StatusBadge";
import {
  AlertIcon,
  miniCard,
  scoreToTone,
  toneLabel,
  toneTokens,
} from "../shared";

export function BasicCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <article className={miniCard}>
      <h3 className={css({ fontSize: "sm", fontWeight: "800" })}>{title}</h3>
      <p
        className={css({ mt: "3", color: "investment-muted", fontSize: "sm" })}
      >
        {children}
      </p>
    </article>
  );
}

export function MetricCard({
  label,
  value,
  subText,
}: {
  label: string;
  value: ReactNode;
  subText?: string;
}) {
  return (
    <article className={miniCard}>
      <p
        className={css({
          color: "investment-muted",
          fontSize: "sm",
          fontWeight: "700",
        })}
      >
        {label}
      </p>
      <p
        className={css({
          mt: "2",
          fontSize: "3xl",
          fontWeight: "800",
          lineHeight: "1",
        })}
      >
        {value}
      </p>
      {subText ? (
        <p
          className={css({
            mt: "3",
            color: "investment-muted",
            fontSize: "sm",
          })}
        >
          {subText}
        </p>
      ) : null}
    </article>
  );
}

export function ScoreCard({ score }: { score: number }) {
  const tone = scoreToTone(score);
  const token = toneTokens[tone];
  const diameter = 76;
  const radius = diameter / 2 - 4;
  const pct = Math.max(0, Math.min(100, score));
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct / 100);

  return (
    <article
      className={cx(
        miniCard,
        css({
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          textAlign: "center",
          gap: "2",
        }),
      )}
    >
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
        style={{ width: diameter, height: diameter }}
        role="img"
        aria-label={`スコア ${score} / 100`}
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
            fontSize: "2xl",
            fontWeight: "800",
            lineHeight: "1",
          })}
        >
          {score}
        </span>
        <span
          className={css({
            position: "relative",
            color: "investment-muted",
            fontSize: "xs",
            fontWeight: "700",
          })}
        >
          /100
        </span>
      </span>
      <StatusBadge tone={tone}>{toneLabel[tone]}</StatusBadge>
    </article>
  );
}

export function WarningCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <article
      className={cx(
        miniCard,
        css({ display: "flex", gap: "3", flexDirection: "row" }),
      )}
    >
      <AlertIcon />
      <div>
        <h3 className={css({ fontSize: "sm", fontWeight: "800" })}>{title}</h3>
        <p
          className={css({
            mt: "2",
            color: "investment-muted",
            fontSize: "sm",
            lineHeight: "1.55",
          })}
        >
          {children}
        </p>
      </div>
    </article>
  );
}
