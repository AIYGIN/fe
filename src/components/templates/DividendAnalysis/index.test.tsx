import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";

import { apiMockServer } from "@/apis/api.mock-server";
import {
  getEnterprisesControllerGetDividendAnalysisMockHandler,
  getEnterprisesControllerGetQuantsInfoMockHandler,
} from "@/apis/generated/dividend-analysis/dividend-analysis.msw";
import type {
  EnterpriseQuantInfoDto,
  GetEnterpriseDividendAnalysisResponseDto,
  GetEnterpriseQuantsInfoResponseDto,
} from "@/apis/generated/model";
import { DividendMetricDetailTable } from "@/components/investment/modules/DividendMetricDetailTable";

import { DividendAnalysisPage, DividendAnalysisTemplate } from "./index";

const disclaimers = [
  "表示内容は参考情報です。",
  "データは遅延または欠損する場合があります。",
];

const createScoreBreakdown = (
  fcfScore: number | null,
  isFcfNotApplicable = false,
) => ({
  fcf: {
    score: fcfScore ?? 0,
    maxScore: 20,
    isNotApplicable: isFcfNotApplicable,
  },
  dividendCutHistory: { score: 18, maxScore: 20, periodYears: 10 },
  dividendGrowth: { score: 16, maxScore: 20, periodYears: 10 },
  payoutRatio: { score: 14, maxScore: 20 },
  dividendYield: { score: 15, maxScore: 20 },
  financialMetrics: { score: 13, maxScore: 20 },
});

const enterprises: EnterpriseQuantInfoDto[] = [
  {
    symbolId: "2914",
    companyName: "日本たばこ産業",
    sector: "食料品",
    rank: 1,
    totalScore: 92.4,
    judgement: "参考スコア",
    safetyLabel: "safe",
    scoreBreakdown: createScoreBreakdown(15),
    latestDividendYield: 4.8,
    isFinancialBusiness: false,
    isFcfNotApplicable: false,
    updatedAt: "2026-06-25T09:00:00.000Z",
    dataAsOfDate: "2026-06-24",
  },
  {
    symbolId: "8316",
    companyName: "三井住友フィナンシャルグループ",
    sector: "銀行業",
    rank: 2,
    totalScore: 90.1,
    judgement: "参考スコア",
    safetyLabel: "safe",
    scoreBreakdown: createScoreBreakdown(null, true),
    latestDividendYield: 3.9,
    isFinancialBusiness: true,
    isFcfNotApplicable: true,
    updatedAt: "2026-06-25T09:00:00.000Z",
    dataAsOfDate: "2026-06-24",
  },
];

const quantsInfoResponse: GetEnterpriseQuantsInfoResponseDto = {
  enterprises,
  updatedAt: "2026-06-25T09:00:00.000Z",
  dataAsOfDate: "2026-06-24",
  isRealtime: false,
  disclaimers,
};

const createDetail = (
  enterprise: EnterpriseQuantInfoDto,
): GetEnterpriseDividendAnalysisResponseDto => ({
  symbolId: enterprise.symbolId,
  companyName: enterprise.companyName,
  sector: enterprise.sector,
  totalScore: enterprise.totalScore,
  judgement: "参考スコア",
  safetyLabel: enterprise.safetyLabel,
  metrics: {
    fcf: enterprise.isFcfNotApplicable ? null : 120000000000,
    payoutRatio: 42.5,
    dividendGrowthRate10y: 5.2,
    dividendCutCount10y: 0,
    per: 14.2,
    pbr: 1.4,
    roe: 9.6,
  },
  scoreBreakdown: {
    fcf: {
      score: enterprise.isFcfNotApplicable ? null : 15,
      maxScore: 20,
      isNotApplicable: enterprise.isFcfNotApplicable,
      reason: enterprise.isFcfNotApplicable
        ? "金融業のためFCFは評価対象外です"
        : "FCFを確認できます",
    },
    dividendCutHistory: {
      score: 18,
      maxScore: 20,
      periodYears: 10,
      reason: "10年分の履歴を表示します",
    },
    dividendGrowth: {
      score: 16,
      maxScore: 20,
      periodYears: 10,
      reason: "10年分の推移を表示します",
    },
    payoutRatio: { score: 14, maxScore: 20, reason: "配当性向を表示します" },
    dividendYield: {
      score: 15,
      maxScore: 20,
      reason: "直近利回りを表示します",
    },
    financialMetrics: {
      score: 13,
      maxScore: 20,
      reason: "財務指標を表示します",
    },
  },
  analysisSummary: null,
  isFinancialBusiness: enterprise.isFinancialBusiness,
  isFcfNotApplicable: enterprise.isFcfNotApplicable,
  dataSources: [{ name: "J-Quants mock", asOfDate: "2026-06-24" }],
  updatedAt: "2026-06-25T09:05:00.000Z",
  dataAsOfDate: "2026-06-24",
  scoreVersion: "dividend-poc-v1",
  isRealtime: false,
  disclaimers,
});

