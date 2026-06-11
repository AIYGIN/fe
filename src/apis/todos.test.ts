import { afterEach, describe, expect, it, vi } from "vitest";
import type {
  CreateTodoRequestDto,
  ErrorResponseSchema,
  TodoDto,
  UpdateTodoRequestDto,
} from "@/apis/generated/model";
import * as todoOperations from "@/apis/generated/todos/todos";

const existingTodo: TodoDto = {
  id: "todo-existing",
  title: "既存TODO",
  completed: false,
  createdAt: "2026-06-05T01:00:00.000Z",
};

const headers = new Headers();

const importTodoApi = () => {
  const modulePath = "./todos";
  return import(/* @vite-ignore */ modulePath);
};

describe("Todo API", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("一覧・追加・更新・削除で対応するOrval生成operationを呼び出す", async () => {
    const createInput: CreateTodoRequestDto = { title: "追加TODO" };
    const updateInput: UpdateTodoRequestDto = { completed: true };
    const createdTodo: TodoDto = { ...existingTodo, ...createInput };
    const updatedTodo: TodoDto = { ...existingTodo, ...updateInput };
    const getTodosSpy = vi
      .spyOn(todoOperations, "todoControllerGetTodos")
      .mockResolvedValue({
        data: [existingTodo],
        status: 200,
        headers,
      });
    const createTodoSpy = vi
      .spyOn(todoOperations, "todoControllerCreateTodo")
      .mockResolvedValue({
        data: createdTodo,
        status: 201,
        headers,
      });
    const updateTodoSpy = vi
      .spyOn(todoOperations, "todoControllerUpdateTodo")
      .mockResolvedValue({
        data: updatedTodo,
        status: 200,
        headers,
      });
    const deleteTodoSpy = vi
      .spyOn(todoOperations, "todoControllerDeleteTodo")
      .mockResolvedValue({
        data: undefined,
        status: 204,
        headers,
      });
    const { createTodo, deleteTodo, fetchTodos, updateTodo } =
      await importTodoApi();

    await expect(fetchTodos()).resolves.toEqual([existingTodo]);
    await expect(createTodo(createInput)).resolves.toEqual(createdTodo);
    await expect(updateTodo(existingTodo.id, updateInput)).resolves.toEqual(
      updatedTodo,
    );
    await expect(deleteTodo(existingTodo.id)).resolves.toBeUndefined();

    expect(getTodosSpy).toHaveBeenCalledOnce();
    expect(createTodoSpy).toHaveBeenCalledWith(createInput);
    expect(updateTodoSpy).toHaveBeenCalledWith(existingTodo.id, updateInput);
    expect(deleteTodoSpy).toHaveBeenCalledWith(existingTodo.id);
  });

  it("生成operationのエラー文言を画面へ通知する", async () => {
    const error: ErrorResponseSchema = {
      message: "TODO APIに失敗しました",
    };

    vi.spyOn(todoOperations, "todoControllerGetTodos").mockResolvedValue({
      data: error,
      status: 500,
      headers,
    });
    vi.spyOn(todoOperations, "todoControllerCreateTodo").mockResolvedValue({
      data: error,
      status: 500,
      headers,
    });
    vi.spyOn(todoOperations, "todoControllerUpdateTodo").mockResolvedValue({
      data: error,
      status: 500,
      headers,
    });
    vi.spyOn(todoOperations, "todoControllerDeleteTodo").mockResolvedValue({
      data: error,
      status: 500,
      headers,
    });
    const { createTodo, deleteTodo, fetchTodos, updateTodo } =
      await importTodoApi();

    await expect(fetchTodos()).rejects.toThrow(error.message);
    await expect(createTodo({ title: "追加TODO" })).rejects.toThrow(
      error.message,
    );
    await expect(
      updateTodo(existingTodo.id, { completed: true }),
    ).rejects.toThrow(error.message);
    await expect(deleteTodo(existingTodo.id)).rejects.toThrow(error.message);
  });

  it.each([
    {
      name: "作成400",
      mockOperation: () =>
        vi.spyOn(todoOperations, "todoControllerCreateTodo").mockResolvedValue({
          data: { message: "TODOの入力が不正です" },
          status: 400,
          headers,
        }),
      request: async () => {
        const { createTodo } = await importTodoApi();
        return createTodo({ title: "追加TODO" });
      },
      message: "TODOの入力が不正です",
    },
    {
      name: "更新400",
      mockOperation: () =>
        vi.spyOn(todoOperations, "todoControllerUpdateTodo").mockResolvedValue({
          data: { message: "完了状態が不正です" },
          status: 400,
          headers,
        }),
      request: async () => {
        const { updateTodo } = await importTodoApi();
        return updateTodo(existingTodo.id, { completed: true });
      },
      message: "完了状態が不正です",
    },
    {
      name: "更新404",
      mockOperation: () =>
        vi.spyOn(todoOperations, "todoControllerUpdateTodo").mockResolvedValue({
          data: { message: "TODOが見つかりません" },
          status: 404,
          headers,
        }),
      request: async () => {
        const { updateTodo } = await importTodoApi();
        return updateTodo(existingTodo.id, { completed: true });
      },
      message: "TODOが見つかりません",
    },
    {
      name: "削除404",
      mockOperation: () =>
        vi.spyOn(todoOperations, "todoControllerDeleteTodo").mockResolvedValue({
          data: { message: "TODOが見つかりません" },
          status: 404,
          headers,
        }),
      request: async () => {
        const { deleteTodo } = await importTodoApi();
        return deleteTodo(existingTodo.id);
      },
      message: "TODOが見つかりません",
    },
  ])(
    "$nameでもAPIエラー文言を画面へ通知する",
    async ({ mockOperation, request, message }) => {
      mockOperation();

      await expect(request()).rejects.toThrow(message);
    },
  );

  it("message欠落時は既存のフォールバック文言を画面へ通知する", async () => {
    const errorWithoutMessage = {} as ErrorResponseSchema;

    vi.spyOn(todoOperations, "todoControllerGetTodos").mockResolvedValue({
      data: errorWithoutMessage,
      status: 500,
      headers,
    });
    vi.spyOn(todoOperations, "todoControllerCreateTodo").mockResolvedValue({
      data: errorWithoutMessage,
      status: 500,
      headers,
    });
    vi.spyOn(todoOperations, "todoControllerUpdateTodo").mockResolvedValue({
      data: errorWithoutMessage,
      status: 500,
      headers,
    });
    vi.spyOn(todoOperations, "todoControllerDeleteTodo").mockResolvedValue({
      data: errorWithoutMessage,
      status: 500,
      headers,
    });
    const { createTodo, deleteTodo, fetchTodos, updateTodo } =
      await importTodoApi();

    await expect(fetchTodos()).rejects.toThrow("TODO API request failed");
    await expect(createTodo({ title: "追加TODO" })).rejects.toThrow(
      "TODO API request failed",
    );
    await expect(
      updateTodo(existingTodo.id, { completed: true }),
    ).rejects.toThrow("TODO API request failed");
    await expect(deleteTodo(existingTodo.id)).rejects.toThrow(
      "TODO API request failed",
    );
  });

  it("非JSONレスポンス時は既存のフォールバック文言を画面へ通知する", async () => {
    const parseError = new SyntaxError("Unexpected token");

    vi.spyOn(todoOperations, "todoControllerGetTodos").mockRejectedValue(
      parseError,
    );
    vi.spyOn(todoOperations, "todoControllerCreateTodo").mockRejectedValue(
      parseError,
    );
    vi.spyOn(todoOperations, "todoControllerUpdateTodo").mockRejectedValue(
      parseError,
    );
    vi.spyOn(todoOperations, "todoControllerDeleteTodo").mockRejectedValue(
      parseError,
    );
    const { createTodo, deleteTodo, fetchTodos, updateTodo } =
      await importTodoApi();

    await expect(fetchTodos()).rejects.toThrow("TODO API request failed");
    await expect(createTodo({ title: "追加TODO" })).rejects.toThrow(
      "TODO API request failed",
    );
    await expect(
      updateTodo(existingTodo.id, { completed: true }),
    ).rejects.toThrow("TODO API request failed");
    await expect(deleteTodo(existingTodo.id)).rejects.toThrow(
      "TODO API request failed",
    );
  });
});
