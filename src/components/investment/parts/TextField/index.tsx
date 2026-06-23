import type { ComponentPropsWithoutRef } from "react";
import { css, cx } from "../../../../../styled-system/css";
import { inputControl, inputShell, itemLabel } from "../form";
import { CalendarIcon, SearchIcon } from "../icons";

export type InvestmentTextFieldProps = ComponentPropsWithoutRef<"input"> & {
  label: string;
  icon?: "search" | "calendar";
};

export function InvestmentTextField({
  label,
  icon,
  className,
  ...props
}: InvestmentTextFieldProps) {
  return (
    <label className={cx(css({ display: "block" }), className)}>
      <span className={itemLabel}>{label}</span>
      <span className={inputShell}>
        {icon === "search" ? <SearchIcon /> : null}
        {icon === "calendar" ? <CalendarIcon /> : null}
        <input className={inputControl} {...props} />
      </span>
    </label>
  );
}

export function InvestmentSelectField({
  label,
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<"select"> & { label: string }) {
  return (
    <label className={cx(css({ display: "block" }), className)}>
      <span className={itemLabel}>{label}</span>
      <span className={inputShell}>
        <select className={inputControl} {...props}>
          {children}
        </select>
      </span>
    </label>
  );
}
