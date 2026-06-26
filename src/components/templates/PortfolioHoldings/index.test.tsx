import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";

import { apiMockServer } from "@/apis/api.mock-server";

import {
  PortfolioHoldingsPage,
  PortfolioHoldingsTemplate,
  type PortfolioHoldingsViewState,
} from "./index";

const loadedState: PortfolioHoldingsViewState = {
  holdingsStatus: "success",
  analysisStatus: "success",
  data: {
    holdings: [
      {
        holdingId: "hold-1",
        productName: "eMAXIS Slim 全世界株式（オルカン）",
        ratio: 80,
      },
      {
        holdingId: "hold-2",
        productName: "SCHD（Schwab U.S. Dividend Equity ETF）",
        ratio: 20,
      },
    ],
    analysis: {
      sectorAllocations: [
        { name: "情報技術", ratio: 26 },
        { name: "金融", ratio: 14.2 },
        { name: "ヘルスケア", ratio: 12.1 },
      ],
      constituents: [
        { name: "Apple Inc.", ratio: 4.2 },
        { name: "Microsoft Corp.", ratio: 3.6 },
      ],
      countryAllocations: [
        { name: "米国", ratio: 59.1 },
        { name: "日本", ratio: 6.1 },
      ],
    },
    lastUpdated: {
      holdings: "2026-06-25T09:00:00.000Z",
      analysis: "2026-06-25T09:05:00.000Z",
    },
  },
  error: null,
};

describe("PortfolioHoldingsTemplate", () => {
  it("参考画像の主要領域を分割コンポーネントで表示する", () => {
    render(<PortfolioHoldingsTemplate state={loadedState} />);

    expect(
      screen.getByRole("heading", { name: "ポートフォリオ" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "保有商品（手入力）" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "SBI証券で確認する" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "セクター比率（全体）" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "上位10銘柄（全体）" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "国・地域別比率（全体）" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "偏りチェック（自動判定）" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "AI要約（Coming Soon）" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "データについて" }),
    ).toBeInTheDocument();
  });

  it("保有商品とOrval由来の分析データを表示する", () => {
    render(<PortfolioHoldingsTemplate state={loadedState} />);

    expect(
      screen.getByText("eMAXIS Slim 全世界株式（オルカン）"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("SCHD（Schwab U.S. Dividend Equity ETF）"),
    ).toBeInTheDocument();
    expect(screen.getByText("情報技術")).toBeInTheDocument();
    expect(screen.getByText("Apple Inc.")).toBeInTheDocument();
    expect(screen.getByText("米国")).toBeInTheDocument();
    expect(screen.getAllByText("80%").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("20%").length).toBeGreaterThanOrEqual(1);
  });

  it("analysis loading中も他セクションを表示し、AI要約だけbusyにする", () => {
    render(
      <PortfolioHoldingsTemplate
        state={{ ...loadedState, analysisStatus: "loading" }}
      />,
    );

    expect(screen.getByText("情報技術")).toBeInTheDocument();
    expect(screen.getByText("Apple Inc.")).toBeInTheDocument();
    expect(
      screen.getByText("AIによるポートフォリオ分析と要約を準備中です"),
    ).toBeInTheDocument();
  });

  it("404は画面全体の状態として表示する", () => {
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
  });

  it("errorは画面全体の状態としてretryできる", async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();

    render(
      <PortfolioHoldingsTemplate
        onRetry={onRetry}
        state={{
          holdingsStatus: "error",
          analysisStatus: "idle",
          data: null,
          error: "ポートフォリオを取得できませんでした。",
        }}
      />,
    );

    await user.click(screen.getByRole("button", { name: "再試行" }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("証券リンクは未実装導線として外部リンクを開く", () => {
    render(
      <PortfolioHoldingsTemplate
        brokerLinkUrl="https://www.rakuten-sec.co.jp/"
        state={loadedState}
      />,
    );

    const link = screen.getByRole("link", {
      name: "SBI証券 NISAポートフォリオへ ↗",
    });
    expect(link).toHaveAttribute("href", "https://www.rakuten-sec.co.jp/");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("PortfolioHoldingsPageはProvider配下でStoreからloadして表示する", async () => {
    apiMockServer.use(
      http.get("*/portfolio/holdings", () =>
        HttpResponse.json({
          holdings: [
            {
              holdingId: "hold-1",
              productName: "eMAXIS Slim 全世界株式",
              ratio: 62.4,
            },
          ],
          lastUpdated: "2026-06-25T09:00:00.000Z",
        }),
      ),
      http.get("*/portfolio/analysis", () =>
        HttpResponse.json({
          sectorAllocations: [{ name: "情報技術", ratio: 28.5 }],
          constituents: [{ name: "Apple", ratio: 7.8 }],
          countryAllocations: [{ name: "米国", ratio: 71.1 }],
          lastUpdated: "2026-06-25T09:05:00.000Z",
        }),
      ),
    );

    render(<PortfolioHoldingsPage />);

    expect(
      await screen.findByText("eMAXIS Slim 全世界株式"),
    ).toBeInTheDocument();
    expect(await screen.findByText("Apple")).toBeInTheDocument();
  });
});
