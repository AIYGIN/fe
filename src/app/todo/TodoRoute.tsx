"use client";

import { useEffect, useState } from "react";
import { TodoPage } from "@/components/todo/TodoPage";
import { enableMocking } from "@/lib/msw/setup/browser";

export function TodoRoute() {
  const [isMockReady, setIsMockReady] = useState(false);

  useEffect(() => {
    void enableMocking().finally(() => setIsMockReady(true));
  }, []);

  if (!isMockReady) {
    return null;
  }

  return <TodoPage />;
}
