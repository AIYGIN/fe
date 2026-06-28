import { setupServer } from "msw/node";
import { createAuthMockHandlers } from "./auth.mock-handlers";
import { getDividendAnalysisMock } from "./generated/dividend-analysis/dividend-analysis.msw";
import { getPortfolioMock } from "./generated/portfolio/portfolio.msw";
import { getTodosMock } from "./generated/todos/todos.msw";

export const apiMockServer = setupServer(
  ...getTodosMock(),
  ...getPortfolioMock(),
  ...getDividendAnalysisMock(),
  ...createAuthMockHandlers(),
);
