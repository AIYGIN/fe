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
  return (
    <aside
      aria-label={`データ注記 ${formatDateTime(updatedAt)} ${dataAsOfDate}`}
      className={disclaimerClass}
    >
      <p className={mainNoteClass}>
        <span className={infoIconClass} aria-hidden="true">
          i
        </span>
        本画面は高配当株の安全性を分析するものであり、特定の銘柄の売買を推奨するものではありません。
      </p>
      <div className={metaClass}>
        <span>データ基準日: {dataAsOfDate}</span>
        <span>更新日時: {formatDateTime(updatedAt)}</span>
        {isRealtime === false ? (
          <span>リアルタイムデータではありません</span>
        ) : null}
      </div>
      {disclaimers.length > 0 ? (
        <ul className={listClass}>
          {disclaimers.map((disclaimer) => (
            <li key={disclaimer}>{disclaimer}</li>
          ))}
        </ul>
      ) : null}
    </aside>
  );
}

const disclaimerClass = css({
  bg: "#f3f8ff",
  border: "1px solid token(colors.investment-border-soft)",
  borderRadius: "8px",
  color: "investment-muted",
  display: "grid",
  gap: "2",
  p: "3",
});

const mainNoteClass = css({
  alignItems: "center",
  color: "investment-blue",
  display: "flex",
  fontSize: "sm",
  fontWeight: "900",
  gap: "2",
});

const infoIconClass = css({
  alignItems: "center",
  border: "2px solid currentColor",
  borderRadius: "999px",
  display: "inline-flex",
  flexShrink: 0,
  fontSize: "2xs",
  fontWeight: "900",
  h: "4",
  justifyContent: "center",
  lineHeight: 1,
  w: "4",
});

const metaClass = css({
  display: "flex",
  flexWrap: "wrap",
  fontSize: "xs",
  fontWeight: "800",
  gap: "3",
});

const listClass = css({
  display: "grid",
  fontSize: "xs",
  fontWeight: "700",
  gap: "1",
  listStyle: "disc",
  pl: "5",
});

function formatDateTime(value: string) {
  return value.slice(0, 16).replace("T", " ");
}
