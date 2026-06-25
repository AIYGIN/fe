import { act, renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { apiMockServer } from "@/apis/api.mock-server";
import type {
  GetPortfolioAnalysisResponseDto,
  GetPortfolioHoldingsResponseDto,
} from "@/apis/generated/model";

import { usePortfolio } from "./usePortfolio";

const holdingsResponse = {
  holdings: [
    {
      holdingId: "hold-1",
      productName: "eMAXIS Slim 全世界株式",
      ratio: 62.4,
    },
  ],
  lastUpdated: "2026-06-25T09:00:00.000Z",
} satisfies GetPortfolioHoldingsResponseDto;

const analysisResponse = {
  sectorAllocations: [{ name: "情報技術", ratio: 28.5 }],
  constituents: [{ name: "Apple", ratio: 7.8 }],
  countryAllocations: [{ name: "米国", ratio: 71.1 }],
  lastUpdated: "2026-06-25T09:05:00.000Z",
} satisfies GetPortfolioAnalysisResponseDto;

function mockPortfolioSuccess() {
  apiMockServer.use(
    http.get("*/portfolio/holdings", () => HttpResponse.json(holdingsResponse)),
    http.get("*/portfolio/analysis", () => HttpResponse.json(analysisResponse)),
  );
}

describe("usePortfolio", () => {
  it("load で holdings と analysis を取得し、成功状態とデータを保持する", async () => {
    mockPortfolioSuccess();
    const { result } = renderHook(() => usePortfolio());

    expect(result.current.holdingsStatus).toBe("idle");
    expect(result.current.analysisStatus).toBe("idle");

    await act(async () => {
      await result.current.load();
    });

    await waitFor(() => {
      expect(result.current.holdingsStatus).toBe("success");
      expect(result.current.analysisStatus).toBe("success");
    });
    expect(result.current.data?.holdings).toEqual(holdingsResponse.holdings);
    expect(result.current.data?.analysis.constituents).toEqual(
      analysisResponse.constituents,
    );
  });

  it("API エラー後に resetError でエラー表示だけを初期化できる", async () => {
    apiMockServer.use(
      http.get("*/portfolio/holdings", () =>
        HttpResponse.json({ message: "server error" }, { status: 500 }),
      ),
      http.get("*/portfolio/analysis", () =>
        HttpResponse.json(analysisResponse),
      ),
    );
    const { result } = renderHook(() => usePortfolio());

    await act(async () => {
      await result.current.load();
    });

    await waitFor(() => {
      expect(result.current.holdingsStatus).toBe("error");
      expect(result.current.error).toBe(
        "ポートフォリオを取得できませんでした。",
      );
    });

    act(() => {
      result.current.resetError();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.holdingsStatus).toBe("idle");
    expect(result.current.analysisStatus).toBe("idle");
  });
});
