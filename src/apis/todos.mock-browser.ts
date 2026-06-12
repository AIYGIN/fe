import { setupWorker } from "msw/browser";
import { getTodosMock } from "./generated/todos/todos.msw";

let workerPromise: Promise<void> | undefined;

export const enableTodoMocking = async () => {
  if (
    typeof window === "undefined" ||
    process.env.NODE_ENV === "production" ||
    process.env.NODE_ENV === "test" ||
    !("serviceWorker" in navigator)
  ) {
    return;
  }

  workerPromise ??= Promise.resolve().then(async () => {
    await setupWorker(...getTodosMock()).start({
      onUnhandledRequest: "bypass",
    });
  });

  await workerPromise;
};
