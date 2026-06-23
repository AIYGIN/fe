import type { ReactNode } from "react";
import { css, cx } from "../../../../../styled-system/css";
import { type InvestmentTone, toneBadgeClass, toneLabel } from "../tone";

export function StatusBadge({
  tone = "safe",
  children,
}: {
  tone?: InvestmentTone;
  children?: ReactNode;
}) {
  return (
    <span
      className={cx(
        css({
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          minH: "8",
          px: "4",
          rounded: "md",
          fontSize: "xs",
          fontWeight: "700",
          whiteSpace: "nowrap",
        }),
        toneBadgeClass[tone],
      )}
    >
      {children ?? toneLabel[tone]}
    </span>
  );
}
