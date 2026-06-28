import { expect, test } from "@playwright/test";

import type {
  EnterpriseQuantInfoDto,
  GetEnterpriseDividendAnalysisResponseDto,
  GetEnterpriseQuantsInfoResponseDto,
} from "../../src/apis/generated/model";

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

test("高配当分析画面で一覧20銘柄、スコア順、詳細切替、データ注記を確認できる", async ({
  page,
}) => {
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());

    if (
      route.request().resourceType() === "fetch" &&
      url.pathname === "/enterprises/quantsInfo"
    ) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        json: quantsInfoResponse,
      });
      return;
    }

    const dividendDetailMatch = url.pathname.match(
      /^\/enterprises\/([^/]+)\/dividendAnalysis$/,
    );

    if (route.request().resourceType() === "fetch" && dividendDetailMatch) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        json: details[dividendDetailMatch[1]] ?? createDetail(enterprises[0]),
      });
      return;
    }

    await route.continue();
  });

  await page.goto("/dividend");

  await expect(page.getByRole("heading", { name: "高配当分析" })).toBeVisible();
  await expect(page.getByText("20銘柄")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "2914 日本たばこ産業 詳細を表示" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "8316 三井住友フィナンシャルグループ 詳細を表示",
    }),
  ).toBeVisible();
  await expect(page.getByText("92.4")).toBeVisible();
  await expect(page.getByText("90.1")).toBeVisible();
  await expect(page.getByText("データ更新: 2026-06-25 09:00")).toBeVisible();
  await expect(page.getByText("データ基準日: 2026-06-24")).toBeVisible();
  await expect(
    page.getByText("リアルタイムデータではありません"),
  ).toBeVisible();
  await expect(page.getByText("表示内容は参考情報です。")).toBeVisible();

  await page
    .getByRole("button", {
      name: "8316 三井住友フィナンシャルグループ 詳細を表示",
    })
    .click();

  await expect(
    page.getByRole("heading", { name: "三井住友フィナンシャルグループ" }),
  ).toBeVisible();
  await expect(page.getByText("FCF N/A")).toBeVisible();
  await expect(page.getByText(/金融業のためFCFは評価対象外です/)).toBeVisible();
});
