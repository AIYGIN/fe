export const endpoints = {
  todos: "/api/todos",
  todo: (id: string) => `/api/todos/${id}`,
} as const;
