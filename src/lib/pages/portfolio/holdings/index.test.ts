import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { apiMockServer } from "@/apis/api.mock-server";
import type {
  GetPortfolioAnalysisResponseDto,
  GetPortfolioHoldingsResponseDto,
} from "@/apis/generated/model";

import { loadPortfolio, type PortfolioLoadError } from ".";

const holdingsResponse = {
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
  lastUpdated: "2026-06-25T09:00:00.000Z",
} satisfies GetPortfolioHoldingsResponseDto;

const analysisResponse = {
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
  lastUpdated: "2026-06-25T09:05:00.000Z",
} satisfies GetPortfolioAnalysisResponseDto;

function mockPortfolioSuccess() {
  apiMockServer.use(
    http.get("*/portfolio/holdings", () => HttpResponse.json(holdingsResponse)),
    http.get("*/portfolio/analysis", () => HttpResponse.json(analysisResponse)),
  );
}

describe("loadPortfolio", () => {
  it("保有商品と分析結果を生成APIから取得して画面用データにまとめる", async () => {
    mockPortfolioSuccess();

    await expect(loadPortfolio()).resolves.toEqual({
      holdings: holdingsResponse.holdings,
      analysis: {
        sectorAllocations: analysisResponse.sectorAllocations,
        constituents: analysisResponse.constituents,
        countryAllocations: analysisResponse.countryAllocations,
      },
      lastUpdated: {
        holdings: holdingsResponse.lastUpdated,
        analysis: analysisResponse.lastUpdated,
      },
    });
  });

  it("holdings が 404 の場合は not-found として失敗する", async () => {
    apiMockServer.use(
      http.get("*/portfolio/holdings", () =>
        HttpResponse.json(
          { message: "portfolio holdings not found" },
          { status: 404 },
        ),
      ),
      http.get("*/portfolio/analysis", () =>
        HttpResponse.json(analysisResponse),
      ),
    );

    await expect(loadPortfolio()).rejects.toMatchObject({
      name: "PortfolioLoadError",
      status: 404,
      kind: "not-found",
    } satisfies Partial<PortfolioLoadError>);
  });

  it("analysis が失敗した場合は error として失敗する", async () => {
    apiMockServer.use(
      http.get("*/portfolio/holdings", () =>
        HttpResponse.json(holdingsResponse),
      ),
      http.get("*/portfolio/analysis", () =>
        HttpResponse.json(
          { message: "analysis service unavailable" },
          { status: 500 },
        ),
      ),
    );

    await expect(loadPortfolio()).rejects.toMatchObject({
      name: "PortfolioLoadError",
      status: 500,
      kind: "error",
    } satisfies Partial<PortfolioLoadError>);
  });
});
