"use client";

import { useCallback } from "react";
import { LoginPanel } from "@/components/modules/LoginPanel";
import {
  type AuthStatus,
  AuthStoreProvider,
  useAuth,
  useAuthRuntimeReady,
  useGoogleLogin,
} from "@/hooks/auth";

export type LoginTemplateProps = {
  returnTo?: string;
  initialAuthStatus?: AuthStatus;
  initialAuthError?: string;
  enableBrowserMock?: boolean;
};

export function LoginTemplate({
  returnTo,
  initialAuthStatus = "idle",
  initialAuthError = "",
  enableBrowserMock = false,
}: LoginTemplateProps) {
  const isRuntimeReady = useAuthRuntimeReady(enableBrowserMock);

  if (!isRuntimeReady) {
    return null;
  }

  return (
    <AuthStoreProvider
      initialStatus={initialAuthStatus}
      initialError={initialAuthError}
      autoCheck={initialAuthStatus === "idle"}
    >
      <LoginTemplateContent returnTo={returnTo} />
    </AuthStoreProvider>
  );
}

function LoginTemplateContent({
  returnTo,
}: Pick<LoginTemplateProps, "returnTo">) {
  const status = useAuth((state) => state.status);
  const error = useAuth((state) => state.error);
  const clearError = useAuth((state) => state.clearError);
  const startGoogleLogin = useGoogleLogin(returnTo);

  const handleLogin = useCallback(() => {
    clearError();
    startGoogleLogin();
  }, [clearError, startGoogleLogin]);

  return (
    <LoginPanel
      isChecking={status === "checking"}
      isLoginDisabled={status === "checking" || status === "authenticated"}
      errorMessage={error}
      onLogin={handleLogin}
    />
  );
}
