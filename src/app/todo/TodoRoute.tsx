"use client";

import { useEffect, useState } from "react";
import { enableTodoMocking } from "@/apis/todos.mock-browser";
import { TodoPage } from "@/components/todo/TodoPage";

export function TodoRoute() {
  const [isMockReady, setIsMockReady] = useState(false);

  useEffect(() => {
    void enableTodoMocking().finally(() => setIsMockReady(true));
  }, []);

  if (!isMockReady) {
    return null;
  }

  return <TodoPage />;
}
