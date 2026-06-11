import { setupServer } from "msw/node";
import { createTodoMockHandlers } from "./todos.fixtures";

export const todoMockServer = setupServer(...createTodoMockHandlers());
