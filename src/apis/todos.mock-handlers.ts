import type {
  CreateTodoRequestDto,
  TodoDto,
  UpdateTodoRequestDto,
} from "./generated/model";
import {
  getTodoControllerCreateTodoMockHandler,
  getTodoControllerDeleteTodoMockHandler,
  getTodoControllerGetTodosMockHandler,
  getTodoControllerUpdateTodoMockHandler,
} from "./generated/todos/todos.msw";

export const createTodoMockHandlers = () => {
  let todos: TodoDto[] = [];
  let nextTodoSequence = 1;

  return [
    getTodoControllerGetTodosMockHandler(() => todos),
    getTodoControllerCreateTodoMockHandler(async ({ request }) => {
      const { title } = (await request.json()) as CreateTodoRequestDto;
      const sequence = nextTodoSequence++;
      const todo: TodoDto = {
        id: `mock-todo-${sequence}`,
        title: title.trim(),
        completed: false,
        createdAt: new Date(Date.UTC(2026, 0, 1, 0, 0, sequence)).toISOString(),
      };

      todos = [todo, ...todos];
      return todo;
    }),
    getTodoControllerDeleteTodoMockHandler(({ params }) => {
      todos = todos.filter((todo) => todo.id !== params.id);
    }),
    getTodoControllerUpdateTodoMockHandler(async ({ params, request }) => {
      const { completed } = (await request.json()) as UpdateTodoRequestDto;
      const target = todos.find((todo) => todo.id === params.id);

      if (!target) {
        throw new Error(`Unknown TODO: ${String(params.id)}`);
      }

      const updated = { ...target, completed };
      todos = todos.map((todo) => (todo.id === target.id ? updated : todo));
      return updated;
    }),
  ];
};
