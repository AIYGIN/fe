import { css } from "../../../../styled-system/css";
import { ChevronIcon } from "../shared";

export function Breadcrumbs({ items }: { items: string[] }) {
  return (
    <nav aria-label="パンくずリスト">
      <ol
        className={css({
          display: "flex",
          alignItems: "center",
          gap: "2",
          flexWrap: "wrap",
        })}
      >
        {items.map((item, index) => (
          <li
            className={css({
              display: "flex",
              alignItems: "center",
              gap: "2",
              color:
                index === items.length - 1
                  ? "investment-text"
                  : "investment-muted",
              fontSize: "sm",
              fontWeight: "700",
            })}
            key={item}
          >
            {index > 0 ? <ChevronIcon /> : null}
            {item}
          </li>
        ))}
      </ol>
    </nav>
  );
}
