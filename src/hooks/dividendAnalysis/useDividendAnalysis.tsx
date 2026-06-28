"use client";

import { useContext } from "react";
import { useStore } from "zustand";

import { DividendAnalysisStoreContext } from "@/stores/dividendAnalysis/provider";
import type {
  DividendAnalysisDetail,
  DividendAnalysisRequestStatus,
  DividendAnalysisStoreState,
  DividendEnterprise,
} from "@/stores/dividendAnalysis/store";

export type {
  DividendAnalysisDetail,
  DividendAnalysisRequestStatus,
  DividendAnalysisStoreState,
  DividendEnterprise,
};

export function useDividendAnalysis<T = DividendAnalysisStoreState>(
  selector: (state: DividendAnalysisStoreState) => T = (state) => state as T,
): T {
  const store = useContext(DividendAnalysisStoreContext);

  if (!store) {
    throw new Error(
      "useDividendAnalysis must be used within DividendAnalysisStoreProvider",
    );
  }

  return useStore(store, selector);
}
