import { waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  loadPortfolioAnalysis,
  loadPortfolioHoldings,
  PortfolioLoadError,
} from "@/lib/pages/portfolio/holdings";

import { createPortfolioStore } from "./store";

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

describe("createPortfolioStore", () => {
  beforeEach(() => {
    vi.mocked(loadPortfolioHoldings).mockReset();
    vi.mocked(loadPortfolioAnalysis).mockReset();
  });

  it("holdings成功後にanalysisだけloadingへ進め、完了後にPortfolioDataを保持する", async () => {
    let resolveAnalysis: (value: typeof analysisData) => void = () => {};
    vi.mocked(loadPortfolioHoldings).mockResolvedValue(holdingsData);
    vi.mocked(loadPortfolioAnalysis).mockReturnValue(
      new Promise((resolve) => {
        resolveAnalysis = resolve;
      }),
    );
    const store = createPortfolioStore();

    const loadPromise = store.getState().load();

    await waitFor(() => {
      expect(store.getState().holdingsStatus).toBe("success");
      expect(store.getState().analysisStatus).toBe("loading");
    });
    expect(store.getState().data?.holdings).toEqual(holdingsData.holdings);
    expect(store.getState().data?.analysis.constituents).toEqual([]);

    resolveAnalysis(analysisData);
    await loadPromise;

    expect(store.getState().analysisStatus).toBe("success");
    expect(store.getState().data?.analysis.constituents).toEqual([
      { name: "Apple Inc.", ratio: 4.2 },
    ]);
  });

  it("404は画面全体のnot-found状態に集約する", async () => {
    vi.mocked(loadPortfolioHoldings).mockRejectedValue(
      new PortfolioLoadError("not found", 404, "not-found"),
    );
    const store = createPortfolioStore();

    await store.getState().load();

    expect(store.getState().holdingsStatus).toBe("not-found");
    expect(store.getState().analysisStatus).toBe("not-found");
    expect(store.getState().data).toBeNull();
    expect(store.getState().error).toBe("保有商品はまだありません。");
  });

  it("resetErrorでerror/not-found状態だけidleへ戻す", async () => {
    vi.mocked(loadPortfolioHoldings).mockRejectedValue(
      new PortfolioLoadError("server error", 500, "error"),
    );
    const store = createPortfolioStore();

    await store.getState().load();
    store.getState().resetError();

    expect(store.getState().holdingsStatus).toBe("idle");
    expect(store.getState().analysisStatus).toBe("idle");
    expect(store.getState().error).toBeNull();
  });
});
