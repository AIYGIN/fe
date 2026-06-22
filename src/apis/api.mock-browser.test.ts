import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const setupWorkerMock = vi.hoisted(() => vi.fn());

vi.mock("msw/browser", () => ({
  setupWorker: setupWorkerMock,
}));

type RegisteredHttpHandler = {
  info: {
    method: string;
    path: string;
  };
};

describe("browser API mock setup", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NODE_ENV", "development");
    vi.stubGlobal("navigator", { serviceWorker: {} });
    setupWorkerMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("既存のTodo/Auth入口を同時に利用しても単一workerを開始する", async () => {
    const start = vi.fn().mockResolvedValue(undefined);
    const use = vi.fn();
    setupWorkerMock.mockReturnValue({ start, use });
    const { enableTodoMocking } = await import("./todos.mock-browser");
    const { enableAuthMocking } = await import("./auth.mock-browser");

    await enableTodoMocking();
    await enableAuthMocking({ session: "unauthenticated" });

    expect(setupWorkerMock).toHaveBeenCalledOnce();
    const registeredHandlers = setupWorkerMock.mock.calls[0] as unknown as
      | RegisteredHttpHandler[]
      | undefined;
    const registeredRoutes = registeredHandlers?.map(
      ({ info }) => `${info.method} ${info.path}`,
    );

    expect(registeredRoutes).toEqual([
      "GET */todos",
      "POST */todos",
      "DELETE */todos/:id",
      "PATCH */todos/:id",
      "GET */auth/me",
      "POST */auth/logout",
    ]);
    expect(start).toHaveBeenCalledOnce();
    expect(use).toHaveBeenCalledOnce();
  });
});
