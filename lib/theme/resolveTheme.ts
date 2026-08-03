export type ThemePreference = "light" | "dark" | "system";
export type EffectiveTheme = "light" | "dark";

/** Misma clave usada por el `ThemeToggle` manual eliminado en el spec 56. */
export const THEME_STORAGE_KEY = "sosagro.theme";

const PREFERENCE_CYCLE: ThemePreference[] = ["light", "dark", "system"];

export function resolveEffectiveTheme(
  preference: ThemePreference,
  systemPrefersDark: boolean
): EffectiveTheme {
  if (preference === "system") {
    return systemPrefersDark ? "dark" : "light";
  }
  return preference;
}

export function nextPreference(preference: ThemePreference): ThemePreference {
  const index = PREFERENCE_CYCLE.indexOf(preference);
  return PREFERENCE_CYCLE[(index + 1) % PREFERENCE_CYCLE.length];
}

interface StorageLike {
  getItem: (key: string) => string | null;
}

function isThemePreference(value: string | null): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

/** Cae a `"system"` ante ausencia, valor corrupto o almacenamiento no disponible. */
export function readStoredPreference(storage: StorageLike): ThemePreference {
  try {
    const stored = storage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(stored) ? stored : "system";
  } catch {
    return "system";
  }
}
