import type {
  GetPortfolioAnalysisResponseDto,
  GetPortfolioHoldingsResponseDto,
} from "@/apis/generated/model";
import {
  portfolioControllerGetAnalysis,
  portfolioControllerGetHoldings,
} from "@/apis/generated/portfolio/portfolio";

export type PortfolioLoadErrorKind = "not-found" | "error";

export class PortfolioLoadError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly kind: PortfolioLoadErrorKind,
  ) {
    super(message);
    this.name = "PortfolioLoadError";
  }
}

export type PortfolioData = {
  holdings: GetPortfolioHoldingsResponseDto["holdings"];
  analysis: Omit<GetPortfolioAnalysisResponseDto, "lastUpdated">;
  lastUpdated: {
    holdings: string;
    analysis: string;
  };
};

export type PortfolioHoldingsData = Pick<
  PortfolioData,
  "holdings" | "lastUpdated"
>;

export type PortfolioAnalysisData = Pick<
  PortfolioData,
  "analysis" | "lastUpdated"
>;

export async function loadPortfolioHoldings(): Promise<PortfolioHoldingsData> {
  try {
    const holdingsResponse = await portfolioControllerGetHoldings();
    if (holdingsResponse.status !== 200) {
      throw createLoadError(holdingsResponse.status);
    }

    const { lastUpdated, holdings } = holdingsResponse.data;

    return {
      holdings,
      lastUpdated: {
        holdings: lastUpdated,
        analysis: "",
      },
    };
  } catch (error) {
    if (error instanceof PortfolioLoadError) {
      throw error;
    }

    const status = getErrorStatus(error);
    throw createLoadError(status);
  }
}

export async function loadPortfolioAnalysis(
  holdings: GetPortfolioHoldingsResponseDto["holdings"],
): Promise<PortfolioAnalysisData> {
  try {
    const analysisResponse = await portfolioControllerGetAnalysis({
      holdingIds: holdings.map((holding) => holding.holdingId).join(","),
    });
    if (analysisResponse.status !== 200) {
      throw createLoadError(analysisResponse.status);
    }

    const { lastUpdated, ...analysis } = analysisResponse.data;

    return {
      analysis,
      lastUpdated: {
        holdings: "",
        analysis: lastUpdated,
      },
    };
  } catch (error) {
    if (error instanceof PortfolioLoadError) {
      throw error;
    }

    const status = getErrorStatus(error);
    throw createLoadError(status);
  }
}

export async function loadPortfolio(): Promise<PortfolioData> {
  const holdingsData = await loadPortfolioHoldings();
  const analysisData = await loadPortfolioAnalysis(holdingsData.holdings);

  return {
    holdings: holdingsData.holdings,
    analysis: analysisData.analysis,
    lastUpdated: {
      holdings: holdingsData.lastUpdated.holdings,
      analysis: analysisData.lastUpdated.analysis,
    },
  };
}

function createLoadError(status: number): PortfolioLoadError {
  return new PortfolioLoadError(
    status === 404
      ? "Portfolio holdings were not found."
      : "Portfolio holdings could not be loaded.",
    status,
    status === 404 ? "not-found" : "error",
  );
}

function getErrorStatus(error: unknown): number {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
  ) {
    return error.status;
  }

  return 500;
}
