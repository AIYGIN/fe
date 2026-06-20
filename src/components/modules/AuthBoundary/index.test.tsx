import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { authMockServer, authUserFixture } from "@/apis/auth.mock-server";
import { getAuthControllerGetMeMockHandler } from "@/apis/generated/auth/auth.msw";
import { AuthStoreProvider } from "@/hooks/auth";
import { AuthBoundary } from ".";

describe("AuthBoundary", () => {
  const originalLocation = window.location;
  const locationAssignMock = vi.fn();

  afterEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
    locationAssignMock.mockReset();
  });

  it("認証確認中はchildrenを表示せず確認中表示を出す", () => {
    renderAuthBoundary({ initialStatus: "checking" });

    expect(
      screen.getByText("ログイン状態を確認しています"),
    ).toBeInTheDocument();
    expect(screen.queryByText("保護コンテンツ")).not.toBeInTheDocument();
  });

  it("認証済みならchildrenを表示する", () => {
    renderAuthBoundary({ initialStatus: "authenticated" });

    expect(screen.getByText("保護コンテンツ")).toBeInTheDocument();
  });

  it("未認証なら戻り先付きでloginへ遷移する", async () => {
    mockLocationAssign();
    renderAuthBoundary({ initialStatus: "unauthenticated" });

    await waitFor(() => {
      expect(locationAssignMock).toHaveBeenCalledWith("/login?next=%2Ftodo");
    });
    expect(screen.queryByText("保護コンテンツ")).not.toBeInTheDocument();
  });

  it("戻り先にqueryやhashが含まれる場合もnextへ保持する", async () => {
    mockLocationAssign();
    renderAuthBoundary({
      initialStatus: "unauthenticated",
      returnTo: "/todo?filter=active&sort=desc#list",
    });

    await waitFor(() => {
      expect(locationAssignMock).toHaveBeenCalledWith(
        "/login?next=%2Ftodo%3Ffilter%3Dactive%26sort%3Ddesc%23list",
      );
    });
  });

  it("認証APIエラー時は再試行できる", async () => {
    const user = userEvent.setup();
    authMockServer.use(
      getAuthControllerGetMeMockHandler(() => authUserFixture),
    );

    renderAuthBoundary({
      initialStatus: "error",
      initialError: "認証状態を確認できませんでした",
    });

    expect(
      screen.getByText("認証状態を確認できませんでした"),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "再試行" }));

    expect(await screen.findByText("保護コンテンツ")).toBeInTheDocument();
  });

  const mockLocationAssign = () => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        ...originalLocation,
        assign: locationAssignMock,
      },
    });
  };

  const renderAuthBoundary = ({
    initialStatus,
    initialError = "",
    returnTo = "/todo",
  }: {
    initialStatus: "checking" | "authenticated" | "unauthenticated" | "error";
    initialError?: string;
    returnTo?: string;
  }) => {
    render(
      <AuthStoreProvider
        initialStatus={initialStatus}
        initialError={initialError}
        autoCheck={false}
      >
        <AuthBoundary loginPath="/login" returnTo={returnTo}>
          <div>保護コンテンツ</div>
        </AuthBoundary>
      </AuthStoreProvider>,
    );
  };
});
