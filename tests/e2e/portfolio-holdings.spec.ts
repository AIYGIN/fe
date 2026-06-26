import { expect, test } from "@playwright/test";

import {
  getPortfolioControllerGetAnalysisResponseMock,
  getPortfolioControllerGetHoldingsResponseMock,
} from "../../src/apis/generated/portfolio/portfolio.faker";

test("ポートフォリオ画面を表示できる", async ({ page }) => {
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());

    if (
      route.request().resourceType() === "fetch" &&
      url.pathname === "/portfolio/holdings"
    ) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        json: getPortfolioControllerGetHoldingsResponseMock({
          holdings: [
            {
              holdingId: "00000000-0000-4000-8000-000000000001",
              productName: "eMAXIS Slim 全世界株式",
              ratio: 62.4,
            },
          ],
          lastUpdated: "2026-06-25T09:00:00.000Z",
        }),
      });
      return;
    }

    if (
      route.request().resourceType() === "fetch" &&
      url.pathname === "/portfolio/analysis"
    ) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        json: getPortfolioControllerGetAnalysisResponseMock({
          sectorAllocations: [{ name: "情報技術", ratio: 28.5 }],
          constituents: [{ name: "Apple", ratio: 7.8 }],
          countryAllocations: [{ name: "米国", ratio: 71.1 }],
          lastUpdated: "2026-06-25T09:05:00.000Z",
        }),
      });
      return;
    }

    await route.continue();
  });

  await page.goto("/portfolio/holdings");

  await expect(
    page.getByRole("heading", { name: "ポートフォリオ" }),
  ).toBeVisible();

  await expect(page.getByText("eMAXIS Slim 全世界株式")).toBeVisible();
  await expect(page.getByText("情報技術", { exact: true })).toBeVisible();
});
