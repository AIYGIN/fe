import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  authMockServer,
  createAuthMockHandlers,
} from "@/apis/auth.mock-server";
import { getAuthControllerGoogleLoginUrl } from "@/apis/generated/auth/auth";
import { getApiHost } from "@/apis/request";
import { LoginTemplate } from ".";

describe("LoginTemplate", () => {
  const originalLocation = window.location;
  const locationAssignMock = vi.fn();

  beforeEach(() => {
    authMockServer.resetHandlers(
      ...createAuthMockHandlers({ session: "unauthenticated" }),
    );
    locationAssignMock.mockReset();

    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        ...originalLocation,
        assign: locationAssignMock,
      },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  it("未認証ユーザーがGoogleログインを開始するとBFFのOAuth開始URLへトップレベル遷移する", async () => {
    const user = userEvent.setup();

    render(<LoginTemplate initialAuthStatus="unauthenticated" />);

    await user.click(screen.getByRole("button", { name: "Googleでログイン" }));

    expect(locationAssignMock).toHaveBeenCalledWith(
      `${getApiHost()}${getAuthControllerGoogleLoginUrl()}`,
    );
  });

  it("returnToをnext search paramとして保持してGoogleログインを開始する", async () => {
    const user = userEvent.setup();

    render(
      <LoginTemplate
        initialAuthStatus="unauthenticated"
        returnTo="/todo?filter=active"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Googleでログイン" }));

    expect(locationAssignMock).toHaveBeenCalledWith(
      `${getApiHost()}${getAuthControllerGoogleLoginUrl()}?next=%2Ftodo%3Ffilter%3Dactive`,
    );
  });

  it("外部URLはログイン後遷移先として採用しない", async () => {
    const user = userEvent.setup();

    render(
      <LoginTemplate
        initialAuthStatus="unauthenticated"
        returnTo="https://evil.example/todo"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Googleでログイン" }));

    expect(locationAssignMock).toHaveBeenCalledWith(
      `${getApiHost()}${getAuthControllerGoogleLoginUrl()}`,
    );
  });

  it("認証確認中は状態を表示し、Googleログイン操作を無効化する", () => {
    render(<LoginTemplate initialAuthStatus="checking" />);

    expect(screen.getByText("認証状態を確認しています")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Googleでログイン" }),
    ).toBeDisabled();
  });

  it("idleで表示するとauthStoreのcheckSession中はGoogleログイン操作を無効化する", async () => {
    authMockServer.resetHandlers(
      ...createAuthMockHandlers({ session: "checking" }),
    );

    render(<LoginTemplate />);

    expect(
      await screen.findByText("認証状態を確認しています"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Googleでログイン" }),
    ).toBeDisabled();
  });

  it("認証確認APIのエラーを表示し、ログイン開始時にエラーを消す", async () => {
    const user = userEvent.setup();

    render(
      <LoginTemplate
        initialAuthStatus="error"
        initialAuthError="認証状態を確認できませんでした"
      />,
    );

    expect(
      screen.getByText("認証状態を確認できませんでした"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Googleでログイン" }));

    expect(locationAssignMock).toHaveBeenCalledWith(
      `${getApiHost()}${getAuthControllerGoogleLoginUrl()}`,
    );
    await waitFor(() => {
      expect(
        screen.queryByText("認証状態を確認できませんでした"),
      ).not.toBeInTheDocument();
    });
  });

  it("操作不可の状態ではGoogleログインを開始しない", async () => {
    const user = userEvent.setup();

    render(<LoginTemplate initialAuthStatus="authenticated" />);

    const loginButton = screen.getByRole("button", {
      name: "Googleでログイン",
    });
    expect(loginButton).toBeDisabled();

    await user.click(loginButton);

    expect(locationAssignMock).not.toHaveBeenCalled();
  });
});
