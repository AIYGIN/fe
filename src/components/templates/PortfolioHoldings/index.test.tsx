import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { PortfolioHoldingsViewState } from ".";
import { PortfolioHoldingsTemplate } from ".";

const loadedState = {
  holdingsStatus: "success",
  analysisStatus: "success",
  data: {
    holdings: [
      {
        holdingId: "hold-1",
        productName: "eMAXIS Slim 全世界株式",
        ratio: 62.4,
      },
      {
        holdingId: "hold-2",
        productName: "S&P 500 ETF",
        ratio: 37.6,
      },
    ],
    analysis: {
      sectorAllocations: [
        { name: "情報技術", ratio: 28.5 },
        { name: "金融", ratio: 16.2 },
      ],
      constituents: [
        { name: "Apple", ratio: 7.8 },
        { name: "Microsoft", ratio: 6.9 },
      ],
      countryAllocations: [
        { name: "米国", ratio: 71.1 },
        { name: "日本", ratio: 8.4 },
      ],
    },
    lastUpdated: {
      holdings: "2026-06-25T09:00:00.000Z",
      analysis: "2026-06-25T09:05:00.000Z",
    },
  },
  error: null,
} satisfies PortfolioHoldingsViewState;

describe("PortfolioHoldingsTemplate", () => {
  it("holdings が取得済みで analysis が loading の間も保有商品を後続表示する", () => {
    render(
      <PortfolioHoldingsTemplate
        state={{ ...loadedState, analysisStatus: "loading" }}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "ポートフォリオ" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "保有商品" })).toHaveTextContent(
      "eMAXIS Slim 全世界株式",
    );
    expect(screen.getByRole("region", { name: "保有商品" })).toHaveTextContent(
      "62.4%",
    );
    expect(screen.getByText("分析を取得中")).toBeInTheDocument();
  });

  it("分析結果として比率内訳・構成銘柄・AIサマリーを表示する", () => {
    render(<PortfolioHoldingsTemplate state={loadedState} />);

    expect(screen.getByRole("region", { name: "資産配分" })).toHaveTextContent(
      "情報技術",
    );
    expect(screen.getByRole("region", { name: "資産配分" })).toHaveTextContent(
      "28.5%",
    );
    expect(screen.getByRole("region", { name: "構成銘柄" })).toHaveTextContent(
      "Apple",
    );
    expect(
      screen.getByRole("region", { name: "AIサマリー" }),
    ).toHaveTextContent("米国");
  });

  it("404 の場合は空状態として案内し、通常のエラーアラートを出さない", () => {
    render(
      <PortfolioHoldingsTemplate
        state={{
          holdingsStatus: "not-found",
          analysisStatus: "idle",
          data: null,
          error: null,
        }}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "ポートフォリオが見つかりません" }),
    ).toBeInTheDocument();
    expect(screen.getByText("保有商品はまだありません")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("取得エラーの場合は再試行できるエラー表示を出す", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(
      <PortfolioHoldingsTemplate
        state={{
          holdingsStatus: "error",
          analysisStatus: "idle",
          data: null,
          error: "ポートフォリオを取得できませんでした。",
        }}
        onRetry={onRetry}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "ポートフォリオを取得できませんでした。",
    );

    await user.click(screen.getByRole("button", { name: "再試行" }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("証券口座連携は外部リンクとして安全な属性を付与する", () => {
    render(
      <PortfolioHoldingsTemplate
        state={loadedState}
        brokerLinkUrl="https://www.rakuten-sec.co.jp/"
      />,
    );

    const link = screen.getByRole("link", { name: "証券口座を連携" });
    expect(link).toHaveAttribute("href", "https://www.rakuten-sec.co.jp/");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
