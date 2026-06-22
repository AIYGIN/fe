import { css, cx } from "../../../../styled-system/css";
import { StatusBadge } from "../StatusBadge";
import { toneForegroundClass, toneLabel } from "../shared";

export type InvestmentTableRow = {
  name: string;
  sector: string;
  score: number;
  tone: "safe" | "watch" | "warning" | "danger";
  yieldRate: string;
};

export function InvestmentTable({
  rows = defaultRows,
}: {
  rows?: InvestmentTableRow[];
}) {
  return (
    <table
      className={css({ w: "full", borderCollapse: "collapse", fontSize: "sm" })}
    >
      <thead>
        <tr className={css({ color: "investment-muted", textAlign: "left" })}>
          {["銘柄", "セクター", "スコア", "判定", "利回り"].map((header) => (
            <th className={tableCellHeader} key={header} scope="col">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(({ name, sector, score, tone, yieldRate }) => (
          <tr
            className={css({
              borderTop: "1px solid token(colors.investment-border-soft)",
            })}
            key={name}
          >
            <td className={tableCell}>{name}</td>
            <td className={tableCell}>{sector}</td>
            <td
              className={cx(
                tableCell,
                css({
                  fontSize: "xl",
                  fontWeight: "800",
                }),
                toneForegroundClass[tone],
              )}
            >
              {score}
            </td>
            <td className={tableCell}>
              <StatusBadge tone={tone}>{toneLabel[tone]}</StatusBadge>
            </td>
            <td className={tableCell}>{yieldRate}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const defaultRows: InvestmentTableRow[] = [
  {
    name: "三菱商事（8058）",
    sector: "商社",
    score: 92,
    tone: "safe",
    yieldRate: "3.7%",
  },
  {
    name: "NTT（9432）",
    sector: "通信",
    score: 88,
    tone: "safe",
    yieldRate: "3.2%",
  },
  {
    name: "三菱UFJ FG（8306）",
    sector: "銀行",
    score: 76,
    tone: "watch",
    yieldRate: "4.1%",
  },
];

const tableCellHeader = css({ px: "3", py: "2", fontWeight: "700" });
const tableCell = css({
  px: "3",
  py: "3",
  fontWeight: "700",
  color: "investment-text",
});
