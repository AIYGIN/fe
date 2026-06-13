"use client";

import { TodoBoard } from "@/components/modules/TodoBoard";
import {
  type TodoApiStoreOptions,
  TodoApiStoreProvider,
  useTodoRuntimeReady,
} from "@/hooks/todo";
import type { TodoFilter } from "@/types/todo";

export type TodoTemplateProps = {
  initialTodos?: TodoApiStoreOptions["initialTodos"];
  initialFilter?: TodoFilter;
  initialStatus?: TodoApiStoreOptions["initialStatus"];
  initialError?: TodoApiStoreOptions["initialError"];
  initialDraft?: string;
  initialValidationError?: string;
  autoLoad?: TodoApiStoreOptions["autoLoad"];
  enableBrowserMock?: boolean;
};

export function TodoTemplate({
  initialTodos = [],
  initialFilter = "all",
  initialStatus = "loading",
  initialError = "",
  initialDraft = "",
  initialValidationError = "",
  autoLoad = true,
  enableBrowserMock = false,
}: TodoTemplateProps) {
  const isRuntimeReady = useTodoRuntimeReady(enableBrowserMock);

  if (!isRuntimeReady) {
    return null;
  }

  return (
    <TodoApiStoreProvider
      initialTodos={initialTodos}
      initialStatus={initialStatus}
      initialError={initialError}
      autoLoad={autoLoad}
    >
      <TodoBoard
        initialFilter={initialFilter}
        initialDraft={initialDraft}
        initialValidationError={initialValidationError}
      />
    </TodoApiStoreProvider>
  );
}
