import type {
  CreateTodoRequestDto,
  ErrorResponseSchema,
  UpdateTodoRequestDto,
} from "@/apis/generated/model";
import {
  todoControllerCreateTodo,
  todoControllerDeleteTodo,
  todoControllerGetTodos,
  todoControllerUpdateTodo,
} from "@/apis/generated/todos/todos";

const fallbackMessage = "TODO API request failed";

export class TodoApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "TodoApiError";
  }
}

const toApiError = (data: ErrorResponseSchema, status: number) =>
  new TodoApiError(data.message || fallbackMessage, status);

const runOperation = async <T>(
  operation: () => Promise<
    | { data: T; status: 200 | 201 | 204 }
    | {
        data: ErrorResponseSchema;
        status: number;
      }
  >,
) => {
  try {
    const response = await operation();

    if (response.status >= 200 && response.status < 300) {
      return response.data as T;
    }

    throw toApiError(response.data as ErrorResponseSchema, response.status);
  } catch (error) {
    if (error instanceof TodoApiError) {
      throw error;
    }

    throw new TodoApiError(fallbackMessage, 0);
  }
};

export const fetchTodos = () =>
  runOperation(async () => todoControllerGetTodos());

export const createTodo = (input: CreateTodoRequestDto) =>
  runOperation(async () => todoControllerCreateTodo(input));

export const updateTodo = (id: string, input: UpdateTodoRequestDto) =>
  runOperation(async () => todoControllerUpdateTodo(id, input));

export const deleteTodo = (id: string) =>
  runOperation(async () => todoControllerDeleteTodo(id));
