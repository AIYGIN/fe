import type { ComponentProps, ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { TodoTemplate } from "@/components/templates/Todo";

vi.mock("@/components/templates/Todo", () => ({
  TodoTemplate: vi.fn(() => null),
}));

const importTodoPage = () => import("./page");

describe("/todo page", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("デフォルトではブラウザMSWを無効にしてBFFへ接続する", async () => {
    vi.stubEnv("NEXT_PUBLIC_TODO_ENABLE_BROWSER_MOCK", "");
    const { default: Page } = await importTodoPage();

    const page = Page() as ReactElement<ComponentProps<typeof TodoTemplate>>;

    expect(page.props.enableBrowserMock).toBe(false);
  });

  it("NEXT_PUBLIC_TODO_ENABLE_BROWSER_MOCK=true のときだけブラウザMSWを有効にする", async () => {
    vi.stubEnv("NEXT_PUBLIC_TODO_ENABLE_BROWSER_MOCK", "true");
    const { default: Page } = await importTodoPage();

    const page = Page() as ReactElement<ComponentProps<typeof TodoTemplate>>;

    expect(page.props.enableBrowserMock).toBe(true);
  });
});
