"use client";

import { useCallback, useState } from "react";

import {
  loadPortfolioAnalysis,
  loadPortfolioHoldings,
  type PortfolioData,
  PortfolioLoadError,
} from "@/lib/pages/portfolio/holdings";

export type PortfolioRequestStatus =
  | "idle"
  | "loading"
  | "success"
  | "not-found"
  | "error";

export function usePortfolio() {
  const [holdingsStatus, setHoldingsStatus] =
    useState<PortfolioRequestStatus>("idle");
  const [analysisStatus, setAnalysisStatus] =
    useState<PortfolioRequestStatus>("idle");
  const [data, setData] = useState<PortfolioData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetError = useCallback(() => {
    setError(null);
    if (holdingsStatus === "error" || holdingsStatus === "not-found") {
      setHoldingsStatus("idle");
    }
    if (analysisStatus === "error" || analysisStatus === "not-found") {
      setAnalysisStatus("idle");
    }
  }, [analysisStatus, holdingsStatus]);

  const load = useCallback(async () => {
    setError(null);
    setData(null);
    setHoldingsStatus("loading");
    setAnalysisStatus("idle");

    try {
      const holdingsData = await loadPortfolioHoldings();
      const emptyData: PortfolioData = {
        holdings: holdingsData.holdings,
        analysis: {
          sectorAllocations: [],
          constituents: [],
          countryAllocations: [],
        },
        lastUpdated: {
          holdings: holdingsData.lastUpdated.holdings,
          analysis: "",
        },
      };

      setData(emptyData);
      setHoldingsStatus("success");
      setAnalysisStatus("loading");

      const analysisData = await loadPortfolioAnalysis(holdingsData.holdings);
      setData({
        holdings: holdingsData.holdings,
        analysis: analysisData.analysis,
        lastUpdated: {
          holdings: holdingsData.lastUpdated.holdings,
          analysis: analysisData.lastUpdated.analysis,
        },
      });
      setAnalysisStatus("success");
    } catch (caughtError) {
      const loadError =
        caughtError instanceof PortfolioLoadError
          ? caughtError
          : new PortfolioLoadError(
              "Portfolio holdings could not be loaded.",
              500,
              "error",
            );

      setData(null);
      setError(
        loadError.kind === "not-found"
          ? "保有商品はまだありません。"
          : "時間をおいてもう一度お試しください。",
      );
      setHoldingsStatus(loadError.kind);
      setAnalysisStatus(loadError.kind);
    }
  }, []);

  return {
    holdingsStatus,
    analysisStatus,
    data,
    error,
    loadPortfolio: load,
    load,
    resetError,
  };
}
