/**
 * e2e-102 — Spec 102 «Flujo del encuestador por productor en la web» (H7):
 * entrada por rol y rutas protegidas (funciones puras de `lib/roleRouting.ts`).
 *
 * Escrito junto con el spec, antes de la implementación: arranca EN ROJO
 * (hoy un POLLSTER entra a `/campaign` y `PROTECTED_PREFIXES` vive dentro de
 * `middleware.ts`, sin exportar). Cubre C1. Las redirecciones reales del
 * middleware se prueban en la ronda manual `test-102`.
 *
 * ── Contrato de `lib/roleRouting.ts` tras el spec 102 ──────────────────────
 *
 * - `defaultRouteForRole(role)`: «admin» y «researcher» → `/admin/instruments`;
 *   cualquier otro rol (incluido null) → `/productores`.
 * - `PROTECTED_PREFIXES: readonly string[]` incluye `/admin`, `/instrument`,
 *   `/campaign`, `/change-password` y `/productores`.
 * - `isProtectedPath(pathname)`: true si coincide con un prefijo exacto o con
 *   el prefijo seguido de «/». `/productoresx` no es protegido.
 */
import { describe, expect, it } from "vitest";

interface RoleRoutingModule {
  defaultRouteForRole(role: string | null | undefined): string;
  PROTECTED_PREFIXES: readonly string[];
  isProtectedPath(pathname: string): boolean;
}

async function load(): Promise<RoleRoutingModule> {
  const specifier = "../roleRouting";
  return (await import(/* @vite-ignore */ specifier)) as RoleRoutingModule;
}

describe("Spec 102 — entrada del encuestador", () => {
  it("C1 — un POLLSTER entra a /productores", async () => {
    const { defaultRouteForRole } = await load();
    expect(defaultRouteForRole("pollster")).toBe("/productores");
    expect(defaultRouteForRole(null)).toBe("/productores");
  });

  it("C1 — ADMIN y RESEARCHER siguen entrando al panel", async () => {
    const { defaultRouteForRole } = await load();
    expect(defaultRouteForRole("admin")).toBe("/admin/instruments");
    expect(defaultRouteForRole("researcher")).toBe("/admin/instruments");
  });

  it("C1 — /productores exige sesión, sin perder las rutas protegidas de hoy", async () => {
    const { PROTECTED_PREFIXES } = await load();
    expect([...PROTECTED_PREFIXES]).toEqual(
      expect.arrayContaining([
        "/admin",
        "/instrument",
        "/change-password",
        "/productores",
      ]),
    );
  });

  it("isProtectedPath respeta los límites del prefijo", async () => {
    const { isProtectedPath } = await load();
    expect(isProtectedPath("/productores")).toBe(true);
    expect(isProtectedPath("/productores/abc")).toBe(true);
    expect(isProtectedPath("/productores/nuevo")).toBe(true);
    expect(isProtectedPath("/productoresx")).toBe(false);
    expect(isProtectedPath("/encuesta/123")).toBe(false);
    expect(isProtectedPath("/")).toBe(false);
  });
});
