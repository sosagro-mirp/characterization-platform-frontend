import { apiClient } from "@/lib/apiClient";
import { DepartmentSummary } from "@/services/departments.service";
import { TownSummary } from "@/services/towns.service";
import { CropSummary } from "@/app/(instrument)/types";
import { ActorTypeSummary } from "@/app/(admin)/types";
import {
  DashboardCategory,
  DashboardDepartmentCount,
  DashboardDigitalDemand,
  DashboardFilters,
  DashboardKpi,
  DashboardOverview,
  DashboardResponse,
  DashboardSummary,
  InstrumentSummary,
  ServedCategory,
  ServedChartsResponse,
} from "./types";

/** D4: caché HTTP corta para datos que cambian con la muestra de encuestas. */
const ANALYTICS_REVALIDATE_SECONDS = 300;
/** D4: catálogos estables (departamentos, cultivos, instrumentos, tipos de actor). */
const CATALOG_REVALIDATE_SECONDS = 3600;
/** Categorías C1–C15: catálogo estático, cache de una hora (mismo TTL que el backend). */
const CATEGORIES_REVALIDATE_SECONDS = 3600;

/** Mismas claves que `DashboardFilters` — mantener sincronizado con
 * `lib/dashboard/filters.ts` (FILTER_KEYS) al agregar un filtro nuevo.
 * Spec 109 (Fase 6): sin `categoryId` — las rutas de agregación responden 410
 * con él; los gráficos de una categoría lo añaden aparte. */
