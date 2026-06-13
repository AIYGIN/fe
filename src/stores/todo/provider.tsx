"use client";

import { createContext, type ReactNode, useEffect, useRef } from "react";
import {
  createTodoApiStore,
  type TodoApiStore,
  type TodoApiStoreOptions,
} from "./store";

export const TodoApiStoreContext = createContext<TodoApiStore | null>(null);

type TodoApiStoreProviderProps = TodoApiStoreOptions & {
  children: ReactNode;
};

export function TodoApiStoreProvider({
  children,
  initialTodos,
  initialStatus,
  initialError,
  autoLoad,
}: TodoApiStoreProviderProps) {
  const storeRef = useRef<TodoApiStore>(null);

  if (!storeRef.current) {
    storeRef.current = createTodoApiStore({
      initialTodos,
      initialStatus,
      initialError,
      autoLoad: false,
    });
  }

  const store = storeRef.current;

  useEffect(() => {
    if (autoLoad) {
      void store.getState().loadTodos();
    }
  }, [autoLoad, store]);

  return (
    <TodoApiStoreContext.Provider value={store}>
      {children}
    </TodoApiStoreContext.Provider>
  );
}
