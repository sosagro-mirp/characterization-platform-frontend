import { apiClient } from "@/lib/apiClient";
import { DepartmentSummary } from "@/services/departments.service";
import { TownSummary } from "@/services/towns.service";
import { CropSummary } from "@/app/(instrument)/types";
import { ActorTypeSummary } from "@/app/(admin)/types";
import {
  DashboardDepartmentCount,
  DashboardFilters,
  DashboardOverview,
  DashboardResponse,
  DashboardSummary,
  InstrumentSummary,
} from "./types";

/** D4: caché HTTP corta para datos que cambian con la muestra de encuestas. */
const ANALYTICS_REVALIDATE_SECONDS = 300;
/** D4: catálogos estables (departamentos, cultivos, instrumentos, tipos de actor). */
const CATALOG_REVALIDATE_SECONDS = 3600;

function buildQuery(filters: DashboardFilters): string {
  const params = new URLSearchParams();
  if (filters.instrumentId) params.set("instrumentId", filters.instrumentId);
  if (filters.departmentId) params.set("departmentId", filters.departmentId);
  if (filters.townId) params.set("townId", filters.townId);
  if (filters.cropId) params.set("cropId", filters.cropId);
  if (filters.actorTypeId) params.set("actorTypeId", filters.actorTypeId);
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
