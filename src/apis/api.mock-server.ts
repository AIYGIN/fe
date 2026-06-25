import { setupServer } from "msw/node";
import { createAuthMockHandlers } from "./auth.mock-handlers";
import { getPortfolioMock } from "./generated/portfolio/portfolio.msw";
import { getTodosMock } from "./generated/todos/todos.msw";

export const apiMockServer = setupServer(
  ...getTodosMock(),
  ...getPortfolioMock(),
  ...createAuthMockHandlers(),
);
