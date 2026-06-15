"use client";

import { useContext } from "react";
import { useStore } from "zustand";
import { AuthStoreContext } from "@/stores/auth/provider";
import type { AuthStoreState } from "@/stores/auth/store";

export function useAuth<T>(selector: (state: AuthStoreState) => T): T {
  const store = useContext(AuthStoreContext);

  if (!store) {
    throw new Error("useAuth must be used within AuthStoreProvider");
  }

  return useStore(store, selector);
}
