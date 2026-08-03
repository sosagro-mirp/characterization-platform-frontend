import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { noopStorage } from "@/lib/noopStorage";
import { nextPreference, THEME_STORAGE_KEY, type ThemePreference } from "@/lib/theme/resolveTheme";

interface ThemeState {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  cyclePreference: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      preference: "system",
      setPreference: (preference) => set({ preference }),
      cyclePreference: () => set({ preference: nextPreference(get().preference) }),
    }),
    {
      name: THEME_STORAGE_KEY,
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? noopStorage : window.localStorage
      ),
      partialize: (state) => ({ preference: state.preference }),
    }
  )
);