const FILTER_QUERY_KEYS: (keyof DashboardFilters)[] = [
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

function buildQuery(filters: DashboardFilters): string {
  const params = new URLSearchParams();
  for (const key of FILTER_QUERY_KEYS) {
    const value = filters[key];
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function fetchDashboardAnalytics(
  filters: DashboardFilters,
): Promise<DashboardResponse> {
  return apiClient.get<DashboardResponse>(
    `/api/dashboard/analytics${buildQuery(filters)}`,
    { withAuth: false, next: { revalidate: ANALYTICS_REVALIDATE_SECONDS } },
  );
}

export function fetchDashboardSummary(
  filters: DashboardFilters,
): Promise<DashboardSummary> {
  return apiClient.get<DashboardSummary>(
    `/api/dashboard/summary${buildQuery(filters)}`,
    { withAuth: false, next: { revalidate: ANALYTICS_REVALIDATE_SECONDS } },
  );
}

export function fetchPublicInstruments(): Promise<InstrumentSummary[]> {
  return apiClient.get<InstrumentSummary[]>("/api/instruments/public", {
    withAuth: false,
    next: { revalidate: CATALOG_REVALIDATE_SECONDS },
  });
}

export function fetchPublicDepartments(): Promise<DepartmentSummary[]> {
  return apiClient.get<DepartmentSummary[]>("/api/departments/public", {
    withAuth: false,
    next: { revalidate: CATALOG_REVALIDATE_SECONDS },
  });
}

export function fetchPublicTowns(
  departmentId?: string,
): Promise<TownSummary[]> {
  const query = departmentId
    ? `?departmentId=${encodeURIComponent(departmentId)}`
    : "";
  return apiClient.get<TownSummary[]>(`/api/towns/public${query}`, {
    withAuth: false,
    next: { revalidate: CATALOG_REVALIDATE_SECONDS },
  });
}

export function fetchPublicCrops(): Promise<CropSummary[]> {
  return apiClient.get<CropSummary[]>("/api/types-of-crops", {
    withAuth: false,
    next: { revalidate: CATALOG_REVALIDATE_SECONDS },
  });
}

export function fetchPublicActorTypes(): Promise<ActorTypeSummary[]> {
  return apiClient.get<ActorTypeSummary[]>("/api/actor-types/public", {
    withAuth: false,
    next: { revalidate: CATALOG_REVALIDATE_SECONDS },
  });
}

export function fetchDepartmentCounts(
  filters: DashboardFilters,
): Promise<DashboardDepartmentCount[]> {
  return apiClient.get<DashboardDepartmentCount[]>(
    `/api/dashboard/department-counts${buildQuery(filters)}`,
    { withAuth: false, next: { revalidate: ANALYTICS_REVALIDATE_SECONDS } },
  );
}

export function fetchDashboardOverview(
  filters: DashboardFilters,
): Promise<DashboardOverview> {
  return apiClient.get<DashboardOverview>(
    `/api/dashboard/overview${buildQuery(filters)}`,
    { withAuth: false, next: { revalidate: ANALYTICS_REVALIDATE_SECONDS } },
  );
}

export function fetchCategories(): Promise<DashboardCategory[]> {
  return apiClient.get<DashboardCategory[]>("/api/dashboard/categories", {
    withAuth: false,
    next: { revalidate: CATEGORIES_REVALIDATE_SECONDS },
  });
}

export function fetchKpis(filters: DashboardFilters): Promise<DashboardKpi[]> {
  return apiClient.get<DashboardKpi[]>(
    `/api/dashboard/kpis${buildQuery(filters)}`,
    { withAuth: false, next: { revalidate: ANALYTICS_REVALIDATE_SECONDS } },
  );
}

export function fetchDigitalDemand(
  filters: DashboardFilters,
): Promise<DashboardDigitalDemand> {
  return apiClient.get<DashboardDigitalDemand>(
    `/api/dashboard/digital-demand${buildQuery(filters)}`,
    { withAuth: false, next: { revalidate: ANALYTICS_REVALIDATE_SECONDS } },
  );
}

// ─── Spec 109 — dashboards sobre gráficos del constructor ───────────────────

/** Categorías con gráficos públicos publicados (P20; el backend omite las vacías). */
export function fetchServedCategories(): Promise<ServedCategory[]> {
  return apiClient.get<ServedCategory[]>("/api/dashboard/categories", {
    withAuth: false,
    next: { revalidate: ANALYTICS_REVALIDATE_SECONDS },
  });
}

/** Gráficos públicos publicados de una categoría, con los filtros globales (P22). */
export function fetchServedCharts(
  categoryCode: string,
  filters: DashboardFilters,
): Promise<ServedChartsResponse> {
  // `categoryId` va aparte: el código de la categoría, no el filtro del 43.
  const query = buildQuery({ ...filters, categoryId: undefined });
  const sep = query ? "&" : "?";
  return apiClient.get<ServedChartsResponse>(
    `/api/dashboard/charts${query}${sep}categoryId=${encodeURIComponent(categoryCode)}`,
    { withAuth: false, next: { revalidate: ANALYTICS_REVALIDATE_SECONDS } },
  );
}

/** Dashboard privado (ADMIN/RESEARCHER, `no-store`): categorías con gráficos de ambas audiencias. */
export function fetchPrivateCategories(): Promise<ServedCategory[]> {
  return apiClient.get<ServedCategory[]>("/api/dashboard/private/categories", {
    cache: "no-store",
  });
}

/** Dashboard privado: gráficos públicos y privados publicados de una categoría. */
export function fetchPrivateCharts(
  categoryCode: string,
  filters: DashboardFilters,
): Promise<ServedChartsResponse> {
  // `categoryId` va aparte: el código de la categoría, no el filtro del 43.
  const query = buildQuery({ ...filters, categoryId: undefined });
  const sep = query ? "&" : "?";
  return apiClient.get<ServedChartsResponse>(
    `/api/dashboard/private/charts${query}${sep}categoryId=${encodeURIComponent(categoryCode)}`,
    { cache: "no-store" },
  );
}

/** Igual que `fetchServedCharts`, pero un 404 (categoría sin gráficos o inactiva) da `null`. */
export async function fetchServedChartsOrNull(
  categoryCode: string,
  filters: DashboardFilters,
): Promise<ServedChartsResponse | null> {
  try {
    return await fetchServedCharts(categoryCode, filters);
  } catch (err) {
    if ((err as { status?: number }).status === 404) return null;
    throw err;
  }
}
