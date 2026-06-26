import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { PortfolioHoldingsTemplate, type PortfolioHoldingsViewState } from ".";

const defaultState = {
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
        { name: "情報技術", ratio: 26.0 },
        { name: "金融", ratio: 14.2 },
        { name: "ヘルスケア", ratio: 12.1 },
        { name: "一般消費財", ratio: 11.0 },
        { name: "資本財", ratio: 8.8 },
        { name: "生活必需品", ratio: 6.8 },
        { name: "エネルギー", ratio: 4.0 },
        { name: "公益事業", ratio: 3.1 },
        { name: "通信サービス", ratio: 2.9 },
        { name: "その他", ratio: 11.1 },
      ],
      constituents: [
        { name: "Apple Inc.", ratio: 4.2 },
        { name: "Microsoft Corp.", ratio: 3.6 },
        { name: "NVIDIA Corp.", ratio: 2.8 },
        { name: "Amazon.com Inc.", ratio: 2.1 },
        { name: "Alphabet Inc. Class A", ratio: 1.8 },
        { name: "Meta Platforms Inc. Class A", ratio: 1.6 },
        { name: "Berkshire Hathaway Inc. Class B", ratio: 1.4 },
        { name: "Eli Lilly and Company", ratio: 1.2 },
        { name: "JPMorgan Chase & Co.", ratio: 1.1 },
        { name: "Visa Inc. Class A", ratio: 1.0 },
      ],
      countryAllocations: [
        { name: "米国", ratio: 59.1 },
        { name: "日本", ratio: 6.1 },
        { name: "イギリス", ratio: 3.6 },
        { name: "カナダ", ratio: 2.8 },
        { name: "フランス", ratio: 2.7 },
        { name: "スイス", ratio: 2.4 },
        { name: "ドイツ", ratio: 2.2 },
        { name: "オーストラリア", ratio: 2.0 },
        { name: "その他", ratio: 19.1 },
      ],
    },
    lastUpdated: {
      holdings: "2026-06-25T09:00:00.000Z",
      analysis: "2026-06-25T09:05:00.000Z",
    },
  },
  error: null,
} satisfies PortfolioHoldingsViewState;

const meta = {
  title: "templates/PortfolioHoldings",
  component: PortfolioHoldingsTemplate,
  args: {
    state: defaultState,
    brokerLinkUrl: "https://www.rakuten-sec.co.jp/",
  },
} satisfies Meta<typeof PortfolioHoldingsTemplate>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("heading", { name: "ポートフォリオ" }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("heading", { name: "保有商品（手入力）" }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByText("eMAXIS Slim 全世界株式"),
    ).toBeInTheDocument();
  },
};

export const HoldingsLoading: Story = {
  args: {
    state: {
      holdingsStatus: "loading",
      analysisStatus: "idle",
      data: null,
      error: null,
    },
  },
};

export const AnalysisLoading: Story = {
  args: {
    state: {
      ...defaultState,
      analysisStatus: "loading",
    },
  },
};

export const Empty404: Story = {
  args: {
    state: {
      holdingsStatus: "not-found",
      analysisStatus: "idle",
      data: null,
      error: null,
    },
  },
};

const ErrorStory: Story = {
  args: {
    state: {
      holdingsStatus: "error",
      analysisStatus: "idle",
      data: null,
      error: "ポートフォリオを取得できませんでした。",
    },
  },
};

export { ErrorStory as Error };

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};
