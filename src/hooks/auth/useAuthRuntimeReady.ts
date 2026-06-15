"use client";

import { useEffect, useState } from "react";
import { enableAuthMocking } from "@/apis/auth.mock-browser";

export function useAuthRuntimeReady(enableBrowserMock: boolean) {
  const [isReady, setIsReady] = useState(!enableBrowserMock);

  useEffect(() => {
    if (!enableBrowserMock) {
      setIsReady(true);
      return;
    }

    void enableAuthMocking().finally(() => setIsReady(true));
  }, [enableBrowserMock]);

  return isReady;
}
