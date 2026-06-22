import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  ConfirmDialog,
  InvestmentButton,
  InvestmentTable,
  InvestmentTextField,
  ScoreBadge,
  StatusBadge,
} from ".";

describe("investment components", () => {
  it("主要コンポーネントを再利用可能な公開entrypointから描画できる", () => {
    const { container } = render(
      <div>
        <InvestmentButton>実行する</InvestmentButton>
        <InvestmentTextField
          label="検索入力"
          placeholder="銘柄名・コードを検索"
        />
        <StatusBadge tone="danger">Critical</StatusBadge>
        <ScoreBadge score={76} />
        <InvestmentTable />
        <ConfirmDialog />
      </div>,
    );

    expect(
      screen.getAllByRole("button", { name: "実行する" })[0],
    ).toBeEnabled();
    expect(screen.getByLabelText("検索入力")).toBeInTheDocument();
    expect(screen.getByText("Critical")).toBeInTheDocument();
    expect(
      screen.getByLabelText("スコア 76、注意しつつ良好"),
    ).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "確認" })).toBeInTheDocument();
    expect(container.firstChild).toMatchSnapshot();
  });
});
