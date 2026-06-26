import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  loadPortfolioAnalysis,
  loadPortfolioHoldings,
  PortfolioLoadError,
} from "@/lib/pages/portfolio/holdings";

import { usePortfolio } from "./usePortfolio";

vi.mock("@/lib/pages/portfolio/holdings", () => {
  class PortfolioLoadError extends Error {
    constructor(
      message: string,
      readonly status: number,
      readonly kind: "not-found" | "error",
    ) {
      super(message);
      this.name = "PortfolioLoadError";
    }
  }

  return {
    loadPortfolioHoldings: vi.fn(),
    loadPortfolioAnalysis: vi.fn(),
    PortfolioLoadError,
  };
});

const holdingsData = {
  holdings: [
    {
      holdingId: "hold-1",
      productName: "eMAXIS Slim 全世界株式（オルカン）",
      ratio: 80,
    },
  ],
  lastUpdated: {
    holdings: "2026-06-25T09:00:00.000Z",
    analysis: "",
  },
};

const analysisData = {
  analysis: {
    sectorAllocations: [{ name: "情報技術", ratio: 26 }],
    constituents: [{ name: "Apple Inc.", ratio: 4.2 }],
    countryAllocations: [{ name: "米国", ratio: 59.1 }],
  },
  lastUpdated: {
    holdings: "",
    analysis: "2026-06-25T09:05:00.000Z",
  },
};

describe("usePortfolio", () => {
  beforeEach(() => {
    vi.mocked(loadPortfolioHoldings).mockReset();
    vi.mocked(loadPortfolioAnalysis).mockReset();
  });

  it("保有商品成功後は画面を表示し、analysis取得中だけloadingにする", async () => {
    let resolveAnalysis: (value: typeof analysisData) => void = () => {};
    vi.mocked(loadPortfolioHoldings).mockResolvedValue(holdingsData);
    vi.mocked(loadPortfolioAnalysis).mockReturnValue(
      new Promise((resolve) => {
        resolveAnalysis = resolve;
      }),
    );

    const { result } = renderHook(() => usePortfolio());

    act(() => {
      void result.current.load();
    });

    await waitFor(() => {
      expect(result.current.holdingsStatus).toBe("success");
      expect(result.current.analysisStatus).toBe("loading");
    });
    expect(result.current.data?.holdings).toEqual(holdingsData.holdings);
    expect(result.current.data?.analysis.constituents).toEqual([]);

    await act(async () => {
      resolveAnalysis(analysisData);
    });

    await waitFor(() => {
      expect(result.current.analysisStatus).toBe("success");
    });
    expect(result.current.data?.analysis.constituents).toEqual([
      { name: "Apple Inc.", ratio: 4.2 },
    ]);
  });

  it("404は画面全体のnot-found状態に集約する", async () => {
    vi.mocked(loadPortfolioHoldings).mockRejectedValue(
      new PortfolioLoadError("not found", 404, "not-found"),
    );

    const { result } = renderHook(() => usePortfolio());

    await act(async () => {
      await result.current.load();
    });

    expect(result.current.holdingsStatus).toBe("not-found");
    expect(result.current.analysisStatus).toBe("not-found");
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe("保有商品はまだありません。");
  });

  it("errorは画面全体のerror状態に集約する", async () => {
    vi.mocked(loadPortfolioHoldings).mockRejectedValue(
      new PortfolioLoadError("server error", 500, "error"),
    );

    const { result } = renderHook(() => usePortfolio());

    await act(async () => {
      await result.current.load();
    });

    expect(result.current.holdingsStatus).toBe("error");
    expect(result.current.analysisStatus).toBe("error");
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe("時間をおいてもう一度お試しください。");
  });
});
