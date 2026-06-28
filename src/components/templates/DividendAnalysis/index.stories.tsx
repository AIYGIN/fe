import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { delay, HttpResponse, http } from "msw";
import { mswLoader } from "msw-storybook-addon";
import { expect, within } from "storybook/test";
import {
  getEnterprisesControllerGetDividendAnalysisMockHandler,
  getEnterprisesControllerGetQuantsInfoMockHandler,
} from "@/apis/generated/dividend-analysis/dividend-analysis.msw";
import type {
  EnterpriseQuantInfoDto,
  GetEnterpriseDividendAnalysisResponseDto,
  GetEnterpriseQuantsInfoResponseDto,
} from "@/apis/generated/model";

import { DividendAnalysisPage } from ".";

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

const enterpriseNames = [
  ["2914", "日本たばこ産業", "食料品", 92.4, 4.8],
  ["8316", "三井住友フィナンシャルグループ", "銀行業", 90.1, 3.9],
  ["8058", "三菱商事", "卸売業", 88.6, 3.5],
  ["9432", "日本電信電話", "情報・通信業", 86.2, 3.2],
  ["4502", "武田薬品工業", "医薬品", 84.8, 4.1],
  ["8766", "東京海上ホールディングス", "保険業", 82.3, 3.1],
  ["7203", "トヨタ自動車", "輸送用機器", 80.7, 2.8],
  ["8591", "オリックス", "その他金融業", 78.9, 3.4],
  ["8031", "三井物産", "卸売業", 77.5, 3.0],
  ["9433", "KDDI", "情報・通信業", 75.8, 3.1],
  ["8001", "伊藤忠商事", "卸売業", 74.6, 2.9],
  ["8411", "みずほフィナンシャルグループ", "銀行業", 73.4, 4.0],
  ["8306", "三菱UFJフィナンシャル・グループ", "銀行業", 72.2, 3.8],
  ["5108", "ブリヂストン", "ゴム製品", 70.7, 3.0],
  ["1925", "大和ハウス工業", "建設業", 69.5, 3.3],
  ["4063", "信越化学工業", "化学", 68.1, 2.4],
  ["7267", "本田技研工業", "輸送用機器", 66.8, 3.6],
  ["7751", "キヤノン", "電気機器", 65.4, 3.5],
  ["9020", "東日本旅客鉄道", "陸運業", 63.9, 2.2],
  ["6501", "日立製作所", "電気機器", 62.5, 2.1],
] as const;

const enterprises: EnterpriseQuantInfoDto[] = enterpriseNames.map(
  ([symbolId, companyName, sector, totalScore, latestDividendYield], index) => {
    const isFinancialBusiness =
      sector.includes("銀行") ||
      sector.includes("金融") ||
      sector.includes("保険");

    return {
      symbolId,
      companyName,
      sector,
      rank: index + 1,
      totalScore,
      judgement: "参考スコア",
      safetyLabel: index < 5 ? "safe" : index < 14 ? "neutral" : "watch",
      scoreBreakdown: createScoreBreakdown(
        isFinancialBusiness ? null : 15,
        isFinancialBusiness,
      ),
      latestDividendYield,
      isFinancialBusiness,
      isFcfNotApplicable: isFinancialBusiness,
      updatedAt: "2026-06-25T09:00:00.000Z",
      dataAsOfDate: "2026-06-24",
    };
  },
);

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

const loadDividendHandlers = async (
  context: Parameters<typeof mswLoader>[0],
) => {
  const handlers = context.parameters.msw?.handlers ?? [
    getEnterprisesControllerGetQuantsInfoMockHandler(quantsInfoResponse),
    getEnterprisesControllerGetDividendAnalysisMockHandler(({ params }) => {
      const symbolId = String(params.symbolId);
      return details[symbolId] ?? createDetail(enterprises[0]);
    }),
  ];

  return mswLoader({
    parameters: {
      ...context.parameters,
      msw: { handlers },
    },
  });
};

const meta = {
  title: "templates/DividendAnalysis",
  component: DividendAnalysisPage,
  args: {
    autoLoad: true,
  },
  loaders: [loadDividendHandlers],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof DividendAnalysisPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default20Enterprises: Story = {
  name: "Default 20銘柄",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByRole("heading", { name: "高配当分析" }),
    ).toBeInTheDocument();
    await expect(await canvas.findByText("20銘柄")).toBeInTheDocument();
    await expect(await canvas.findByText("日本たばこ産業")).toBeInTheDocument();
    await expect(
      await canvas.findByText("リアルタイムデータではありません"),
    ).toBeInTheDocument();
  },
};

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        getEnterprisesControllerGetQuantsInfoMockHandler(async () => {
          await delay("infinite");
          return quantsInfoResponse;
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText("分析データを読み込んでいます"),
    ).toBeInTheDocument();
  },
};

export const Empty: Story = {
  parameters: {
    msw: {
      handlers: [
        getEnterprisesControllerGetQuantsInfoMockHandler({
          ...quantsInfoResponse,
          enterprises: [],
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText("表示できる銘柄はありません"),
    ).toBeInTheDocument();
  },
};

const ErrorStory: Story = {
  name: "Error",
  parameters: {
    msw: {
      handlers: [
        http.get("*/enterprises/quantsInfo", () =>
          HttpResponse.json(
            { message: "高配当分析データを取得できませんでした" },
            { status: 500 },
          ),
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      "高配当分析データを取得できませんでした",
    );
  },
};

export { ErrorStory as Error };

export const SelectedRow: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole("button", {
        name: "8316 三井住友フィナンシャルグループ 詳細を表示",
      }),
    );

    await expect(
      await canvas.findByRole("heading", {
        name: "三井住友フィナンシャルグループ",
      }),
    ).toBeInTheDocument();
  },
};

export const FinancialFcfNotApplicable: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole("button", {
        name: "8316 三井住友フィナンシャルグループ 詳細を表示",
      }),
    );

    await expect(await canvas.findByText("FCF N/A")).toBeInTheDocument();
    await expect(
      await canvas.findByText(/金融業のためFCFは評価対象外です/),
    ).toBeInTheDocument();
  },
};

export const AiSummaryTodo: Story = {
  name: "AI summary TODO",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText("AI要約は準備中です"),
    ).toBeInTheDocument();
  },
};

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};
