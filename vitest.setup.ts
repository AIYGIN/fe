import "@testing-library/jest-dom";

// mswの設定追加
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./src/lib/msw/setup/server";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
