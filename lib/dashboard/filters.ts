import { DashboardFilters } from "@/app/(dashboard)/types";

/** Buckets fijos de `ageRange` (spec 43, D3) — mismo contrato que
 * `AGE_RANGE_BUCKETS` en `backend/src/dashboard/dashboard-response-filters.config.ts`. */
export const AGE_RANGE_BUCKETS = ["<30", "30-45", "46-60", ">60"] as const;

export type DashboardView = "overview" | "category";

export interface DashboardPageState {
  view: DashboardView;
  categoryId?: string;
  filters: DashboardFilters;
}

// Spec 66 (Fase 3, D7, 2026-08-10): C1..C14, no C1..C15 — fusión de C1+C3 y
// renumeración en cascada de las categorías siguientes.
const CATEGORY_ID_PATTERN = /^C([1-9]|1[0-4])$/;

/** Mismas claves que `DashboardFilters` — mantener sincronizado al agregar un filtro nuevo. */
const FILTER_KEYS: (keyof DashboardFilters)[] = [
  "departmentId",
  "townId",
  "cropId",
  "actorTypeId",
  "gender",
  "ageRange",
  "educationLevel",
  "connectivity",
  "profile",
  "tenure",
  "chainStage",
  "dateFrom",
  "dateTo",
];

type RawParams = Record<string, string | undefined>;

/**
 * D6 (spec 43): resuelve el estado de la página (vista + categoría + filtros)
 * desde `searchParams`. `view` es puramente derivado de `categoryId` — un
 * `categoryId` válido implica `view=category`; su ausencia o un valor fuera
 * de C1..C14 implica `view=overview`. Spec 107: `instrumentId` se ignora (la
 * consulta por instrumento ya no es pública).
 */
export function parseDashboardParams(raw: RawParams): DashboardPageState {
  const categoryId =
    raw.categoryId && CATEGORY_ID_PATTERN.test(raw.categoryId)
      ? raw.categoryId
      : undefined;

  const filters: DashboardFilters = {};
  for (const key of FILTER_KEYS) {
    const value = raw[key];
    if (value) filters[key] = value;
  }

  return {
    view: categoryId ? "category" : "overview",
    categoryId,
    filters,
  };
}

/** Botón «Limpiar»: reinicia los filtros manteniendo la vista/categoría activa. */
export function clearDashboardFilters(
  state: DashboardPageState,
): DashboardPageState {
  return { view: state.view, categoryId: state.categoryId, filters: {} };
}

/** Serializa el estado a query string para `router.push`/enlaces (D6, bookmarkable). */
export function buildDashboardQuery(state: DashboardPageState): string {
  const params = new URLSearchParams();
  if (state.view === "category" && state.categoryId) {
    params.set("view", "category");
    params.set("categoryId", state.categoryId);
  }
  for (const key of FILTER_KEYS) {
    const value = state.filters[key];
    if (value) params.set(key, value);
  }
  return params.toString();
}
