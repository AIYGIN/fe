import { setupWorker } from "msw/browser";
import {
  type AuthMockScenario,
  createAuthMockHandlers,
} from "./auth.mock-handlers";
import { createTodoMockHandlers } from "./todos.mock-handlers";

type ApiMockBrowserOptions = {
  auth?: AuthMockScenario;
};

let worker: ReturnType<typeof setupWorker> | undefined;
let workerPromise: Promise<void> | undefined;

const defaultApiHost = "http://localhost:3001";
const apiOrigin = new URL(process.env.NEXT_PUBLIC_API_HOST || defaultApiHost)
  .origin;

export const enableApiMocking = async ({
  auth,
}: ApiMockBrowserOptions = {}) => {
  if (
    typeof window === "undefined" ||
    process.env.NODE_ENV === "production" ||
    process.env.NODE_ENV === "test" ||
    !("serviceWorker" in navigator)
  ) {
    return;
  }

  worker ??= setupWorker(
    ...createTodoMockHandlers(),
    ...createAuthMockHandlers(),
  );

  workerPromise ??= worker.start({
    onUnhandledRequest(request, print) {
      if (new URL(request.url).origin === apiOrigin) {
        print.error();
        throw new Error(
          `Unhandled API request: ${request.method} ${request.url}`,
        );
      }
    },
  });

  await workerPromise;

  if (auth) {
    worker.use(...createAuthMockHandlers(auth));
  }
};
