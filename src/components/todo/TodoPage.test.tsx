import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it } from "vitest";
import { resetTodoStore } from "@/lib/msw/handlers/todos";
import { server } from "@/lib/msw/setup/server";
import type { Todo } from "@/types/todo";
import { TodoPage } from "./TodoPage";

const newestTodo: Todo = {
  id: "todo-new",
  title: "新しいTODO",
  completed: false,
  createdAt: "2026-06-05T02:00:00.000Z",
};

const oldCompletedTodo: Todo = {
  id: "todo-old",
  title: "完了済みTODO",
  completed: true,
  createdAt: "2026-06-05T01:00:00.000Z",
};

const renderTodoPage = () => {
  render(<TodoPage />);
};

describe("TodoPage", () => {
  beforeEach(() => {
    resetTodoStore([oldCompletedTodo, newestTodo]);
  });

  it("TODO一覧を新しい順に表示する", async () => {
    renderTodoPage();

    const list = await screen.findByRole("list", { name: "TODO一覧" });
    const items = within(list).getAllByRole("listitem");

    expect(items[0]).toHaveTextContent("新しいTODO");
    expect(items[1]).toHaveTextContent("完了済みTODO");
  });

  it("1〜80文字のTODOを追加できる", async () => {
    const user = userEvent.setup();
    renderTodoPage();

    await user.type(
      await screen.findByLabelText("新しいTODO"),
      "請求書を確認する",
    );
    await user.click(screen.getByRole("button", { name: "追加" }));

    const list = await screen.findByRole("list", { name: "TODO一覧" });
    const items = within(list).getAllByRole("listitem");

    expect(items[0]).toHaveTextContent("請求書を確認する");
  });

  it("空文字、空白のみ、81文字以上のTODOを追加できない", async () => {
    const user = userEvent.setup();
    renderTodoPage();

    await screen.findByRole("list", { name: "TODO一覧" });
    await user.click(screen.getByRole("button", { name: "追加" }));
    expect(screen.getByText("TODOを入力してください")).toBeInTheDocument();

    await user.type(screen.getByLabelText("新しいTODO"), "   ");
    await user.click(screen.getByRole("button", { name: "追加" }));
    expect(screen.getByText("TODOを入力してください")).toBeInTheDocument();

    await user.clear(screen.getByLabelText("新しいTODO"));
    await user.type(screen.getByLabelText("新しいTODO"), "a".repeat(81));
    await user.click(screen.getByRole("button", { name: "追加" }));
    expect(
      screen.getByText("TODOは80文字以内で入力してください"),
    ).toBeInTheDocument();
    expect(screen.queryByText("a".repeat(81))).not.toBeInTheDocument();
  });

  it("チェックボックスで完了状態を切り替えられる", async () => {
    const user = userEvent.setup();
    renderTodoPage();

    const checkbox = await screen.findByRole("checkbox", {
      name: "新しいTODOを完了にする",
    });

    await user.click(checkbox);
    await user.click(screen.getByRole("button", { name: "完了" }));

    const list = screen.getByRole("list", { name: "TODO一覧" });

    expect(within(list).getByText("新しいTODO")).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: "新しいTODOを未完了にする" }),
    ).toBeChecked();
  });

  it("すべて / 未完了 / 完了 のフィルタで表示対象が切り替わる", async () => {
    const user = userEvent.setup();
    renderTodoPage();

    await screen.findByText("新しいTODO");
    await user.click(screen.getByRole("button", { name: "未完了" }));

    let list = screen.getByRole("list", { name: "TODO一覧" });

    expect(within(list).getByText("新しいTODO")).toBeInTheDocument();
    expect(within(list).queryByText("完了済みTODO")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "完了" }));
    list = screen.getByRole("list", { name: "TODO一覧" });

    expect(within(list).queryByText("新しいTODO")).not.toBeInTheDocument();
    expect(within(list).getByText("完了済みTODO")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "すべて" }));
    list = screen.getByRole("list", { name: "TODO一覧" });

    expect(within(list).getByText("新しいTODO")).toBeInTheDocument();
    expect(within(list).getByText("完了済みTODO")).toBeInTheDocument();
  });

  it("削除操作では確認ダイアログが表示され、確定時のみTODOが削除される", async () => {
    const user = userEvent.setup();
    renderTodoPage();

    await user.click(
      await screen.findByRole("button", { name: "削除: 新しいTODO" }),
    );

    expect(
      screen.getByRole("dialog", { name: "TODOを削除" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "キャンセル" }));
    expect(
      within(screen.getByRole("list", { name: "TODO一覧" })).getByText(
        "新しいTODO",
      ),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "削除: 新しいTODO" }));
    await user.click(screen.getByRole("button", { name: "削除する" }));

    expect(
      within(screen.getByRole("list", { name: "TODO一覧" })).queryByText(
        "新しいTODO",
      ),
    ).not.toBeInTheDocument();
  });

  it("削除確認ダイアログはフォーカスを閉じ込め、閉じたら操作元へ戻す", async () => {
    const user = userEvent.setup();
    renderTodoPage();

    const deleteButton = await screen.findByRole("button", {
      name: "削除: 新しいTODO",
    });

    await user.click(deleteButton);

    const cancelButton = screen.getByRole("button", { name: "キャンセル" });
    const confirmButton = screen.getByRole("button", { name: "削除する" });

    expect(cancelButton).toHaveFocus();

    await user.tab();
    expect(confirmButton).toHaveFocus();

    await user.tab();
    expect(cancelButton).toHaveFocus();

    await user.keyboard("{Escape}");

    expect(
      screen.queryByRole("dialog", { name: "TODOを削除" }),
    ).not.toBeInTheDocument();
    expect(deleteButton).toHaveFocus();
  });

  it("一覧取得失敗時にエラー表示と再読み込み操作を表示する", async () => {
    server.use(
      http.get("*/api/todos", () =>
        HttpResponse.json({ message: "failed" }, { status: 500 }),
      ),
    );

    renderTodoPage();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "TODO一覧を取得できませんでした",
    );
    expect(
      screen.getByRole("button", { name: "再読み込み" }),
    ).toBeInTheDocument();
  });
});
