import { css } from "../../../../styled-system/css";

export type InvestmentTone =
  | "safe"
  | "good"
  | "watch"
  | "warning"
  | "danger"
  | "neutral";

export const toneTokens = {
  safe: {
    fg: "investment-green",
    bg: "investment-green-soft",
    ring: "#16a34a",
    softRing: "#cfeedd",
  },
  good: {
    fg: "investment-lime",
    bg: "investment-green-soft",
    ring: "#65a30d",
    softRing: "#d9eec4",
  },
  watch: {
    fg: "investment-orange",
    bg: "investment-orange-soft",
    ring: "#fb8500",
    softRing: "#ffd99c",
  },
  warning: {
    fg: "investment-orange",
    bg: "investment-orange-soft",
    ring: "#fb8500",
    softRing: "#ffd99c",
  },
  danger: {
    fg: "investment-red",
    bg: "investment-red-soft",
    ring: "#ef3434",
    softRing: "#ffc9c9",
  },
  neutral: {
    fg: "investment-blue",
    bg: "investment-blue-soft",
    ring: "#2563eb",
    softRing: "#dbeafe",
  },
} as const;

export const toneLabel: Record<InvestmentTone, string> = {
  safe: "安全寄り",
  good: "安全寄り",
  watch: "注意しつつ良好",
  warning: "注意",
  danger: "危険",
  neutral: "OK",
};

export function scoreToTone(score: number): InvestmentTone {
  if (score >= 85) return "safe";
  if (score >= 70) return "watch";
  if (score >= 50) return "warning";
  return "danger";
}

export const toneForegroundClass: Record<InvestmentTone, string> = {
  safe: css({ color: "investment-green" }),
  good: css({ color: "investment-lime" }),
  watch: css({ color: "investment-orange" }),
  warning: css({ color: "investment-orange" }),
  danger: css({ color: "investment-red" }),
  neutral: css({ color: "investment-blue" }),
};

export const toneBadgeClass: Record<InvestmentTone, string> = {
  safe: css({ bg: "investment-green-soft", color: "investment-green" }),
  good: css({ bg: "investment-green-soft", color: "investment-lime" }),
  watch: css({ bg: "investment-orange-soft", color: "investment-orange" }),
  warning: css({ bg: "investment-orange-soft", color: "investment-orange" }),
  danger: css({ bg: "investment-red-soft", color: "investment-red" }),
  neutral: css({ bg: "investment-blue-soft", color: "investment-blue" }),
};
