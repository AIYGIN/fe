"use client";

import { useCallback, useState } from "react";
import type { PortfolioData } from "@/lib/pages/portfolio/holdings";
import {
  loadPortfolioAnalysis,
  loadPortfolioHoldings,
  PortfolioLoadError,
} from "@/lib/pages/portfolio/holdings";

export type PortfolioRequestStatus =
  | "idle"
  | "loading"
  | "success"
  | "not-found"
  | "error";

export type PortfolioState = {
  holdingsStatus: PortfolioRequestStatus;
  analysisStatus: PortfolioRequestStatus;
  data: PortfolioData | null;
  error: string | null;
  loadPortfolio: () => Promise<void>;
  load: () => Promise<void>;
  resetError: () => void;
};

export function usePortfolio(): PortfolioState {
  const [holdingsStatus, setHoldingsStatus] =
    useState<PortfolioRequestStatus>("idle");
  const [analysisStatus, setAnalysisStatus] =
    useState<PortfolioRequestStatus>("idle");
  const [data, setData] = useState<PortfolioData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setHoldingsStatus("loading");
    setAnalysisStatus("idle");
    setError(null);
    setData(null);

    try {
      const holdingsData = await loadPortfolioHoldings();
      const partialPortfolio: PortfolioData = {
        holdings: holdingsData.holdings,
        analysis: {
          sectorAllocations: [],
          constituents: [],
          countryAllocations: [],
        },
        lastUpdated: {
          holdings: holdingsData.lastUpdated.holdings,
          analysis: holdingsData.lastUpdated.holdings,
        },
      };
      setData(partialPortfolio);
      setHoldingsStatus("success");
      setAnalysisStatus("loading");

      const analysisData = await loadPortfolioAnalysis(holdingsData.holdings);
      setData({
        ...partialPortfolio,
        analysis: analysisData.analysis,
        lastUpdated: {
          holdings: holdingsData.lastUpdated.holdings,
          analysis: analysisData.lastUpdated.analysis,
        },
      });
      setAnalysisStatus("success");
    } catch (caught) {
      if (caught instanceof PortfolioLoadError && caught.kind === "not-found") {
        setData(null);
        setHoldingsStatus("not-found");
        setAnalysisStatus("idle");
        return;
      }

      setHoldingsStatus((status) => (status === "success" ? status : "error"));
      setAnalysisStatus("error");
      setError("ポートフォリオを取得できませんでした。");
    }
  }, []);

  const resetError = useCallback(() => {
    setError(null);
    setHoldingsStatus((status) => (status === "error" ? "idle" : status));
    setAnalysisStatus((status) => (status === "error" ? "idle" : status));
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
