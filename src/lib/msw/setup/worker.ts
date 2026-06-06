import { setupWorker } from "msw/browser";
import { sampleHandlers } from "../handlers/sample";
import { todoHandlers } from "../handlers/todos";

export const worker = setupWorker(...sampleHandlers, ...todoHandlers);
