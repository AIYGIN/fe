import type { ReactNode } from "react";
import { css } from "../../../../styled-system/css";
import { InfoIcon } from "../shared";

export function InvestmentTooltip({ children }: { children: ReactNode }) {
  return (
    <div
      className={css({
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minH: "24",
        gap: "4",
      })}
    >
      <InfoIcon />
      <span
        className={css({
          position: "relative",
          display: "inline-flex",
          px: "5",
          py: "3",
          rounded: "md",
          bg: "investment-tooltip",
          color: "white",
          fontSize: "sm",
          fontWeight: "700",
          boxShadow: "0 12px 26px rgba(15, 23, 42, 0.22)",
        })}
      >
        {children}
      </span>
    </div>
  );
}
