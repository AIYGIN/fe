import type { ReactNode } from "react";
import { css, cx } from "../../../../styled-system/css";
import { itemLabel } from "./form";
import { componentFrame } from "./layout";

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
