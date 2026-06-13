"use client";

import { useContext } from "react";
import { useStore } from "zustand";
import { TodoApiStoreContext } from "@/stores/todo/provider";
import type { TodoApiStoreState } from "@/stores/todo/store";

export function useTodos<T>(selector: (state: TodoApiStoreState) => T): T {
  const store = useContext(TodoApiStoreContext);

  if (!store) {
    throw new Error("useTodos must be used within TodoApiStoreProvider");
  }

  return useStore(store, selector);
}
