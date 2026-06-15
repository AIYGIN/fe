import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import {
  authMockServer,
  authUserFixture,
  createAuthMockHandlers,
} from "@/apis/auth.mock-server";
import { getAuthControllerGetMeMockHandler } from "@/apis/generated/auth/auth.msw";
import { AuthStoreProvider } from "@/stores/auth/provider";
import { useAuth } from "./useAuth";

function AuthStateConsumer() {
  const user = useAuth((state) => state.user);
  const status = useAuth((state) => state.status);
  const error = useAuth((state) => state.error);

  return (
    <>
      <output aria-label="auth user">{user?.displayName ?? "none"}</output>
      <output aria-label="auth status">{status}</output>
      <output aria-label="auth error">{error || "none"}</output>
    </>
  );
}

function ClearErrorButton() {
  const clearError = useAuth((state) => state.clearError);

  return (
    <button type="button" onClick={clearError}>
      clear error
    </button>
  );
}

function UserRenderCount() {
  const renderCount = useRef(0);
  renderCount.current += 1;
  useAuth((state) => state.user);

  return <output aria-label="user render count">{renderCount.current}</output>;
}

describe("AuthStoreProvider and useAuth", () => {
  beforeEach(() => {
    authMockServer.resetHandlers(...createAuthMockHandlers());
  });

  it("Provider外からselector hookを利用した場合は構成エラーを通知する", () => {
    expect(() => render(<AuthStateConsumer />)).toThrow(
      "useAuth must be used within AuthStoreProvider",
    );
  });

  it("Providerが注入された初期値をselector経由で公開する", () => {
    render(
      <AuthStoreProvider
        initialUser={authUserFixture}
        initialStatus="authenticated"
        initialError=""
        autoCheck={false}
      >
        <AuthStateConsumer />
      </AuthStoreProvider>,
    );

    expect(screen.getByLabelText("auth user")).toHaveTextContent("Cookie User");
    expect(screen.getByLabelText("auth status")).toHaveTextContent(
      "authenticated",
    );
    expect(screen.getByLabelText("auth error")).toHaveTextContent("none");
  });

  it("autoCheckが有効なら認証状態確認の結果を公開する", async () => {
    render(
      <AuthStoreProvider
        initialUser={null}
        initialStatus="idle"
        initialError=""
        autoCheck
      >
        <AuthStateConsumer />
      </AuthStoreProvider>,
    );

    expect(await screen.findByText("authenticated")).toBeInTheDocument();
    expect(screen.getByLabelText("auth user")).toHaveTextContent("Cookie User");
  });

  it("autoCheckがfalseならidleのまま/auth/meを呼ばない", async () => {
    let requestCount = 0;
    authMockServer.use(
      getAuthControllerGetMeMockHandler(() => {
        requestCount += 1;
        return authUserFixture;
      }),
    );

    render(
      <AuthStoreProvider
        initialUser={null}
        initialStatus="idle"
        initialError=""
        autoCheck={false}
      >
        <AuthStateConsumer />
      </AuthStoreProvider>,
    );

    await act(async () => {});

    expect(screen.getByLabelText("auth status")).toHaveTextContent("idle");
    expect(requestCount).toBe(0);
  });

  it("Provider境界ごとに独立instanceを作り、一方の更新を他方へ漏らさない", async () => {
    const user = userEvent.setup();

    render(
      <>
        <section aria-label="first auth boundary">
          <AuthStoreProvider
            initialUser={authUserFixture}
            initialStatus="error"
            initialError="first error"
            autoCheck={false}
          >
            <AuthStateConsumer />
            <ClearErrorButton />
          </AuthStoreProvider>
        </section>
        <section aria-label="second auth boundary">
          <AuthStoreProvider
            initialUser={null}
            initialStatus="error"
            initialError="second error"
            autoCheck={false}
          >
            <AuthStateConsumer />
          </AuthStoreProvider>
        </section>
      </>,
    );

    const firstBoundary = screen.getByRole("region", {
      name: "first auth boundary",
    });
    const secondBoundary = screen.getByRole("region", {
      name: "second auth boundary",
    });

    await user.click(screen.getByRole("button", { name: "clear error" }));

    await waitFor(() => {
      expect(firstBoundary).toHaveTextContent("none");
    });
    expect(secondBoundary).toHaveTextContent("second error");
  });

  it("selectorで未選択の状態更新ではconsumerを再レンダーしない", async () => {
    const user = userEvent.setup();

    render(
      <AuthStoreProvider
        initialUser={authUserFixture}
        initialStatus="error"
        initialError="initial error"
        autoCheck={false}
      >
        <UserRenderCount />
        <ClearErrorButton />
      </AuthStoreProvider>,
    );

    expect(screen.getByLabelText("user render count")).toHaveTextContent("1");

    await user.click(screen.getByRole("button", { name: "clear error" }));

    expect(screen.getByLabelText("user render count")).toHaveTextContent("1");
  });

  it("Providerの再レンダーでstore instanceや初期値を置換しない", () => {
    const { rerender } = render(
      <AuthStoreProvider
        initialUser={authUserFixture}
        initialStatus="authenticated"
        initialError=""
        autoCheck={false}
      >
        <AuthStateConsumer />
      </AuthStoreProvider>,
    );

    rerender(
      <AuthStoreProvider
        initialUser={null}
        initialStatus="error"
        initialError="置換エラー"
        autoCheck={false}
      >
        <AuthStateConsumer />
      </AuthStoreProvider>,
    );

    expect(screen.getByLabelText("auth user")).toHaveTextContent("Cookie User");
    expect(screen.getByLabelText("auth status")).toHaveTextContent(
      "authenticated",
    );
    expect(screen.getByLabelText("auth error")).toHaveTextContent("none");
  });
});
