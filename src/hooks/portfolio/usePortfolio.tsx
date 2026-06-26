"use client";

import { useContext } from "react";
import { useStore } from "zustand";

import { PortfolioStoreContext } from "@/stores/portfolio/provider";
import type {
  PortfolioRequestStatus,
  PortfolioStoreState,
} from "@/stores/portfolio/store";

export type { PortfolioRequestStatus };

export function usePortfolio<T = PortfolioStoreState>(
  selector: (state: PortfolioStoreState) => T = (state) => state as T,
): T {
  const store = useContext(PortfolioStoreContext);

  if (!store) {
    throw new Error("usePortfolio must be used within PortfolioStoreProvider");
  }

  return useStore(store, selector);
}
