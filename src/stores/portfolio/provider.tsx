"use client";

import { createContext, type ReactNode, useRef } from "react";

import {
  createPortfolioStore,
  type PortfolioStore,
  type PortfolioStoreState,
} from "./store";

export const PortfolioStoreContext = createContext<PortfolioStore | null>(null);

export type PortfolioStoreProviderProps = {
  children: ReactNode;
  initialState?: Partial<
    Pick<
      PortfolioStoreState,
      "holdingsStatus" | "analysisStatus" | "data" | "error"
    >
  >;
};

export function PortfolioStoreProvider({
  children,
  initialState,
}: PortfolioStoreProviderProps) {
  const storeRef = useRef<PortfolioStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = createPortfolioStore({ initialState });
  }

  return (
    <PortfolioStoreContext.Provider value={storeRef.current}>
      {children}
    </PortfolioStoreContext.Provider>
  );
}
