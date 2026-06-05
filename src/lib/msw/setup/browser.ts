let workerPromise: Promise<void> | undefined;

export const enableMocking = async () => {
  if (typeof window === "undefined") {
    return;
  }

  if (
    process.env.NODE_ENV === "production" ||
    process.env.NODE_ENV === "test"
  ) {
    return;
  }

  if (!("serviceWorker" in navigator)) {
    return;
  }

  if (window.location.port === "6006") {
    return;
  }

  workerPromise ??= import("./worker").then(async ({ worker }) => {
    await worker.start({
      onUnhandledRequest: "bypass",
    });
  });

  await workerPromise;
};
