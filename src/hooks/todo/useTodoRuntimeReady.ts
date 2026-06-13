"use client";

import { useEffect, useState } from "react";
import { enableTodoMocking } from "@/apis/todos.mock-browser";

export function useTodoRuntimeReady(enableBrowserMock: boolean) {
  const [isReady, setIsReady] = useState(!enableBrowserMock);

  useEffect(() => {
    if (!enableBrowserMock) {
      setIsReady(true);
      return;
    }

    void enableTodoMocking().finally(() => setIsReady(true));
  }, [enableBrowserMock]);

  return isReady;
}
