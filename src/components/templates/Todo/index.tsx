"use client";

import { useCallback } from "react";
import { AccountPanel } from "@/components/modules/AccountPanel";
import { AuthBoundary } from "@/components/modules/AuthBoundary";
import { TodoBoard } from "@/components/modules/TodoBoard";
import {
  type AuthStoreOptions,
  AuthStoreProvider,
  useAuth,
} from "@/hooks/auth";
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
  initialAuthUser?: AuthStoreOptions["initialUser"];
  initialAuthStatus?: AuthStoreOptions["initialStatus"];
  initialAuthError?: AuthStoreOptions["initialError"];
  autoCheckAuth?: boolean;
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
  initialAuthUser = null,
  initialAuthStatus = "idle",
  initialAuthError = "",
  autoCheckAuth = true,
}: TodoTemplateProps) {
  const isRuntimeReady = useTodoRuntimeReady(enableBrowserMock);

  if (!isRuntimeReady) {
    return null;
  }

  return (
    <AuthStoreProvider
      initialUser={initialAuthUser}
      initialStatus={initialAuthStatus}
      initialError={initialAuthError}
      autoCheck={autoCheckAuth && initialAuthStatus === "idle"}
    >
      <AuthBoundary loginPath="/login" returnTo="/todo">
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
            accountPanel={<TodoAccountPanel />}
          />
        </TodoApiStoreProvider>
      </AuthBoundary>
    </AuthStoreProvider>
  );
}

function TodoAccountPanel() {
  const user = useAuth((state) => state.user);
  const error = useAuth((state) => state.error);
  const isLoggingOut = useAuth((state) => state.isLoggingOut);
  const logout = useAuth((state) => state.logout);
  const clearError = useAuth((state) => state.clearError);

  const handleLogout = useCallback(() => {
    clearError();
    void logout();
  }, [clearError, logout]);

  if (!user) {
    return null;
  }

  return (
    <AccountPanel
      displayName={user.displayName}
      profileImageUrl={user.profileImageUrl}
      isLoggingOut={isLoggingOut}
      errorMessage={error}
      onLogout={handleLogout}
    />
  );
}
