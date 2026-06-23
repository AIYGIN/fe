import { css } from "../../../../../styled-system/css";

export function ToggleSwitch({
  checked,
  label,
}: {
  checked?: boolean;
  label: string;
}) {
  return (
    <span
      className={css({
        display: "inline-flex",
        alignItems: "center",
        gap: "3",
        fontSize: "sm",
        fontWeight: "800",
      })}
    >
      <span
        className={css({
          position: "relative",
          w: "12",
          h: "6",
          rounded: "full",
          bg: checked ? "investment-green" : "#e2e8f0",
        })}
        aria-hidden="true"
      >
        <span
          className={css({
            position: "absolute",
            top: "0.5",
            left: checked ? "6.5" : "0.5",
            w: "5",
            h: "5",
            rounded: "full",
            bg: "white",
            boxShadow: "0 1px 4px rgba(15, 23, 42, 0.22)",
          })}
        />
      </span>
      {label}
    </span>
  );
}
