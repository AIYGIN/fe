import "@testing-library/jest-dom";

import { afterAll, afterEach, beforeAll } from "vitest";
import { todoMockServer } from "./src/apis/todos.mock-server";

beforeAll(() => todoMockServer.listen());
afterEach(() => todoMockServer.resetHandlers());
afterAll(() => todoMockServer.close());
