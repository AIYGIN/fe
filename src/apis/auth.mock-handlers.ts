import { delay, HttpResponse, http, type RequestHandler } from "msw";
import {
  getAuthControllerGetMeUrl,
  getAuthControllerLogoutUrl,
} from "./generated/auth/auth";
import {
  getAuthControllerGetMeMockHandler,
  getAuthControllerLogoutMockHandler,
} from "./generated/auth/auth.msw";
import type { AuthMeResponseDto } from "./generated/model";

export type AuthSessionMockScenario =
  | "authenticated"
  | "unauthenticated"
  | "api-error"
  | "checking";

export type AuthLogoutMockScenario = "success" | "api-error" | "pending";

export type AuthMockScenario = {
  session?: AuthSessionMockScenario;
  logout?: AuthLogoutMockScenario;
  user?: AuthMeResponseDto;
};

export const authUserFixture: AuthMeResponseDto = {
  displayName: "Cookie User",
  profileImageUrl: "/next.svg",
};

const authMockUrls = {
  me: `*${getAuthControllerGetMeUrl()}`,
  logout: `*${getAuthControllerLogoutUrl()}`,
} as const;

const createSessionHandler = (
  scenario: AuthSessionMockScenario,
  user: AuthMeResponseDto,
): RequestHandler => {
  if (scenario === "authenticated") {
    return getAuthControllerGetMeMockHandler(() => user);
  }

  if (scenario === "checking") {
    return getAuthControllerGetMeMockHandler(async () => {
      await delay("infinite");
      return user;
    });
  }

  if (scenario === "unauthenticated") {
    return http.get(authMockUrls.me, () =>
      HttpResponse.json({ message: "Unauthenticated" }, { status: 401 }),
    );
  }

  return http.get(authMockUrls.me, () =>
    HttpResponse.json(
      { message: "認証状態を確認できませんでした" },
      { status: 500 },
    ),
  );
};

const createLogoutHandler = (
  scenario: AuthLogoutMockScenario,
): RequestHandler => {
  if (scenario === "success") {
    return getAuthControllerLogoutMockHandler();
  }

  if (scenario === "pending") {
    return getAuthControllerLogoutMockHandler(async () => {
      await delay("infinite");
    });
  }

  return http.post(authMockUrls.logout, () =>
    HttpResponse.json(
      { message: "ログアウトできませんでした" },
      { status: 500 },
    ),
  );
};

export const createAuthMockHandlers = ({
  session = "authenticated",
  logout = "success",
  user = authUserFixture,
}: AuthMockScenario = {}): RequestHandler[] => [
  createSessionHandler(session, user),
  createLogoutHandler(logout),
];
