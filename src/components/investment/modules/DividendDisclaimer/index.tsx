import { WarningCard } from "@/components/investment";

import { css } from "../../../../../styled-system/css";

type DividendDisclaimerProps = {
  disclaimers: string[];
  isRealtime?: boolean;
  dataAsOfDate: string;
  updatedAt: string;
};

export function DividendDisclaimer({
  dataAsOfDate,
  disclaimers,
  isRealtime,
  updatedAt,
}: DividendDisclaimerProps) {
  const note = "画面上部のデータ更新日時とデータ基準日を確認してください。";

  return (
    <aside
      aria-label={`データ注記 ${formatDateTime(updatedAt)} ${dataAsOfDate}`}
      className={css({
        border: "1px solid",
        borderColor: "investment-border",
        borderRadius: "8px",
        bg: "#f8fafc",
        color: "investment-muted",
        p: "4",
      })}
    >
      {isRealtime === false ? (
        <p className={css({ fontSize: "sm", fontWeight: "800", mb: "3" })}>
          リアルタイムデータではありません
        </p>
      ) : null}
      <WarningCard title="データについて">{note}</WarningCard>
      {disclaimers.length > 0 ? (
        <ul
          className={css({
            display: "grid",
            gap: "1",
            listStyle: "disc",
            mt: "3",
            pl: "5",
          })}
        >
          {disclaimers.map((disclaimer) => (
            <li className={css({ fontSize: "sm" })} key={disclaimer}>
              {disclaimer}
            </li>
          ))}
        </ul>
      ) : null}
    </aside>
  );
}

function formatDateTime(value: string) {
  return value.slice(0, 16).replace("T", " ");
}
