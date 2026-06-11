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

  workerPromise ??= Promise.all([
    import("msw/browser"),
    import("./todos.fixtures"),
  ]).then(async ([{ setupWorker }, { createTodoMockHandlers }]) => {
    await setupWorker(...createTodoMockHandlers()).start({
      onUnhandledRequest: "bypass",
    });
  });

  await workerPromise;
};
