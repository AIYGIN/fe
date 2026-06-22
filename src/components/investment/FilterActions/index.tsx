import { css } from "../../../../styled-system/css";
import { InvestmentButton } from "../Button";
import { FilterIcon, SortIcon } from "../shared";

export function FilterActions() {
  return (
    <div className={css({ display: "flex", gap: "3", flexWrap: "wrap" })}>
      <InvestmentButton variant="secondary">
        <SortIcon /> 並び替え⌄
      </InvestmentButton>
      <InvestmentButton variant="secondary">
        <FilterIcon /> フィルター
      </InvestmentButton>
    </div>
  );
}
