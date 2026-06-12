"use client";

import { useEffect, useRef } from "react";
import { useStore } from "zustand";
import type { TodoDto } from "@/apis/generated/model";
import { createTodoApiStore } from "@/store/todo/store";

type LoadStatus = "idle" | "loading" | "error";

type UseTodosOptions = {
  initialTodos: TodoDto[];
  initialStatus: LoadStatus;
  initialError: string;
  autoLoad: boolean;
};

export function useTodos({
  initialTodos,
  initialStatus,
  initialError,
  autoLoad,
}: UseTodosOptions) {
  const storeRef = useRef<ReturnType<typeof createTodoApiStore>>(null);

  if (!storeRef.current) {
    storeRef.current = createTodoApiStore({
      initialTodos,
      initialStatus,
      initialError,
      autoLoad: false,
    });
  }

  const store = storeRef.current;
  const state = useStore(store);

  useEffect(() => {
    if (autoLoad) {
      void store.getState().loadTodos();
    }
  }, [autoLoad, store]);

  return {
    ...state,
    addTodo: (title: string) => state.addTodo({ title }),
  };
}
