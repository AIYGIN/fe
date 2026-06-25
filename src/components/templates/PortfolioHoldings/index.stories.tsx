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
      canvas.getByRole("region", { name: "保有商品" }),
    ).toHaveTextContent("eMAXIS Slim 全世界株式");
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
