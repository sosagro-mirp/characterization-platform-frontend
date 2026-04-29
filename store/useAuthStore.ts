import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { clearSessionCookie, setSessionCookie } from "@/lib/sessionCookie";

export interface AuthUser {
  userId: string;
  name: string;
  lastName: string;
  email: string;
  role: string | null;
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
        set({ user, accessToken, isAuthenticated: true });
      },
      clear: () => {
        clearSessionCookie();
        set({ user: null, accessToken: null, isAuthenticated: false });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? noopStorage : window.localStorage,
      ),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.isAuthenticated) {
          setSessionCookie();
        } else {
          clearSessionCookie();
        }
      },
    },
  ),
);

const noopStorage: Storage = {
  length: 0,
  clear: () => {},
  getItem: () => null,
  key: () => null,
  removeItem: () => {},
  setItem: () => {},
};
