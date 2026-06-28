"use client";

import { InvestmentButton } from "@/components/investment";

import { css } from "../../../../../styled-system/css";

type DividendAnalysisRuleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DividendAnalysisRuleDialog({
  open,
  onOpenChange,
}: DividendAnalysisRuleDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      aria-labelledby="dividend-rule-dialog-title"
      aria-modal="true"
      className={css({
        bg: "rgba(15, 23, 42, 0.28)",
        display: "grid",
        inset: 0,
        placeItems: "center",
        position: "fixed",
        p: "4",
        zIndex: 10,
      })}
      role="dialog"
    >
      <section
        className={css({
          bg: "white",
          borderRadius: "8px",
          boxShadow: "0 20px 50px rgba(15, 23, 42, 0.18)",
          maxW: "lg",
          p: "6",
          w: "full",
        })}
      >
        <h2
          className={css({ fontSize: "lg", fontWeight: "900", m: 0 })}
          id="dividend-rule-dialog-title"
        >
          スコア算出ルール
        </h2>
        <p
          className={css({
            color: "investment-muted",
            fontSize: "sm",
            lineHeight: "1.7",
            mt: "4",
          })}
        >
          配当利回り、減配履歴、配当成長、配当性向、FCF、財務指標を参考スコアとして表示します。
          金融業のFCFは評価対象外として扱います。
        </p>
        <div
          className={css({
            display: "flex",
            justifyContent: "flex-end",
            mt: "6",
          })}
        >
          <InvestmentButton onClick={() => onOpenChange(false)}>
            閉じる
          </InvestmentButton>
        </div>
      </section>
    </div>
  );
}
