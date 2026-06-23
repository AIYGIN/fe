import { css } from "../../../../styled-system/css";

export const itemLabel = css({
  display: "block",
  mb: "3",
  fontSize: "xs",
  fontWeight: "700",
  color: "investment-text",
});

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
