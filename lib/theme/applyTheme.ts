import type { EffectiveTheme } from "./resolveTheme";

interface ClassListLike {
  add: (name: string) => void;
  remove: (name: string) => void;
  contains: (name: string) => boolean;
}

interface RootLike {
  classList: ClassListLike;
}

/** Aplica/quita la clase `dark` sobre el elemento raíz. Idempotente y SSR-safe. */
export function applyTheme(theme: EffectiveTheme, root: RootLike | null): void {
  if (!root) return;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

const THEME_COLOR_BY_EFFECTIVE_THEME: Record<EffectiveTheme, string> = {
  light: "#14532d",
  dark: "#0f172a",
};

/** Sincroniza <meta name="theme-color"> con el tema efectivo (barra del navegador móvil). */
export function syncThemeColorMeta(theme: EffectiveTheme, doc: Document | null): void {
  if (!doc) return;
  const meta = doc.querySelector('meta[name="theme-color"]');
  if (!meta) return;
  meta.setAttribute("content", THEME_COLOR_BY_EFFECTIVE_THEME[theme]);
}
