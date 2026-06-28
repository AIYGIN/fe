import { devtools } from "zustand/middleware";
import { createStore } from "zustand/vanilla";

import {
  enterprisesControllerGetDividendAnalysis,
  enterprisesControllerGetQuantsInfo,
} from "@/apis/generated/dividend-analysis/dividend-analysis";
import type {
  EnterpriseQuantInfoDto,
  GetEnterpriseDividendAnalysisResponseDto,
  GetEnterpriseQuantsInfoResponseDto,
} from "@/apis/generated/model";

export type DividendAnalysisRequestStatus =
  | "idle"
  | "loading"
  | "success"
  | "empty"
  | "error";

export type DividendEnterprise = EnterpriseQuantInfoDto;
export type DividendAnalysisDetail = GetEnterpriseDividendAnalysisResponseDto;
export type DividendAnalysisOverview = GetEnterpriseQuantsInfoResponseDto;

type DividendAnalysisStoreOptions = {
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

export type DividendAnalysisStoreState = {
  overviewStatus: DividendAnalysisRequestStatus;
  status: DividendAnalysisRequestStatus;
  detailStatus: DividendAnalysisRequestStatus;
  overview: DividendAnalysisOverview | null;
  enterprises: DividendEnterprise[];
  selectedSymbolId: string | null;
  detail: DividendAnalysisDetail | null;
  error: string | null;
  load: () => Promise<void>;
  loadList: () => Promise<void>;
  loadDetail: (symbolId: string) => Promise<void>;
  selectSymbol: (symbolId: string) => Promise<void>;
  selectEnterprise: (symbolId: string) => Promise<void>;
  retry: () => Promise<void>;
  resetError: () => void;
};

const defaultState = {
  overviewStatus: "idle",
  status: "idle",
  detailStatus: "idle",
  overview: null,
  enterprises: [],
  selectedSymbolId: null,
  detail: null,
  error: null,
} satisfies Pick<
  DividendAnalysisStoreState,
  | "overviewStatus"
  | "status"
  | "detailStatus"
  | "overview"
  | "enterprises"
  | "selectedSymbolId"
  | "detail"
  | "error"
>;

export function createDividendAnalysisStore(
  options: DividendAnalysisStoreOptions = {},
) {
  const initialState = {
    ...defaultState,
    ...options.initialState,
  };

  return createStore<DividendAnalysisStoreState>()(
    devtools(
      (set, get) => {
        const loadDetail = async (symbolId: string) => {
          set(
            { detailStatus: "loading", selectedSymbolId: symbolId },
            false,
            "dividendAnalysis/detail:start",
          );

          try {
            const response =
              await enterprisesControllerGetDividendAnalysis(symbolId);
            if (response.status !== 200) {
              throw new Error("高配当分析データを取得できませんでした");
            }

            set(
              {
                detail: response.data,
                detailStatus: "success",
                selectedSymbolId: symbolId,
              },
              false,
              "dividendAnalysis/detail:success",
            );
          } catch {
            set(
              {
                detail: null,
                detailStatus: "error",
                error: "高配当分析データを取得できませんでした",
              },
              false,
              "dividendAnalysis/detail:error",
            );
          }
        };

        return {
          ...initialState,
          load: async () => {
            set(
              {
                detail: null,
                detailStatus: "idle",
                error: null,
                enterprises: [],
                overview: null,
                overviewStatus: "loading",
                status: "loading",
                selectedSymbolId: null,
              },
              false,
              "dividendAnalysis/overview:start",
            );

            try {
              const response = await enterprisesControllerGetQuantsInfo();
              if (response.status !== 200) {
                throw new Error("高配当分析データを取得できませんでした");
              }

              const enterprises = [...response.data.enterprises].sort(
                (left, right) => right.totalScore - left.totalScore,
              );
              const overview = { ...response.data, enterprises };

              set(
                {
                  overview,
                  enterprises,
                  overviewStatus:
                    enterprises.length === 0 ? "empty" : "success",
                  status: enterprises.length === 0 ? "empty" : "success",
                  selectedSymbolId: enterprises[0]?.symbolId ?? null,
                },
                false,
                "dividendAnalysis/overview:success",
              );

              if (enterprises[0]) {
                await loadDetail(enterprises[0].symbolId);
              }
            } catch {
              set(
                {
                  detail: null,
                  detailStatus: "idle",
                  error: "高配当分析データを取得できませんでした",
                  enterprises: [],
                  overview: null,
                  overviewStatus: "error",
                  status: "error",
                  selectedSymbolId: null,
                },
                false,
                "dividendAnalysis/overview:error",
              );
            }
          },
          loadList: async () => {
            await get().load();
          },
          loadDetail,
          selectSymbol: async (symbolId: string) => {
            if (get().selectedSymbolId === symbolId && get().detail) {
              return;
            }

            await loadDetail(symbolId);
          },
          selectEnterprise: async (symbolId: string) => {
            await get().selectSymbol(symbolId);
          },
          retry: async () => {
            if (get().overviewStatus === "error" || !get().overview) {
              await get().loadList();
              return;
            }

            const symbolId = get().selectedSymbolId;
            if (symbolId) {
              await get().loadDetail(symbolId);
            }
          },
          resetError: () =>
            set(
              {
                detailStatus:
                  get().detailStatus === "error" ? "idle" : get().detailStatus,
                error: null,
                overviewStatus:
                  get().overviewStatus === "error"
                    ? "idle"
                    : get().overviewStatus,
                status: get().status === "error" ? "idle" : get().status,
              },
              false,
              "dividendAnalysis/reset-error",
            ),
        };
      },
      { name: "dividend-analysis-store" },
    ),
  );
}

export type DividendAnalysisStore = ReturnType<
  typeof createDividendAnalysisStore
>;
