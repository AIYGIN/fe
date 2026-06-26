import type { ReactNode } from "react";

import { css, cx } from "../../../../../styled-system/css";

type InvestmentPanelProps = {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function InvestmentPanel({
  title,
  description,
  action,
  children,
  className,
}: InvestmentPanelProps) {
  return (
    <section className={cx(panelClass, className)}>
      {title || description || action ? (
        <div className={headerClass}>
          <div>
            {title ? <h2 className={titleClass}>{title}</h2> : null}
            {description ? (
              <p className={descriptionClass}>{description}</p>
            ) : null}
          </div>
          {action ? <div className={actionClass}>{action}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

const panelClass = css({
  bg: "white",
  border: "1px solid",
  borderColor: "#dbe3ef",
  borderRadius: "8px",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.03)",
  minW: 0,
  p: { base: "18px", md: "22px" },
});

const headerClass = css({
  alignItems: "flex-start",
  display: "flex",
  gap: "16px",
  justifyContent: "space-between",
  mb: "18px",
});

const titleClass = css({
  color: "#111827",
  fontSize: "18px",
  fontWeight: 800,
  letterSpacing: "0",
  lineHeight: 1.35,
  m: 0,
});

const descriptionClass = css({
  color: "#64748b",
  fontSize: "13px",
  fontWeight: 600,
  lineHeight: 1.65,
  m: "6px 0 0",
});

const actionClass = css({
  flexShrink: 0,
});
