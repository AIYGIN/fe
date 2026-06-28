"use client";

import { createContext, type ReactNode, useRef } from "react";

import {
  createDividendAnalysisStore,
  type DividendAnalysisStore,
  type DividendAnalysisStoreState,
} from "./store";

export const DividendAnalysisStoreContext =
  createContext<DividendAnalysisStore | null>(null);

export type DividendAnalysisStoreProviderProps = {
  children: ReactNode;
  initialState?: Partial<
    Pick<
      DividendAnalysisStoreState,
      | "overviewStatus"
      | "status"
      | "detailStatus"
      | "overview"
      | "enterprises"
      | "selectedSymbolId"
      | "detail"
      | "error"
    >
  >;
};

export function DividendAnalysisStoreProvider({
  children,
  initialState,
}: DividendAnalysisStoreProviderProps) {
  const storeRef = useRef<DividendAnalysisStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = createDividendAnalysisStore({ initialState });
  }

  return (
    <DividendAnalysisStoreContext.Provider value={storeRef.current}>
      {children}
    </DividendAnalysisStoreContext.Provider>
  );
}
