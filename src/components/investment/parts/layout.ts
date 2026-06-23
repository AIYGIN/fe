import { css } from "../../../../styled-system/css";

export const componentFrame = css({
  bg: "investment-surface",
  border: "1px solid token(colors.investment-border)",
  rounded: "lg",
  boxShadow: "0 1px 2px rgba(16, 26, 54, 0.03)",
  p: "5",
});

export const miniCard = css({
  minH: "28",
  p: "4",
  rounded: "lg",
  border: "1px solid token(colors.investment-border)",
  bg: "white",
  boxShadow: "0 1px 2px rgba(16, 26, 54, 0.025)",
});
