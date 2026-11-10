import { apiClient } from "@/lib/apiClient";
import type { ProductionUnitsResponse } from "@/lib/production-units/types";

// Spec 98 — solo ADMIN y RESEARCHER. Sin paginar: ~135 filas, se filtra en el cliente.
export function getProductionUnits(): Promise<ProductionUnitsResponse> {
  return apiClient.get<ProductionUnitsResponse>("/api/production-units", {
    cache: "no-store",
  });
}

// Spec 98 — exporta a Excel las fincas pedidas; el backend registra la exportación.
export function exportProductionUnits(
  farmIds: string[],
  filters: Record<string, unknown>,
): Promise<Blob> {
  return apiClient.post<Blob>(
    "/api/production-units/export",
    { farmIds, filters },
    { blob: true },
  );
}
