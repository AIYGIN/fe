import { render, screen, waitFor, within } from "@testing-library/react";
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

const createDeferred = () => {
  let resolve: () => void = () => {};
  const promise = new Promise<void>((nextResolve) => {
    resolve = nextResolve;
  });

  return { promise, resolve };
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

  it("タイトル検索は前後の空白と大文字小文字を無視し、0件時は検索専用の案内を表示する", async () => {
    const user = userEvent.setup();
    resetTodoStore([
      oldCompletedTodo,
      newestTodo,
      {
        id: "todo-english",
        title: "Review Storybook",
        completed: false,
        createdAt: "2026-06-05T03:00:00.000Z",
      },
    ]);
    renderTodoPage();

    const searchbox = await screen.findByRole("searchbox", {
      name: "TODOを検索",
    });

    await user.type(searchbox, "  storyBOOK  ");

    const list = screen.getByRole("list", { name: "TODO一覧" });
    expect(within(list).getByText("Review Storybook")).toBeInTheDocument();
    expect(within(list).queryByText("新しいTODO")).not.toBeInTheDocument();

    await user.clear(searchbox);
    await user.type(searchbox, "一致しない検索語");

    expect(
      screen.getByText("検索条件に一致するTODOはありません"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("表示するTODOはありません"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("list", { name: "TODO一覧" }),
    ).not.toBeInTheDocument();
  });

  it("既存3フィルタにそれぞれの対象件数を表示する", async () => {
    renderTodoPage();

    await screen.findByRole("list", { name: "TODO一覧" });

    expect(screen.getByRole("button", { name: "すべて" })).toHaveTextContent(
      "2",
    );
    expect(screen.getByRole("button", { name: "未完了" })).toHaveTextContent(
      "1",
    );
    expect(screen.getByRole("button", { name: "完了" })).toHaveTextContent("1");
  });

  it("全TODOに対する完了件数を進捗として表示する", async () => {
    renderTodoPage();

    await screen.findByRole("list", { name: "TODO一覧" });

    const progress = screen.getByRole("progressbar", { name: "完了進捗" });
    expect(progress).toHaveAttribute("aria-valuemin", "0");
    expect(progress).toHaveAttribute("aria-valuenow", "1");
    expect(progress).toHaveAttribute("aria-valuemax", "2");
    expect(progress).toHaveTextContent("1 / 2件完了");
  });

  it("完了済みTODOを件数付き確認ダイアログから一括削除する", async () => {
    const user = userEvent.setup();
    renderTodoPage();

    await user.click(
      await screen.findByRole("button", {
        name: "完了済みを一括削除（1件）",
      }),
    );

    const dialog = screen.getByRole("dialog", {
      name: "完了済みTODOを一括削除",
    });
    expect(dialog).toHaveTextContent("1件");

    await user.click(
      within(dialog).getByRole("button", { name: "1件を削除する" }),
    );
    await waitFor(() => {
      expect(screen.queryByText("完了済みTODO")).not.toBeInTheDocument();
    });

    const list = screen.getByRole("list", { name: "TODO一覧" });
    expect(within(list).getByText("新しいTODO")).toBeInTheDocument();
    expect(
      within(list).getByRole("checkbox", {
        name: "新しいTODOを完了にする",
      }),
    ).toHaveFocus();
  });

  it("完了済みTODOの一括削除が一部失敗した場合は成功分だけ削除し、全通信完了まで再確定できない", async () => {
    const user = userEvent.setup();
    const successfulCompletedTodo: Todo = {
      id: "todo-completed-success",
      title: "削除に成功するTODO",
      completed: true,
      createdAt: "2026-06-05T01:30:00.000Z",
    };
    const failedCompletedTodo: Todo = {
      id: "todo-completed-failure",
      title: "削除に失敗するTODO",
      completed: true,
      createdAt: "2026-06-05T01:00:00.000Z",
    };
    const successResponse = createDeferred();
    const failureResponse = createDeferred();
    const requestedIds = new Set<string>();

    resetTodoStore([failedCompletedTodo, successfulCompletedTodo, newestTodo]);
    server.use(
      http.delete("*/api/todos/:id", async ({ params }) => {
        const id = String(params.id);
        requestedIds.add(id);

        if (id === successfulCompletedTodo.id) {
          await successResponse.promise;
          return new HttpResponse(null, { status: 204 });
        }

        await failureResponse.promise;
        return HttpResponse.json(
          { message: "一部のTODOを削除できませんでした" },
          { status: 500 },
        );
      }),
    );
    renderTodoPage();

    await user.click(
      await screen.findByRole("button", {
        name: "完了済みを一括削除（2件）",
      }),
    );
    const dialog = screen.getByRole("dialog", {
      name: "完了済みTODOを一括削除",
    });
    const confirmButton = within(dialog).getByRole("button", {
      name: "2件を削除する",
    });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(requestedIds).toEqual(
        new Set([successfulCompletedTodo.id, failedCompletedTodo.id]),
      );
    });
    expect(confirmButton).toBeDisabled();

    successResponse.resolve();
    await waitFor(() => {
      expect(confirmButton).toBeDisabled();
    });

    failureResponse.resolve();

    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "一部のTODOを削除できませんでした",
    );
    await waitFor(() => {
      expect(
        screen.queryByText(successfulCompletedTodo.title),
      ).not.toBeInTheDocument();
    });
    expect(screen.getByText(failedCompletedTodo.title)).toBeInTheDocument();
  });

  it("追加失敗時は入力内容と既存一覧を保持してエラーを通知する", async () => {
    const user = userEvent.setup();
    server.use(
      http.post("*/api/todos", () =>
        HttpResponse.json(
          { message: "TODOを追加できませんでした" },
          { status: 500 },
        ),
      ),
    );
    renderTodoPage();

    const input = await screen.findByLabelText("新しいTODO");
    await user.type(input, "失敗しても残すTODO");
    await user.click(screen.getByRole("button", { name: "追加" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "TODOを追加できませんでした",
    );
    expect(input).toHaveValue("失敗しても残すTODO");
    const list = screen.getByRole("list", { name: "TODO一覧" });
    expect(within(list).getByText("新しいTODO")).toBeInTheDocument();
    expect(within(list).getByText("完了済みTODO")).toBeInTheDocument();
  });

  it("完了切り替え失敗時は対象TODOを変更せず対象行にエラーを表示する", async () => {
    const user = userEvent.setup();
    server.use(
      http.patch("*/api/todos/:id", () =>
        HttpResponse.json(
          { message: "完了状態を更新できませんでした" },
          { status: 500 },
        ),
      ),
    );
    renderTodoPage();

    const checkbox = await screen.findByRole("checkbox", {
      name: "新しいTODOを完了にする",
    });
    const item = checkbox.closest("li");
    expect(item).not.toBeNull();

    await user.click(checkbox);

    expect(
      await within(item as HTMLLIElement).findByRole("alert"),
    ).toHaveTextContent("完了状態を更新できませんでした");
    expect(checkbox).not.toBeChecked();
    expect(screen.getByText("完了済みTODO")).toBeInTheDocument();
  });

  it("削除失敗時は対象TODOと既存一覧を保持してダイアログ内にエラーを表示する", async () => {
    const user = userEvent.setup();
    server.use(
      http.delete("*/api/todos/:id", () =>
        HttpResponse.json(
          { message: "TODOを削除できませんでした" },
          { status: 500 },
        ),
      ),
    );
    renderTodoPage();

    await user.click(
      await screen.findByRole("button", { name: "削除: 新しいTODO" }),
    );
    const dialog = screen.getByRole("dialog", { name: "TODOを削除" });
    await user.click(within(dialog).getByRole("button", { name: "削除する" }));

    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "TODOを削除できませんでした",
    );
    const list = screen.getByRole("list", { name: "TODO一覧" });
    expect(within(list).getByText("新しいTODO")).toBeInTheDocument();
    expect(within(list).getByText("完了済みTODO")).toBeInTheDocument();
  });

  it("追加成功をaria-liveで通知する", async () => {
    const user = userEvent.setup();
    renderTodoPage();

    await user.type(await screen.findByLabelText("新しいTODO"), "通知するTODO");
    await user.click(screen.getByRole("button", { name: "追加" }));

    const liveRegion = await screen.findByRole("status", {
      name: "操作結果",
    });
    await waitFor(() => {
      expect(liveRegion).toHaveTextContent("TODOを追加しました");
    });
  });

  it("同種操作を連続実行してもaria-live領域を更新する", async () => {
    const user = userEvent.setup();
    renderTodoPage();

    const input = await screen.findByLabelText("新しいTODO");
    await user.type(input, "1件目の通知TODO");
    await user.click(screen.getByRole("button", { name: "追加" }));

    const liveRegion = await screen.findByRole("status", {
      name: "操作結果",
    });
    await waitFor(() => {
      expect(liveRegion).toHaveTextContent("TODOを追加しました");
    });

    const mutations: MutationRecord[] = [];
    const observer = new MutationObserver((records) => {
      mutations.push(...records);
    });
    observer.observe(liveRegion, {
      childList: true,
      characterData: true,
      subtree: true,
    });

    try {
      await user.type(input, "2件目の通知TODO");
      await user.click(screen.getByRole("button", { name: "追加" }));
      expect(await screen.findByText("2件目の通知TODO")).toBeInTheDocument();

      await waitFor(() => {
        expect(mutations.length).toBeGreaterThan(0);
      });
      expect(liveRegion).toHaveTextContent("TODOを追加しました");
    } finally {
      observer.disconnect();
    }
  });

  it("完了切り替え成功をaria-liveで通知する", async () => {
    const user = userEvent.setup();
    renderTodoPage();

    await user.click(
      await screen.findByRole("checkbox", {
        name: "新しいTODOを完了にする",
      }),
    );

    const liveRegion = await screen.findByRole("status", {
      name: "操作結果",
    });
    await waitFor(() => {
      expect(liveRegion).toHaveTextContent("TODOを完了にしました");
    });
  });

  it("削除成功をaria-liveで通知する", async () => {
    const user = userEvent.setup();
    renderTodoPage();

    await user.click(
      await screen.findByRole("button", { name: "削除: 新しいTODO" }),
    );
    const dialog = await screen.findByRole("dialog", { name: "TODOを削除" });
    await user.click(within(dialog).getByRole("button", { name: "削除する" }));

    const liveRegion = await screen.findByRole("status", {
      name: "操作結果",
    });
    await waitFor(() => {
      expect(liveRegion).toHaveTextContent("TODOを削除しました");
    });
  });

  it("単体削除成功後は残存するTODOの操作へフォーカスを移動する", async () => {
    const user = userEvent.setup();
    renderTodoPage();

    await user.click(
      await screen.findByRole("button", { name: "削除: 完了済みTODO" }),
    );
    const dialog = await screen.findByRole("dialog", { name: "TODOを削除" });
    await user.click(within(dialog).getByRole("button", { name: "削除する" }));

    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: "TODOを削除" }),
      ).not.toBeInTheDocument();
    });
    expect(
      screen.getByRole("checkbox", { name: "新しいTODOを完了にする" }),
    ).toHaveFocus();
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

    await waitFor(() => {
      expect(
        within(screen.getByRole("list", { name: "TODO一覧" })).queryByText(
          "新しいTODO",
        ),
      ).not.toBeInTheDocument();
    });
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
