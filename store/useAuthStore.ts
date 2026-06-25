import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  clearMustChangeCookie,
  clearRoleCookie,
  clearSessionCookie,
  setMustChangeCookie,
  setRoleCookie,
  setSessionCookie,
} from "@/lib/sessionCookie";
import { noopStorage } from "@/lib/noopStorage";
import type { RoleName } from "@/app/(admin)/types";

export interface AuthUser {
  userId: string;
  name: string;
  lastName: string;
  email: string;
  role: RoleName | null;
  mustChangePassword: boolean;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setSession: (user: AuthUser, accessToken: string) => void;
  clear: () => void;
}

const STORAGE_KEY = "sosagro.auth";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setSession: (user, accessToken) => {
        setSessionCookie();
        setRoleCookie(user.role);
        if (user.mustChangePassword) {
          setMustChangeCookie();
        } else {
          clearMustChangeCookie();
        }
        set({ user, accessToken, isAuthenticated: true });
      },
      clear: () => {
        clearSessionCookie();
        clearRoleCookie();
        clearMustChangeCookie();
        set({ user: null, accessToken: null, isAuthenticated: false });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? noopStorage : window.localStorage
      ),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.isAuthenticated) {
          setSessionCookie();
          setRoleCookie(state.user?.role ?? null);
          if (state.user?.mustChangePassword) {
            setMustChangeCookie();
          } else {
            clearMustChangeCookie();
          }
        } else {
          clearSessionCookie();
          clearRoleCookie();
          clearMustChangeCookie();
        }
      },
    },
  ),
);
