import { apiClient } from "@/lib/apiClient";
import type { ChartCompatMatrix } from "@/lib/dashboard/chartCompat";
import type {
  BuilderCatalogQuestion,
  BuilderCategory,
  BuilderChart,
  BuilderChartEvent,
  BuilderChartPayload,
  BuilderEntityMetric,
  BuilderPreviewResult,
} from "@/app/(admin)/types";

// Spec 109 — constructor de dashboard (API del spec 108, solo ADMIN).
const BASE = "/api/dashboard/builder";
const NO_STORE = { cache: "no-store" as const };

// ── categorías ──

export function listBuilderCategories(): Promise<BuilderCategory[]> {
  return apiClient.get<BuilderCategory[]>(`${BASE}/categories`, NO_STORE);
}

export function createBuilderCategory(body: {
  code: string;
  name: string;
  description?: string;
}): Promise<{ categoryId: string }> {
  return apiClient.post(`${BASE}/categories`, body);
}

export function updateBuilderCategory(
  id: string,
  body: Partial<{ code: string; name: string; description: string; isActive: boolean }>,
): Promise<BuilderCategory> {
  return apiClient.patch(`${BASE}/categories/${id}`, body);
}

export function reorderBuilderCategories(categoryIds: string[]): Promise<unknown> {
  return apiClient.patch(`${BASE}/categories/reorder`, { categoryIds });
}

export function deleteBuilderCategory(id: string): Promise<unknown> {
  return apiClient.delete(`${BASE}/categories/${id}`);
}

// ── gráficos ──

export function listBuilderCharts(query: {
  categoryId?: string;
  archived?: boolean;
}): Promise<BuilderChart[]> {
  const params = new URLSearchParams();
  if (query.categoryId) params.set("categoryId", query.categoryId);
  if (query.archived) params.set("archived", "true");
  return apiClient.get<BuilderChart[]>(`${BASE}/charts?${params}`, NO_STORE);
}

export function getBuilderChart(id: string): Promise<BuilderChart> {
  return apiClient.get<BuilderChart>(`${BASE}/charts/${id}`, NO_STORE);
}

export function createBuilderChart(
  body: BuilderChartPayload,
): Promise<{ chartId: string }> {
  return apiClient.post(`${BASE}/charts`, body);
}

export function updateBuilderChart(
  id: string,
  body: Partial<BuilderChartPayload>,
): Promise<BuilderChart> {
  // El origen del gráfico (preguntas o métrica) no se cambia al editar: el
  // backend rechaza `sourceKind` en el PATCH.
  const patch = { ...body };
  delete patch.sourceKind;
  return apiClient.patch(`${BASE}/charts/${id}`, patch);
}

export function reorderBuilderCharts(
  categoryId: string,
  chartIds: string[],
): Promise<unknown> {
  return apiClient.patch(`${BASE}/charts/reorder`, { categoryId, chartIds });
}

export type BuilderChartAction =
  | "publish"
  | "unpublish"
  | "archive"
  | "restore"
  | "duplicate";

export function builderChartAction(
  id: string,
  action: BuilderChartAction,
): Promise<{ chartId?: string }> {
  return apiClient.post(`${BASE}/charts/${id}/${action}`);
}

export function getBuilderChartEvents(id: string): Promise<BuilderChartEvent[]> {
  return apiClient.get<BuilderChartEvent[]>(`${BASE}/charts/${id}/events`, NO_STORE);
}

export function previewSavedChart(
  id: string,
  audience: "public" | "private",
): Promise<BuilderPreviewResult> {
  return apiClient.get<BuilderPreviewResult>(
    `${BASE}/charts/${id}/preview?audience=${audience}`,
    NO_STORE,
  );
}

export function previewDraftChart(
  body: BuilderChartPayload,
): Promise<BuilderPreviewResult> {
  return apiClient.post<BuilderPreviewResult>(`${BASE}/preview`, body);
}

// ── catálogos ──

export function searchBuilderQuestions(query: {
  search?: string;
  instrumentId?: string;
  limit?: number;
  /** Cargar preguntas concretas (las fuentes de un gráfico guardado). */
  ids?: string[];
}): Promise<BuilderCatalogQuestion[]> {
  const params = new URLSearchParams();
  if (query.ids?.length) params.set("ids", query.ids.join(","));
  if (query.search) params.set("search", query.search);
  if (query.instrumentId) params.set("instrumentId", query.instrumentId);
  params.set("limit", String(query.limit ?? 50));
  return apiClient.get<BuilderCatalogQuestion[]>(`${BASE}/questions?${params}`, NO_STORE);
}

export function getCompatMatrix(): Promise<ChartCompatMatrix> {
  return apiClient.get<ChartCompatMatrix>(`${BASE}/compat-matrix`, NO_STORE);
}

export function listEntityMetrics(): Promise<BuilderEntityMetric[]> {
  return apiClient.get<BuilderEntityMetric[]>(`${BASE}/entity-metrics`, NO_STORE);
}
