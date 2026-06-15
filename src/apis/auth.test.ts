import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it } from "vitest";
import { getAuthSession, logoutAuthSession } from "./auth";
import { createAuthMockHandlers } from "./auth.mock-handlers";
import { authMockServer } from "./auth.mock-server";
import { getAuthControllerGetMeUrl } from "./generated/auth/auth";

const authMeUrl = `*${getAuthControllerGetMeUrl()}`;

describe("Auth API boundary", () => {
  beforeEach(() => {
    authMockServer.resetHandlers(...createAuthMockHandlers());
  });

  it("GET /auth/meの200を表示用ユーザーとして返す", async () => {
    await expect(getAuthSession()).resolves.toEqual({
      displayName: "Cookie User",
      profileImageUrl: "https://example.com/profile.png",
    });
  });

  it("GET /auth/meの200に秘密フィールドが混入しても表示用フィールドだけへ正規化する", async () => {
    const unsafeResponse: unknown = {
      displayName: "Cookie User",
      profileImageUrl: "https://example.com/profile.png",
      jwt: "jwt-secret",
      token: "provider-token",
      id: "google-user-id",
      sub: "subject-id",
      email: "user@example.com",
    };
    authMockServer.use(
      http.get(authMeUrl, () => HttpResponse.json(unsafeResponse)),
    );

    await expect(getAuthSession()).resolves.toEqual({
      displayName: "Cookie User",
      profileImageUrl: "https://example.com/profile.png",
    });
  });

  it("GET /auth/meの401を通常の未認証としてnullへ変換する", async () => {
    authMockServer.resetHandlers(
      ...createAuthMockHandlers({ session: "unauthenticated" }),
    );

    await expect(getAuthSession()).resolves.toBeNull();
  });

  it("GET /auth/meの403を未認証へ変換せず認証APIエラーにする", async () => {
    authMockServer.use(
      http.get(authMeUrl, () =>
        HttpResponse.json(
          { message: "認証状態を確認できませんでした" },
          { status: 403 },
        ),
      ),
    );

    await expect(getAuthSession()).rejects.toThrow(
      "認証状態を確認できませんでした",
    );
  });

  it("POST /auth/logoutの204を成功として扱う", async () => {
    await expect(logoutAuthSession()).resolves.toBeUndefined();
  });

  it("POST /auth/logoutの失敗を認証APIエラーにする", async () => {
    authMockServer.resetHandlers(
      ...createAuthMockHandlers({ logout: "api-error" }),
    );

    await expect(logoutAuthSession()).rejects.toThrow(
      "ログアウトできませんでした",
    );
  });
});
