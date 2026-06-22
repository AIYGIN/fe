"use client";

import type { ButtonHTMLAttributes } from "react";
import { css, cx } from "../../../../styled-system/css";
import { SettingsIcon } from "../shared";

export type InvestmentButtonVariant =
  | "primary"
  | "secondary"
  | "text"
  | "icon"
  | "link";

export type InvestmentButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: InvestmentButtonVariant;
};

export function InvestmentButton({
  variant = "primary",
  className,
  children = "ボタン",
  ...props
}: InvestmentButtonProps) {
  return (
    <button
      type="button"
      className={cx(buttonBase, buttonVariant[variant], className)}
      {...props}
    >
      {variant === "icon" ? <SettingsIcon /> : children}
    </button>
  );
}

const buttonBase = css({
  minH: "9",
  px: "6",
  rounded: "md",
  fontSize: "sm",
  fontWeight: "700",
  transition:
    "background-color 160ms ease, border-color 160ms ease, color 160ms ease",
  _focusVisible: {
    outline: "3px solid token(colors.investment-blue-soft)",
    outlineOffset: "2px",
  },
  _disabled: {
    cursor: "not-allowed",
    bg: "#edf1f6",
    borderColor: "#edf1f6",
    color: "#8ca0ba",
  },
});

const buttonVariant: Record<InvestmentButtonVariant, string> = {
  primary: css({
    color: "white",
    bg: "investment-blue",
    backgroundImage: "linear-gradient(180deg, #3b7cff 0%, #2f6fed 100%)",
    border: "1px solid token(colors.investment-blue)",
    cursor: "pointer",
    boxShadow: "0 6px 14px rgba(47, 111, 237, 0.18)",
    _hover: { bg: "investment-blue-dark" },
  }),
  secondary: css({
    color: "investment-blue",
    bg: "white",
    border: "1px solid #86adff",
    cursor: "pointer",
    _hover: { bg: "investment-blue-soft" },
  }),
  text: css({
    color: "investment-blue",
    bg: "transparent",
    border: "1px solid transparent",
    px: "0",
    cursor: "pointer",
    _hover: { color: "investment-blue-dark" },
  }),
  icon: css({
    w: "10",
    px: "0",
    color: "#334155",
    bg: "#f1f4f8",
    border: "1px solid #e0e7f0",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    _hover: { bg: "#e2e8f0" },
  }),
  link: css({
    color: "investment-blue",
    bg: "transparent",
    border: "1px solid transparent",
    px: "0",
    cursor: "pointer",
    display: "inline-flex",
    gap: "2",
    alignItems: "center",
    _hover: { color: "investment-blue-dark" },
  }),
};