const details = Object.fromEntries(
  enterprises.map((enterprise) => [
    enterprise.symbolId,
    createDetail(enterprise),
  ]),
);

const useDividendSuccessHandlers = () => {
  apiMockServer.use(
    getEnterprisesControllerGetQuantsInfoMockHandler(quantsInfoResponse),
    getEnterprisesControllerGetDividendAnalysisMockHandler(({ params }) => {
      const symbolId = String(params.symbolId);
      return details[symbolId] ?? createDetail(enterprises[0]);
    }),
  );
};

describe("DividendAnalysisPage", () => {
  it("API成功時に一覧、データ鮮度、非リアルタイム、免責注記を表示する", async () => {
    useDividendSuccessHandlers();

    render(<DividendAnalysisPage />);

    expect(
      await screen.findByRole("heading", { name: "高配当分析" }),
    ).toBeInTheDocument();
    expect(await screen.findAllByText("日本たばこ産業")).toHaveLength(1);
    expect(
      screen.getByText("三井住友フィナンシャルグループ"),
    ).toBeInTheDocument();
    expect(screen.getByText("2銘柄")).toBeInTheDocument();
    expect(
      screen.getByText("データ更新: 2026-06-25 09:00"),
    ).toBeInTheDocument();
    expect(screen.getByText("データ基準日: 2026-06-24")).toBeInTheDocument();
    expect(
      screen.getByText("リアルタイムデータではありません"),
    ).toBeInTheDocument();
    expect(screen.getByText("表示内容は参考情報です。")).toBeInTheDocument();
  });

  it("API失敗時に復旧可能なエラー状態を表示する", async () => {
    apiMockServer.use(
      http.get("*/enterprises/quantsInfo", () =>
        HttpResponse.json(
          { message: "高配当分析データを取得できませんでした" },
          { status: 500 },
        ),
      ),
    );

    render(<DividendAnalysisPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "高配当分析データを取得できませんでした",
    );
    expect(screen.getByRole("button", { name: "再試行" })).toBeEnabled();
  });

  it("行選択で詳細を切り替え、金融業のFCFをN/Aとして表示する", async () => {
    useDividendSuccessHandlers();
    const user = userEvent.setup();

    render(<DividendAnalysisPage />);

    await user.click(
      await screen.findByRole("button", {
        name: "8316 三井住友フィナンシャルグループ 詳細を表示",
      }),
    );

    expect(
      await screen.findByRole("heading", {
        name: "三井住友フィナンシャルグループ",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("FCF N/A")).toBeInTheDocument();
    expect(
      screen.getByText(/金融業のためFCFは評価対象外です/),
    ).toBeInTheDocument();
  });

  it("Templateはpropsで渡された状態を表示し選択を委譲する", async () => {
    const user = userEvent.setup();
    const onSelectSymbol = vi.fn();
    const onRetry = vi.fn();

    render(
      <DividendAnalysisTemplate
        detail={null}
        detailStatus="error"
        enterprises={enterprises}
        error="詳細データを取得できませんでした"
        onRetry={onRetry}
        onSelectSymbol={onSelectSymbol}
        overview={quantsInfoResponse}
        selectedSymbolId="2914"
        status="success"
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "8316 三井住友フィナンシャルグループ 詳細を表示",
      }),
    );

    expect(onSelectSymbol).toHaveBeenCalledWith("8316");
  });

  it("Templateはsticky詳細表示中に再試行を委譲する", async () => {
    const user = userEvent.setup();
    const onSelectSymbol = vi.fn();
    const onRetry = vi.fn();

    render(
      <DividendAnalysisTemplate
        detail={null}
        detailStatus="error"
        enterprises={enterprises}
        error="詳細データを取得できませんでした"
        onRetry={onRetry}
        onSelectSymbol={onSelectSymbol}
        overview={quantsInfoResponse}
        selectedSymbolId="2914"
        status="success"
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "2914 日本たばこ産業 詳細を表示",
      }),
    );

    await user.click(screen.getByRole("button", { name: "再試行" }));

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "詳細データを取得できませんでした",
    );
  });

  it("指標詳細テーブルはmetricsとscoreBreakdownから配点、評価、得点、詳細を表示する", () => {
    const detail = details["2914"];

    render(
      <DividendMetricDetailTable
        metrics={detail.metrics}
        scoreBreakdown={detail.scoreBreakdown}
      />,
    );

    expect(screen.getByText("FCF")).toBeInTheDocument();
    expect(screen.getByText("120,000,000,000円")).toBeInTheDocument();
    expect(screen.getAllByText("評価 良好").length).toBeGreaterThan(0);
    expect(screen.getAllByText("得点 15 / 20").length).toBeGreaterThan(0);
    expect(screen.getByText(/詳細: FCFを確認できます/)).toBeInTheDocument();
    expect(screen.getByText("配当利回り")).toBeInTheDocument();
    expect(
      screen.getByText(/詳細: 直近利回りを表示します/),
    ).toBeInTheDocument();
  });
});
