import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef } from "react";
import { describe, expect, it } from "vitest";
import type { TodoDto } from "@/apis/generated/model";
import { getTodoControllerUpdateTodoMockHandler } from "@/apis/generated/todos/todos.msw";
import { todoMockServer } from "@/apis/todos.mock-server";
import { TodoApiStoreProvider, useTodos } from ".";

const todoFixture: TodoDto = {
  id: "todo-selector",
  title: "selectorを確認する",
  completed: false,
  createdAt: "2026-06-14T00:00:00.000Z",
};

const createDeferred = <T,>() => {
  let resolve: (value: T) => void = () => {};
  const promise = new Promise<T>((nextResolve) => {
    resolve = nextResolve;
  });

  return { promise, resolve };
};

function SelectorConsumer() {
  const renderCount = useRef(0);
  renderCount.current += 1;

  const isCreating = useTodos((state) => state.isCreating);
  const toggleTodo = useTodos((state) => state.toggleTodo);

  return (
    <>
      <output aria-label="render count">{renderCount.current}</output>
      <output aria-label="create status">
        {isCreating ? "creating" : "idle"}
      </output>
      <button type="button" onClick={() => void toggleTodo(todoFixture)}>
        toggle
      </button>
    </>
  );
}

function TodoTitlesConsumer() {
  const titles = useTodos((state) =>
    state.todos.map((todo) => todo.title).join(","),
  );

  return <output aria-label="todo titles">{titles}</output>;
}

describe("useTodos", () => {
  it("未選択のstore状態が変化してもconsumerを再レンダーしない", async () => {
    const user = userEvent.setup();
    const updateResponse = createDeferred<TodoDto>();
    let requestCount = 0;
    let requestCompleted = false;
    todoMockServer.use(
      getTodoControllerUpdateTodoMockHandler(async () => {
        requestCount += 1;
        const response = await updateResponse.promise;
        requestCompleted = true;
        return response;
      }),
    );

    render(
      <TodoApiStoreProvider
        initialTodos={[todoFixture]}
        initialStatus="idle"
        initialError=""
        autoLoad={false}
      >
        <SelectorConsumer />
      </TodoApiStoreProvider>,
    );

    expect(screen.getByLabelText("render count")).toHaveTextContent("1");

    await user.click(screen.getByRole("button", { name: "toggle" }));
    await waitFor(() => {
      expect(requestCount).toBe(1);
    });

    expect(screen.getByLabelText("create status")).toHaveTextContent("idle");
    expect(screen.getByLabelText("render count")).toHaveTextContent("1");

    updateResponse.resolve({ ...todoFixture, completed: true });
    await waitFor(() => {
      expect(requestCompleted).toBe(true);
    });
  });

  it("Provider外から利用した場合は構成エラーを通知する", () => {
    expect(() => render(<SelectorConsumer />)).toThrow(
      "useTodos must be used within TodoApiStoreProvider",
    );
  });

  it("Providerの再レンダーでstore instanceを再生成しない", () => {
    const { rerender } = render(
      <TodoApiStoreProvider
        initialTodos={[todoFixture]}
        initialStatus="idle"
        initialError=""
        autoLoad={false}
      >
        <TodoTitlesConsumer />
      </TodoApiStoreProvider>,
    );

    rerender(
      <TodoApiStoreProvider
        initialTodos={[{ ...todoFixture, id: "replaced", title: "置換後" }]}
        initialStatus="error"
        initialError="置換エラー"
        autoLoad={false}
      >
        <TodoTitlesConsumer />
      </TodoApiStoreProvider>,
    );

    expect(screen.getByLabelText("todo titles")).toHaveTextContent(
      todoFixture.title,
    );
    expect(screen.getByLabelText("todo titles")).not.toHaveTextContent(
      "置換後",
    );
  });
});
