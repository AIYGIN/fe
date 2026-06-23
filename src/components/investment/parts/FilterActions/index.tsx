import { css } from "../../../../../styled-system/css";
import { InvestmentButton } from "../Button";
import { DownChevronIcon, FilterIcon, SortIcon } from "../icons";

export function FilterActions() {
  return (
    <div className={css({ display: "flex", gap: "2", flexWrap: "wrap" })}>
      <InvestmentButton variant="filter">
        <SortIcon />
        並び替え
        <DownChevronIcon />
      </InvestmentButton>
      <InvestmentButton variant="filter">
        <FilterIcon />
        フィルター
      </InvestmentButton>
    </div>
  );
}
