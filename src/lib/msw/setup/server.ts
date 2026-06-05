import { setupServer } from "msw/node";
import { sampleHandlers } from "../handlers/sample";
import { todoHandlers } from "../handlers/todos";

// mswの設定
export const server = setupServer(...sampleHandlers, ...todoHandlers);
