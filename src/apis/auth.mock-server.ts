import { apiMockServer } from "./api.mock-server";

export const authMockServer = apiMockServer;

export {
  type AuthLogoutMockScenario,
  type AuthMockScenario,
  type AuthSessionMockScenario,
  authUserFixture,
  createAuthMockHandlers,
} from "./auth.mock-handlers";
