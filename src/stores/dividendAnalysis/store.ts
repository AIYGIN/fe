import { devtools } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import { enterprisesControllerGetDividendAnalysis } from "@/apis/generated/dividend-analysis/dividend-analysis";
import { enterprisesControllerGetQuantsInfo } from "@/apis/generated/enterprises/enterprises";
import type {
  EnterpriseQuantInfoDto,
  EnterpriseScoreBreakdownDto,
  GetEnterpriseDividendAnalysisResponseDto,
  GetEnterpriseQuantsInfoResponseDto,
} from "@/apis/generated/model";

export type DividendAnalysisRequestStatus =
  | "idle"
  | "loading"
  | "success"
  | "empty"
  | "error";

export type DividendEnterprise = EnterpriseQuantInfoDto & {
  sector?: string;
  totalScore: number;
  judgement: string;
  safetyLabel: "safe" | "neutral" | "watch";
  scoreBreakdown: EnterpriseScoreBreakdownDto;
  latestDividendYield: number;
  isFinancialBusiness: boolean;
  isFcfNotApplicable: boolean;
  updatedAt?: string;
  dataAsOfDate?: string;
};
export type DividendAnalysisDetail = GetEnterpriseDividendAnalysisResponseDto;
export type DividendAnalysisOverview =
  Partial<GetEnterpriseQuantsInfoResponseDto> & {
    enterprises: DividendEnterprise[];
    updatedAt: string;
    dataAsOfDate: string;
    isRealtime: boolean;
    disclaimers: string[];
  };

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

type LegacyQuantsInfoResponse = {
  enterprises?: EnterpriseQuantInfoDto[];
  updatedAt?: string;
  dataAsOfDate?: string;
  isRealtime?: boolean;
  disclaimers?: string[];
};

const emptyScoreBreakdown = {
  fcf: { score: 0, maxScore: 0, isNotApplicable: false },
  dividendCutHistory: { score: 0, maxScore: 0, periodYears: 0 },
  dividendGrowth: { score: 0, maxScore: 0, periodYears: 0 },
  payoutRatio: { score: 0, maxScore: 0 },
  dividendYield: { score: 0, maxScore: 0 },
  financialMetrics: { score: 0, maxScore: 0 },
} satisfies EnterpriseScoreBreakdownDto;

const toNumber = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

const normalizeEnterprise = (
  enterprise: EnterpriseQuantInfoDto,
  rank: number,
): DividendEnterprise => {
  const legacyEnterprise = enterprise as Partial<DividendEnterprise>;
  const totalScore = toNumber(
    legacyEnterprise.totalScore ?? enterprise.dividendScore,
  );
  const isFcfNotApplicable =
    legacyEnterprise.isFcfNotApplicable ??
    enterprise.freeCashFlowStatus === "NOT_APPLICABLE";

  return {
    ...enterprise,
    rank,
    totalScore,
    judgement: legacyEnterprise.judgement ?? "参考スコア",
    safetyLabel: legacyEnterprise.safetyLabel ?? "neutral",
    scoreBreakdown: legacyEnterprise.scoreBreakdown ?? emptyScoreBreakdown,
    latestDividendYield: toNumber(
      legacyEnterprise.latestDividendYield ?? enterprise.dividendYield,
    ),
    isFinancialBusiness: legacyEnterprise.isFinancialBusiness ?? false,
    isFcfNotApplicable,
  };
};

const normalizeOverview = (
  overview: GetEnterpriseQuantsInfoResponseDto,
): DividendAnalysisOverview => {
  // TODO(#34): Replace this compatibility layer once the BFF OpenAPI exposes the
  // detail metadata required by the dividend analysis UI and fixtures are migrated.
  const legacyOverview = overview as LegacyQuantsInfoResponse;
  const hasItems = Array.isArray(overview.items);
  const sourceEnterprises = hasItems
    ? overview.items
    : (legacyOverview.enterprises ?? []);
  const sortedEnterprises = [...sourceEnterprises].sort((left, right) =>
    hasItems
      ? toNumber(right.dividendScore) - toNumber(left.dividendScore)
      : toNumber((right as Partial<DividendEnterprise>).totalScore) -
        toNumber((left as Partial<DividendEnterprise>).totalScore),
  );
  const enterprises = sortedEnterprises
    .slice(0, hasItems ? 50 : sortedEnterprises.length)
    .map((enterprise, index) => normalizeEnterprise(enterprise, index + 1));
  const dataAsOfDate = legacyOverview.dataAsOfDate ?? overview.asOf ?? "";

  return {
    ...overview,
    enterprises,
    updatedAt: legacyOverview.updatedAt ?? dataAsOfDate,
    dataAsOfDate,
    isRealtime: legacyOverview.isRealtime ?? false,
    disclaimers: legacyOverview.disclaimers ?? [],
  };
};

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

              const overview = normalizeOverview(response.data);
              const { enterprises } = overview;

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
