import { apiClient } from "@/lib/apiClient";
import type { ProductionUnitsResponse } from "@/lib/production-units/types";

// Spec 98 — solo ADMIN y RESEARCHER. Sin paginar: ~135 filas, se filtra en el cliente.
export function getProductionUnits(): Promise<ProductionUnitsResponse> {
  return apiClient.get<ProductionUnitsResponse>("/api/production-units", {
    cache: "no-store",
  });
}
