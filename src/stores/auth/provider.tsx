"use client";

import { createContext, type ReactNode, useEffect, useRef } from "react";
import {
  type AuthStore,
  type AuthStoreOptions,
  createAuthStore,
} from "./store";

export const AuthStoreContext = createContext<AuthStore | null>(null);

type AuthStoreProviderProps = AuthStoreOptions & {
  children: ReactNode;
  autoCheck?: boolean;
};

export function AuthStoreProvider({
  children,
  initialUser = null,
  initialStatus = "idle",
  initialError = "",
  autoCheck = true,
}: AuthStoreProviderProps) {
  const storeRef = useRef<AuthStore>(null);

  if (!storeRef.current) {
    storeRef.current = createAuthStore({
      initialUser,
      initialStatus,
      initialError,
    });
  }

  const store = storeRef.current;

  useEffect(() => {
    if (autoCheck) {
      void store.getState().checkSession();
    }
  }, [autoCheck, store]);

  return (
    <AuthStoreContext.Provider value={store}>
      {children}
    </AuthStoreContext.Provider>
  );
}
