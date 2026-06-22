import { enableApiMocking } from "./api.mock-browser";
import type { AuthMockScenario } from "./auth.mock-handlers";

export const enableAuthMocking = async (scenario: AuthMockScenario = {}) => {
  await enableApiMocking({ auth: scenario });
};
