import { css } from "../../../../../styled-system/css";
import { InvestmentButton } from "../Button";

export function ConfirmDialog({
  title = "確認",
  description = "この操作を実行しますか？",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div
      className={css({
        rounded: "lg",
        border: "1px solid #cbd5e1",
        bg: "white",
        p: "4",
      })}
      role="dialog"
      aria-modal="true"
      aria-labelledby="investment-dialog-title"
    >
      <div
        className={css({
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        })}
      >
        <h3
          className={css({ fontSize: "md", fontWeight: "800" })}
          id="investment-dialog-title"
        >
          {title}
        </h3>
        <button
          className={css({ color: "investment-muted", cursor: "pointer" })}
          type="button"
          aria-label="閉じる"
        >
          ×
        </button>
      </div>
      <p
        className={css({
          mt: "5",
          mb: "8",
          color: "investment-muted",
          fontSize: "sm",
        })}
      >
        {description}
      </p>
      <div
        className={css({
          display: "flex",
          justifyContent: "flex-end",
          gap: "3",
        })}
      >
        <InvestmentButton variant="secondary">キャンセル</InvestmentButton>
        <InvestmentButton>実行する</InvestmentButton>
      </div>
    </div>
  );
}
