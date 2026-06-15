import { createStore } from "zustand/vanilla";
import { getAuthSession, logoutAuthSession } from "@/apis/auth";
import type { AuthMeResponseDto } from "@/apis/generated/model";

export type AuthStatus =
  | "idle"
  | "checking"
  | "authenticated"
  | "unauthenticated"
  | "error";

export type AuthStoreOptions = {
  initialUser?: AuthMeResponseDto | null;
  initialStatus?: AuthStatus;
  initialError?: string;
};

export type AuthStoreState = {
  user: AuthMeResponseDto | null;
  status: AuthStatus;
  error: string;
  isLoggingOut: boolean;
  checkSession: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
};

export const createAuthStore = ({
  initialUser = null,
  initialStatus = "idle",
  initialError = "",
}: AuthStoreOptions = {}) => {
  let authRevision = 0;
  let sessionRequest: Promise<void> | null = null;

  return createStore<AuthStoreState>()((set, get) => ({
    user: initialUser,
    status: initialStatus,
    error: initialError,
    isLoggingOut: false,
    checkSession: () => {
      if (get().isLoggingOut) {
        return Promise.resolve();
      }

      if (sessionRequest) {
        return sessionRequest;
      }

      const requestRevision = ++authRevision;
      set({ status: "checking", error: "" });

      const request = (async () => {
        try {
          const user = await getAuthSession();

          if (requestRevision !== authRevision) {
            return;
          }

          if (user) {
            set({ user, status: "authenticated", error: "" });
            return;
          }

          set({ user: null, status: "unauthenticated", error: "" });
        } catch {
          if (requestRevision === authRevision) {
            set({
              user: null,
              status: "error",
              error: "認証状態を確認できませんでした",
            });
          }
        } finally {
          if (sessionRequest === request) {
            sessionRequest = null;
          }
        }
      })();

      sessionRequest = request;
      return request;
    },
    logout: async () => {
      if (get().isLoggingOut) {
        return;
      }

      authRevision += 1;
      sessionRequest = null;
      set({ isLoggingOut: true, error: "" });

      try {
        await logoutAuthSession();
        set({ user: null, status: "unauthenticated", error: "" });
      } catch {
        set({ status: "error", error: "ログアウトできませんでした" });
      } finally {
        set({ isLoggingOut: false });
      }
    },
    clearError: () => set({ error: "" }),
  }));
};

export type AuthStore = ReturnType<typeof createAuthStore>;
