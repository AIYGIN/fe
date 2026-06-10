import type {
  CreateTodoRequestDto,
  TodoDto,
  UpdateTodoRequestDto,
} from "@/apis/generated/model";
import { endpoints } from "@/lib/api/endpoints";

type ApiErrorBody = {
  message?: string;
};

export class TodoApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "TodoApiError";
  }
}

const resolveApiUrl = (path: string) => {
  if (process.env.NODE_ENV === "test") {
    return `http://localhost:3000${path}`;
  }

  return path;
};

const parseJson = async <T>(response: Response): Promise<T> => {
  const body = (await response.json().catch(() => ({}))) as ApiErrorBody;

  if (!response.ok) {
    throw new TodoApiError(
      body.message ?? "TODO API request failed",
      response.status,
    );
  }

  return body as T;
};

export const fetchTodos = async () => {
  const response = await fetch(resolveApiUrl(endpoints.todos));
  return parseJson<TodoDto[]>(response);
};

export const createTodo = async (input: CreateTodoRequestDto) => {
  const response = await fetch(resolveApiUrl(endpoints.todos), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  return parseJson<TodoDto>(response);
};

export const updateTodo = async (id: string, input: UpdateTodoRequestDto) => {
  const response = await fetch(resolveApiUrl(endpoints.todo(id)), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  return parseJson<TodoDto>(response);
};

export const deleteTodo = async (id: string) => {
  const response = await fetch(resolveApiUrl(endpoints.todo(id)), {
    method: "DELETE",
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiErrorBody;
    throw new TodoApiError(
      body.message ?? "TODO API request failed",
      response.status,
    );
  }
};
