import { setupServer } from "msw/node";
import { sampleHandlers } from "../handlers/sample";

// mswの設定
export const server = setupServer(...sampleHandlers);
