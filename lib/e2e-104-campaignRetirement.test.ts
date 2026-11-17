/**
 * e2e-104 — Spec 104 «Retiro de campañas» (H8), etapa A: la web sin campañas.
 * `spec/104_retiro_de_campanas.md` (raíz del ecosistema). Cubre C7 y C8.
 *
 * Escrito junto con el spec, antes de la implementación: arranca EN ROJO.
 * Hoy `/campaign` está en `PROTECTED_PREFIXES`, `legacyCampaignRedirect` no
 * existe, el middleware y `AdminGuard` mandan a `/campaign` y el dashboard
 * acepta `campaignId`. Las redirecciones reales se prueban en la ronda manual
 * `test-104` (TC-104-002 y TC-104-003).
 *
 * ── Contrato tras el spec 104 ───────────────────────────────────────────────
 * `lib/roleRouting.ts`
 *   - `PROTECTED_PREFIXES` no incluye `/campaign`.
 *   - `legacyCampaignRedirect(pathname: string): string | null`
 *       `/campaign`, `/campaign/…`              → `/productores`
 *       `/admin/campaigns`, `/admin/campaigns/…` → `/admin/farmers`
 *       cualquier otra (incl. `/campaigns-x`)    → null
 * `lib/dashboard/filters.ts`
 *   - `parseDashboardParams` ignora `campaignId`; `buildDashboardQuery` no lo
 *     emite.
 * Fuente
 *   - `middleware.ts` y `components/auth/AdminGuard.tsx` no contienen la
 *     cadena `"/campaign"` como destino de redirección.
 *   - No existen `app/(instrument)/campaign` ni `app/(admin)/admin/campaigns`.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildDashboardQuery,
  parseDashboardParams,
} from "./dashboard/filters";

interface RoleRoutingModule {
  PROTECTED_PREFIXES: readonly string[];
  legacyCampaignRedirect?: (pathname: string) => string | null;
}

async function loadRouting(): Promise<RoleRoutingModule> {
  const specifier = "./roleRouting";
  return (await import(/* @vite-ignore */ specifier)) as RoleRoutingModule;
}

const ROOT = resolve(__dirname, "..");
const source = (rel: string) => readFileSync(resolve(ROOT, rel), "utf8");

describe("Spec 104 — C7: rutas de campañas retiradas", () => {
  it("/campaign deja de ser un prefijo protegido", async () => {
    const { PROTECTED_PREFIXES } = await loadRouting();
    expect(PROTECTED_PREFIXES).not.toContain("/campaign");
    expect(PROTECTED_PREFIXES).toContain("/productores");
  });

  it("legacyCampaignRedirect lleva las rutas viejas al flujo nuevo", async () => {
    const { legacyCampaignRedirect } = await loadRouting();
    expect(typeof legacyCampaignRedirect).toBe("function");
    const redirect = legacyCampaignRedirect!;
    expect(redirect("/campaign")).toBe("/productores");
    expect(redirect("/campaign/abc")).toBe("/productores");
    expect(redirect("/campaign/abc/session/def")).toBe("/productores");
    expect(redirect("/admin/campaigns")).toBe("/admin/farmers");
    expect(redirect("/admin/campaigns/new")).toBe("/admin/farmers");
    expect(redirect("/admin/campaigns/abc")).toBe("/admin/farmers");
  });

  it("legacyCampaignRedirect no toca otras rutas", async () => {
    const { legacyCampaignRedirect } = await loadRouting();
    const redirect = legacyCampaignRedirect!;
    for (const path of [
      "/productores",
      "/productores/abc",
      "/campaigns-x",
      "/admin/farmers",
      "/admin/instruments",
      "/instrument/abc",
    ]) {
      expect(redirect(path)).toBeNull();
    }
  });

  it("middleware y AdminGuard ya no redirigen a /campaign", () => {
    expect(source("middleware.ts")).not.toMatch(/["'`]\/campaign["'`]/);
    expect(source("components/auth/AdminGuard.tsx")).not.toMatch(
      /["'`]\/campaign["'`]/,
    );
  });

  it("las páginas de campañas ya no existen", () => {
    expect(existsSync(resolve(ROOT, "app/(instrument)/campaign"))).toBe(false);
    expect(existsSync(resolve(ROOT, "app/(admin)/admin/campaigns"))).toBe(
      false,
    );
  });

  it("los componentes compartidos con el flujo 102 se movieron fuera de campaign/", () => {
    expect(existsSync(resolve(ROOT, "components/campaign/ConsentModal.tsx"))).toBe(
      false,
    );
    expect(
      existsSync(resolve(ROOT, "components/consents/ConsentModal.tsx")),
    ).toBe(true);
    expect(
      existsSync(resolve(ROOT, "lib/registration/preSurveyFlow.ts")),
    ).toBe(true);
  });
});

describe("Spec 104 — C8: dashboard sin filtro de campaña", () => {
  it("un enlace viejo con campaignId se abre sin ese filtro", () => {
    const state = parseDashboardParams({
      campaignId: "11111111-1111-4111-8111-111111111111",
      departmentId: "d-1",
    });
    expect(state.filters).toEqual({ departmentId: "d-1" });
  });

  it("la consulta generada nunca lleva campaignId", () => {
    const query = buildDashboardQuery({
      view: "overview",
      filters: {
        departmentId: "d-1",
        campaignId: "11111111-1111-4111-8111-111111111111",
      } as Parameters<typeof buildDashboardQuery>[0]["filters"],
    });
    expect(query).not.toContain("campaignId");
    expect(query).toContain("departmentId=d-1");
  });
});
