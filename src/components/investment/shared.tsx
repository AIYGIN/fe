import type { ReactNode } from "react";
import { css, cx } from "../../../styled-system/css";

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

export const componentFrame = css({
  bg: "investment-surface",
  border: "1px solid token(colors.investment-border)",
  rounded: "lg",
  boxShadow: "0 1px 2px rgba(16, 26, 54, 0.03)",
  p: "5",
});

export const storyCanvas = css({
  minH: "100vh",
  bg: "investment-bg",
  p: "8",
  color: "investment-text",
  fontFamily:
    "Inter, IBM Plex Sans, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
});

export const storyRow = css({
  display: "flex",
  alignItems: "center",
  gap: "6",
  flexWrap: "wrap",
});

export const itemLabel = css({
  display: "block",
  mb: "3",
  fontSize: "xs",
  fontWeight: "700",
  color: "investment-text",
});

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

export const inputShell = css({
  display: "flex",
  alignItems: "center",
  gap: "2",
  h: "9",
  minW: "36",
  px: "3",
  rounded: "md",
  bg: "white",
  border: "1px solid #cfd9e8",
  color: "#34425c",
  _focusWithin: {
    borderColor: "investment-blue",
    boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.14)",
  },
});

export const inputControl = css({
  w: "full",
  minW: "0",
  bg: "transparent",
  border: "0",
  outline: "0",
  color: "investment-text",
  fontSize: "sm",
  _placeholder: { color: "#64748b" },
});

export const miniCard = css({
  minH: "28",
  p: "4",
  rounded: "lg",
  border: "1px solid token(colors.investment-border)",
  bg: "white",
  boxShadow: "0 1px 2px rgba(16, 26, 54, 0.025)",
});

export function StoryFrame({ children }: { children: ReactNode }) {
  return <div className={storyCanvas}>{children}</div>;
}

export function DemoBlock({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cx(componentFrame, className)} aria-label={title}>
      <h2
        className={css({
          fontSize: "md",
          fontWeight: "700",
          letterSpacing: "-0.02em",
          color: "investment-text",
          mb: "5",
        })}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

export function DemoItem({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <span className={itemLabel}>{label}</span>
      {children}
    </div>
  );
}

export function SettingsIcon() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 3.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H1.8a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 3.6 8a1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 8 3.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V1.8a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15 3.6a1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 8c.2.36.55.58 1 .6h.1a2 2 0 1 1 0 4h-.09A1.7 1.7 0 0 0 19.4 15Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

export function SearchIcon() {
  return (
    <IconPath path="M21 21l-4.3-4.3m1.3-5.2a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z" />
  );
}

export function CalendarIcon() {
  return (
    <IconPath path="M7 3v4m10-4v4M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z" />
  );
}

export function ChevronIcon() {
  return <IconPath path="m9 18 6-6-6-6" />;
}

export function AlertIcon() {
  return (
    <IconPath
      path="M12 8v5m0 4h.01M10.3 4.5 2.8 18a1.5 1.5 0 0 0 1.3 2.2h15.8a1.5 1.5 0 0 0 1.3-2.2L13.7 4.5a2 2 0 0 0-3.4 0Z"
      color="#f97316"
    />
  );
}

export function InfoIcon() {
  return (
    <IconPath
      path="M12 17v-5m0-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      color="#2563eb"
    />
  );
}

export function SortIcon() {
  return <IconPath path="M8 6h12M4 6h.01M4 12h.01M4 18h.01M8 12h8M8 18h4" />;
}

export function FilterIcon() {
  return <IconPath path="M3 5h18l-7 8v5l-4 2v-7L3 5Z" />;
}

export function IconPath({
  path,
  color = "currentColor",
}: {
  path: string;
  color?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      className={css({ flexShrink: "0" })}
    >
      <path
        d={path}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
