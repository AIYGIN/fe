"use client";

import { type ReactNode, useEffect } from "react";
import { useAuth } from "@/hooks/auth";
import { AuthStatusPanel } from "./AuthStatusPanel";

export type AuthBoundaryProps = {
  children: ReactNode;
  loginPath: string;
  returnTo: string;
};

export function AuthBoundary({
  children,
  loginPath,
  returnTo,
}: AuthBoundaryProps) {
  const status = useAuth((state) => state.status);
  const error = useAuth((state) => state.error);
  const checkSession = useAuth((state) => state.checkSession);

  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.assign(createLoginUrl(loginPath, returnTo));
    }
  }, [loginPath, returnTo, status]);

  if (status === "authenticated") {
    return <>{children}</>;
  }

  return (
    <AuthStatusPanel
      status={status}
      errorMessage={error}
      onRetry={() => void checkSession()}
    />
  );
}

function createLoginUrl(loginPath: string, returnTo: string) {
  const separator = loginPath.includes("?") ? "&" : "?";
  return `${loginPath}${separator}${new URLSearchParams({ next: returnTo })}`;
}
