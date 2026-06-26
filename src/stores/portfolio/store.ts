import { devtools } from "zustand/middleware";
import { createStore } from "zustand/vanilla";

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

type PortfolioStoreOptions = {
  initialState?: Partial<
    Pick<
      PortfolioStoreState,
      "holdingsStatus" | "analysisStatus" | "data" | "error"
    >
  >;
};

export type PortfolioStoreState = {
  holdingsStatus: PortfolioRequestStatus;
  analysisStatus: PortfolioRequestStatus;
  data: PortfolioData | null;
  error: string | null;
  load: () => Promise<void>;
  loadPortfolio: () => Promise<void>;
  resetError: () => void;
};

const defaultState = {
  holdingsStatus: "idle",
  analysisStatus: "idle",
  data: null,
  error: null,
} satisfies Pick<
  PortfolioStoreState,
  "holdingsStatus" | "analysisStatus" | "data" | "error"
>;

export function createPortfolioStore(options: PortfolioStoreOptions = {}) {
  const initialState = {
    ...defaultState,
    ...options.initialState,
  };

  return createStore<PortfolioStoreState>()(
    devtools(
      (set) => {
        const load = async () => {
          set(
            {
              analysisStatus: "idle",
              data: null,
              error: null,
              holdingsStatus: "loading",
            },
            false,
            "portfolio/load:start",
          );

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

            set(
              {
                analysisStatus: "loading",
                data: emptyData,
                holdingsStatus: "success",
              },
              false,
              "portfolio/load:holdings-success",
            );

            const analysisData = await loadPortfolioAnalysis(
              holdingsData.holdings,
            );

            set(
              {
                analysisStatus: "success",
                data: {
                  holdings: holdingsData.holdings,
                  analysis: analysisData.analysis,
                  lastUpdated: {
                    holdings: holdingsData.lastUpdated.holdings,
                    analysis: analysisData.lastUpdated.analysis,
                  },
                },
              },
              false,
              "portfolio/load:analysis-success",
            );
          } catch (caughtError) {
            const loadError =
              caughtError instanceof PortfolioLoadError
                ? caughtError
                : new PortfolioLoadError(
                    "Portfolio holdings could not be loaded.",
                    500,
                    "error",
                  );

            set(
              {
                analysisStatus: loadError.kind,
                data: null,
                error:
                  loadError.kind === "not-found"
                    ? "保有商品はまだありません。"
                    : "時間をおいてもう一度お試しください。",
                holdingsStatus: loadError.kind,
              },
              false,
              `portfolio/load:${loadError.kind}`,
            );
          }
        };

        return {
          ...initialState,
          load,
          loadPortfolio: load,
          resetError: () =>
            set(
              (state) => ({
                analysisStatus:
                  state.analysisStatus === "error" ||
                  state.analysisStatus === "not-found"
                    ? "idle"
                    : state.analysisStatus,
                error: null,
                holdingsStatus:
                  state.holdingsStatus === "error" ||
                  state.holdingsStatus === "not-found"
                    ? "idle"
                    : state.holdingsStatus,
              }),
              false,
              "portfolio/reset-error",
            ),
        };
      },
      { name: "portfolio-store" },
    ),
  );
}

export type PortfolioStore = ReturnType<typeof createPortfolioStore>;
