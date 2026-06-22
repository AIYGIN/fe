import { setupServer } from "msw/node";
import { createAuthMockHandlers } from "./auth.mock-handlers";
import { getTodosMock } from "./generated/todos/todos.msw";

export const apiMockServer = setupServer(
  ...getTodosMock(),
  ...createAuthMockHandlers(),
);
