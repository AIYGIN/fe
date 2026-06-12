import { setupServer } from "msw/node";
import { getTodosMock } from "./generated/todos/todos.msw";

export const todoMockServer = setupServer(...getTodosMock());
