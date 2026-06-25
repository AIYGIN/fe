import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { apiMockServer } from "@/apis/api.mock-server";
import { PortfolioHoldingsPage } from "./page";

const holdingsResponse = {
  holdings: [
    {
      holdingId: "hold-1",
      productName: "eMAXIS Slim 全世界株式",
      ratio: 62.4,
    },
  ],
  lastUpdated: "2026-06-25T09:00:00.000Z",
};

const analysisResponse = {
  sectorAllocations: [{ name: "情報技術", ratio: 28.5 }],
  constituents: [{ name: "Apple", ratio: 7.8 }],
  countryAllocations: [{ name: "米国", ratio: 71.1 }],
  lastUpdated: "2026-06-25T09:05:00.000Z",
};

function mockPortfolioApis() {
  apiMockServer.use(
    http.get("*/portfolio/holdings", () => HttpResponse.json(holdingsResponse)),
    http.get("*/portfolio/analysis", () => HttpResponse.json(analysisResponse)),
  );
}

describe("PortfolioHoldingsPage", () => {
  it("mount 時に portfolio を取得して表示する", async () => {
    mockPortfolioApis();

    render(<PortfolioHoldingsPage />);

    expect(
      await screen.findByText("eMAXIS Slim 全世界株式"),
    ).toBeInTheDocument();
    expect(await screen.findByText("情報技術")).toBeInTheDocument();
  });

  it("error 表示の再試行ボタンから再取得できる", async () => {
    const user = userEvent.setup();
    let holdingsCalls = 0;
    apiMockServer.use(
      http.get("*/portfolio/holdings", () => {
        holdingsCalls += 1;
        if (holdingsCalls === 1) {
          return HttpResponse.json({ message: "error" }, { status: 500 });
        }

        return HttpResponse.json(holdingsResponse);
      }),
      http.get("*/portfolio/analysis", () =>
        HttpResponse.json(analysisResponse),
      ),
    );

    render(<PortfolioHoldingsPage />);

    await user.click(await screen.findByRole("button", { name: "再試行" }));

    expect(
      await screen.findByText("eMAXIS Slim 全世界株式"),
    ).toBeInTheDocument();
    await waitFor(() => expect(holdingsCalls).toBe(2));
  });

  it("analysis 取得中も取得済み holdings を後続表示する", async () => {
    apiMockServer.use(
      http.get("*/portfolio/holdings", () =>
        HttpResponse.json(holdingsResponse),
      ),
      http.get("*/portfolio/analysis", async () => {
        await delay(10_000);
        return HttpResponse.json(analysisResponse);
      }),
    );

    render(<PortfolioHoldingsPage />);

    expect(
      await screen.findByText("eMAXIS Slim 全世界株式"),
    ).toBeInTheDocument();
    expect(screen.queryByText("情報技術")).not.toBeInTheDocument();
  });
});
