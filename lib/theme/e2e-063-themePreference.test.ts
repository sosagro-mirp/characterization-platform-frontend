/**
 * e2e-063 — Toggle global de tema claro/oscuro.
 *
 * Escrito junto con `spec/63_toggle_global_tema_claro_oscuro.md`, antes de la
 * implementación: arranca EN ROJO (los módulos `./resolveTheme` y
 * `./applyTheme` todavía no existen).
 *
 * El entorno de Vitest de este repositorio es `node` (ver `vitest.config.ts`),
 * por eso todo lo que se prueba aquí es lógica pura: la resolución del tema
 * efectivo, el ciclo del toggle y la aplicación de la clase sobre un elemento
 * raíz inyectado. La verificación visual vive en
 * `docs/testing/test-063-toggle-tema-global.md`.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  THEME_STORAGE_KEY,
  nextPreference,
  readStoredPreference,
  resolveEffectiveTheme,
} from "./resolveTheme";
import { applyTheme } from "./applyTheme";

/** Sustituto mínimo de `document.documentElement` para el entorno node. */
function createRootStub() {
  const classes = new Set<string>();
  return {
    classList: {
      add: (name: string) => void classes.add(name),
      remove: (name: string) => void classes.delete(name),
      contains: (name: string) => classes.has(name),
    },
  };
}

describe("resolveEffectiveTheme — criterios de aceptación 2, 4 y 11", () => {
  it("devuelve el tema fijado cuando la preferencia es explícita, ignorando el sistema", () => {
    expect(resolveEffectiveTheme("light", true)).toBe("light");
    expect(resolveEffectiveTheme("light", false)).toBe("light");
    expect(resolveEffectiveTheme("dark", true)).toBe("dark");
    expect(resolveEffectiveTheme("dark", false)).toBe("dark");
  });

  it("sigue la preferencia del sistema cuando la preferencia es 'system'", () => {
    expect(resolveEffectiveTheme("system", true)).toBe("dark");
    expect(resolveEffectiveTheme("system", false)).toBe("light");
  });
});

describe("nextPreference — ciclo del toggle (criterio de aceptación 2)", () => {
  it("cicla claro → oscuro → sistema → claro", () => {
    expect(nextPreference("light")).toBe("dark");
    expect(nextPreference("dark")).toBe("system");
    expect(nextPreference("system")).toBe("light");
  });

  it("es un ciclo cerrado: tres pulsaciones vuelven al punto de partida", () => {
    const start = "system" as const;
    expect(nextPreference(nextPreference(nextPreference(start)))).toBe(start);
  });
});

describe("readStoredPreference — persistencia (criterio de aceptación 3)", () => {
  const storage = new Map<string, string>();
  const storageStub = {
    getItem: (key: string) => storage.get(key) ?? null,
  };

  beforeEach(() => storage.clear());

  it("usa la clave sosagro.theme", () => {
    expect(THEME_STORAGE_KEY).toBe("sosagro.theme");
  });

  it("lee una preferencia previamente guardada", () => {
    storage.set(THEME_STORAGE_KEY, "dark");
    expect(readStoredPreference(storageStub)).toBe("dark");
  });

  it("cae a 'system' cuando no hay nada guardado", () => {
    expect(readStoredPreference(storageStub)).toBe("system");
  });

  it("cae a 'system' ante un valor corrupto o desconocido", () => {
    storage.set(THEME_STORAGE_KEY, "neon");
    expect(readStoredPreference(storageStub)).toBe("system");
  });

  it("cae a 'system' si el almacenamiento lanza (modo privado / SSR)", () => {
    const throwingStorage = {
      getItem: () => {
        throw new Error("storage no disponible");
      },
    };
    expect(readStoredPreference(throwingStorage)).toBe("system");
  });
});

describe("applyTheme — clase en <html> (criterios de aceptación 5 y 6)", () => {
  it("añade la clase 'dark' cuando el tema efectivo es oscuro", () => {
    const root = createRootStub();
    applyTheme("dark", root);
    expect(root.classList.contains("dark")).toBe(true);
  });

  it("quita la clase 'dark' cuando el tema efectivo es claro", () => {
    const root = createRootStub();
    applyTheme("dark", root);
    applyTheme("light", root);
    expect(root.classList.contains("dark")).toBe(false);
  });

  it("es idempotente ante llamadas repetidas", () => {
    const root = createRootStub();
    applyTheme("dark", root);
    applyTheme("dark", root);
    expect(root.classList.contains("dark")).toBe(true);
    applyTheme("light", root);
    applyTheme("light", root);
    expect(root.classList.contains("dark")).toBe(false);
  });

  it("no lanza cuando no hay elemento raíz disponible (SSR)", () => {
    expect(() => applyTheme("dark", null)).not.toThrow();
  });
});

describe("integración de la preferencia con matchMedia (criterio de aceptación 4)", () => {
  it("recalcula el tema efectivo cuando cambia prefers-color-scheme y la preferencia es 'system'", () => {
    const root = createRootStub();
    const listeners: Array<(e: { matches: boolean }) => void> = [];
    const matchMediaStub = vi.fn(() => ({
      matches: false,
      addEventListener: (_: string, cb: (e: { matches: boolean }) => void) =>
        listeners.push(cb),
      removeEventListener: () => {},
    }));

    const media = matchMediaStub();
    applyTheme(resolveEffectiveTheme("system", media.matches), root);
    expect(root.classList.contains("dark")).toBe(false);

    // El sistema operativo pasa a modo oscuro.
    listeners.forEach((cb) => cb({ matches: true }));
    applyTheme(resolveEffectiveTheme("system", true), root);
    expect(root.classList.contains("dark")).toBe(true);
  });

  it("ignora el cambio del sistema cuando la preferencia es explícita", () => {
    const root = createRootStub();
    applyTheme(resolveEffectiveTheme("light", false), root);
    applyTheme(resolveEffectiveTheme("light", true), root);
    expect(root.classList.contains("dark")).toBe(false);
  });
});
