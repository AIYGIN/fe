import { waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it } from "vitest";
import {
  authMockServer,
  authUserFixture,
  createAuthMockHandlers,
} from "@/apis/auth.mock-server";
import {
  getAuthControllerGetMeUrl,
  getAuthControllerLogoutUrl,
} from "@/apis/generated/auth/auth";
import {
  getAuthControllerGetMeMockHandler,
  getAuthControllerLogoutMockHandler,
} from "@/apis/generated/auth/auth.msw";
import type { AuthMeResponseDto } from "@/apis/generated/model";
import { createAuthStore } from "./store";

const secondUserFixture: AuthMeResponseDto = {
  displayName: "Second User",
};

const authMockUrls = {
  me: `*${getAuthControllerGetMeUrl()}`,
  logout: `*${getAuthControllerLogoutUrl()}`,
} as const;

const createDeferred = <T>() => {
  let resolve: (value: T) => void = () => {};
  const promise = new Promise<T>((nextResolve) => {
    resolve = nextResolve;
  });

  return { promise, resolve };
};

const createStore = () =>
  createAuthStore({
    initialUser: null,
    initialStatus: "idle",
    initialError: "",
  });

describe("auth-store", () => {
  beforeEach(() => {
    authMockServer.resetHandlers(...createAuthMockHandlers());
  });

  it("初期値を注入し、利用境界ごとに独立したstore instanceを作成する", () => {
    const firstStore = createAuthStore({
      initialUser: authUserFixture,
      initialStatus: "authenticated",
      initialError: "",
    });
    const secondStore = createAuthStore({
      initialUser: null,
      initialStatus: "error",
      initialError: "初期エラー",
    });

    expect(firstStore).not.toBe(secondStore);
    expect(firstStore.getState()).toMatchObject({
      user: authUserFixture,
      status: "authenticated",
      error: "",
      isLoggingOut: false,
    });
    expect(secondStore.getState()).toMatchObject({
      user: null,
      status: "error",
      error: "初期エラー",
      isLoggingOut: false,
    });

    firstStore.getState().clearError();

    expect(secondStore.getState().error).toBe("初期エラー");
  });

  it("Server/API stateだけを公開し、Page/local UI・URL・DOM refを含めない", () => {
    const state = createStore().getState();

    expect(state).toMatchObject({
      user: null,
      status: "idle",
      error: "",
      isLoggingOut: false,
    });

    for (const excludedState of [
      "isLoginDialogOpen",
      "returnTo",
      "redirectUrl",
      "searchParams",
      "buttonRef",
      "focusRef",
    ]) {
      expect(state).not.toHaveProperty(excludedState);
    }
  });

  it("checkSessionはcheckingからauthenticatedへ遷移してユーザーを保持する", async () => {
    const response = createDeferred<AuthMeResponseDto>();
    let requestCount = 0;
    authMockServer.use(
      getAuthControllerGetMeMockHandler(async () => {
        requestCount += 1;
        return response.promise;
      }),
    );
    const store = createAuthStore({
      initialUser: secondUserFixture,
      initialStatus: "error",
      initialError: "以前のエラー",
    });

    const request = store.getState().checkSession();

    expect(store.getState()).toMatchObject({
      user: secondUserFixture,
      status: "checking",
      error: "",
    });
    await waitFor(() => {
      expect(requestCount).toBe(1);
    });

    response.resolve(authUserFixture);
    await request;

    expect(store.getState()).toMatchObject({
      user: authUserFixture,
      status: "authenticated",
      error: "",
    });
  });

  it("checkSessionの多重実行は同じ確認処理を共有する", async () => {
    const response = createDeferred<AuthMeResponseDto>();
    let requestCount = 0;
    authMockServer.use(
      getAuthControllerGetMeMockHandler(async () => {
        requestCount += 1;
        return response.promise;
      }),
    );
    const store = createStore();

    const firstRequest = store.getState().checkSession();
    const duplicateRequest = store.getState().checkSession();

    await waitFor(() => {
      expect(requestCount).toBe(1);
    });

    response.resolve(authUserFixture);
    await Promise.all([firstRequest, duplicateRequest]);

    expect(requestCount).toBe(1);
    expect(store.getState()).toMatchObject({
      user: authUserFixture,
      status: "authenticated",
    });
  });

  it("logout後に完了した古いcheckSession結果で認証状態を巻き戻さない", async () => {
    const response = createDeferred<AuthMeResponseDto>();
    authMockServer.use(
      getAuthControllerGetMeMockHandler(() => response.promise),
      getAuthControllerLogoutMockHandler(),
    );
    const store = createAuthStore({
      initialUser: authUserFixture,
      initialStatus: "authenticated",
      initialError: "",
    });

    const sessionRequest = store.getState().checkSession();
    await store.getState().logout();

    expect(store.getState()).toMatchObject({
      user: null,
      status: "unauthenticated",
      isLoggingOut: false,
    });

    response.resolve(authUserFixture);
    await sessionRequest;

    expect(store.getState()).toMatchObject({
      user: null,
      status: "unauthenticated",
      error: "",
      isLoggingOut: false,
    });
  });

  it("logout中は新しいcheckSessionを開始しない", async () => {
    const logoutResponse = createDeferred<void>();
    let sessionRequestCount = 0;
    authMockServer.use(
      getAuthControllerGetMeMockHandler(() => {
        sessionRequestCount += 1;
        return authUserFixture;
      }),
      getAuthControllerLogoutMockHandler(() => logoutResponse.promise),
    );
    const store = createAuthStore({
      initialUser: authUserFixture,
      initialStatus: "authenticated",
      initialError: "",
    });

    const logoutRequest = store.getState().logout();
    await store.getState().checkSession();

    expect(sessionRequestCount).toBe(0);
    expect(store.getState().isLoggingOut).toBe(true);

    logoutResponse.resolve(undefined);
    await logoutRequest;

    expect(store.getState()).toMatchObject({
      user: null,
      status: "unauthenticated",
      error: "",
      isLoggingOut: false,
    });
  });

  it("checkSessionは401をエラーではないunauthenticatedへ遷移させる", async () => {
    authMockServer.use(
      http.get(authMockUrls.me, () =>
        HttpResponse.json({ message: "Unauthenticated" }, { status: 401 }),
      ),
    );
    const store = createAuthStore({
      initialUser: authUserFixture,
      initialStatus: "authenticated",
      initialError: "",
    });

    await store.getState().checkSession();

    expect(store.getState()).toMatchObject({
      user: null,
      status: "unauthenticated",
      error: "",
    });
  });

  it("checkSessionは403を未認証へ変換せずユーザーを破棄してerrorへ遷移する", async () => {
    authMockServer.use(
      http.get(authMockUrls.me, () =>
        HttpResponse.json(
          { message: "認証状態を確認できませんでした" },
          { status: 403 },
        ),
      ),
    );
    const store = createAuthStore({
      initialUser: authUserFixture,
      initialStatus: "authenticated",
      initialError: "",
    });

    await store.getState().checkSession();

    expect(store.getState()).toMatchObject({
      user: null,
      status: "error",
      error: "認証状態を確認できませんでした",
    });
  });

  it("logout中はpendingを公開して多重実行を防ぎ、204成功時にunauthenticatedへ遷移する", async () => {
    const response = createDeferred<void>();
    let requestCount = 0;
    authMockServer.use(
      getAuthControllerLogoutMockHandler(async () => {
        requestCount += 1;
        await response.promise;
      }),
    );
    const store = createAuthStore({
      initialUser: authUserFixture,
      initialStatus: "authenticated",
      initialError: "以前のエラー",
    });

    const firstRequest = store.getState().logout();
    const duplicateRequest = store.getState().logout();

    await waitFor(() => {
      expect(requestCount).toBe(1);
    });
    expect(store.getState()).toMatchObject({
      user: authUserFixture,
      status: "authenticated",
      error: "",
      isLoggingOut: true,
    });

    response.resolve(undefined);
    await Promise.all([firstRequest, duplicateRequest]);

    expect(store.getState()).toMatchObject({
      user: null,
      status: "unauthenticated",
      error: "",
      isLoggingOut: false,
    });
  });

  it("logout失敗時はerrorへ遷移し、finallyでpendingを解除してエラーを消去できる", async () => {
    authMockServer.use(
      http.post(authMockUrls.logout, () =>
        HttpResponse.json(
          { message: "ログアウトできませんでした" },
          { status: 500 },
        ),
      ),
    );
    const store = createAuthStore({
      initialUser: authUserFixture,
      initialStatus: "authenticated",
      initialError: "",
    });

    await store.getState().logout();

    expect(store.getState()).toMatchObject({
      user: authUserFixture,
      status: "error",
      error: "ログアウトできませんでした",
      isLoggingOut: false,
    });

    store.getState().clearError();

    expect(store.getState().error).toBe("");
  });
});
