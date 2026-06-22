import { css } from "../../../../styled-system/css";
import { type InvestmentTone, scoreToTone, toneTokens } from "../shared";

export function ScoreProgress({
  score,
  tone = scoreToTone(score),
}: {
  score: number;
  tone?: InvestmentTone;
}) {
  const token = toneTokens[tone];
  const pct = Math.max(0, Math.min(100, score));

  return (
    <fieldset
      className={css({ minW: "32", border: "0", p: "0", m: "0" })}
      aria-label={`スコア ${score} / 100`}
    >
      <legend
        className={css({
          position: "absolute",
          w: "1px",
          h: "1px",
          p: "0",
          m: "-1px",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          border: "0",
        })}
      >
        スコア進捗
      </legend>
      <p className={css({ mb: "5", fontSize: "sm", fontWeight: "700" })}>
        {score}{" "}
        <span className={css({ color: "investment-muted" })}>/ 100</span>
      </p>
      <div
        className={css({
          h: "2",
          rounded: "full",
          bg: "#e9eef6",
          overflow: "hidden",
        })}
      >
        <span
          className={css({ display: "block", h: "full", rounded: "full" })}
          style={{ width: `${pct}%`, backgroundColor: token.ring }}
        />
      </div>
    </fieldset>
  );
}
