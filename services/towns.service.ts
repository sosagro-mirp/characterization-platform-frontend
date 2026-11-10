import { apiClient } from "@/lib/apiClient";

export interface TownSummary {
  townId: string;
  name: string;
  department?: { departmentId: string; name: string };
}

export function listTowns(departmentId?: string): Promise<TownSummary[]> {
  const url = departmentId
    ? `/api/towns?departmentId=${encodeURIComponent(departmentId)}`
    : "/api/towns";
  return apiClient.get<TownSummary[]>(url);
}

/**
 * Municipios vía la ruta pública (`GET /api/towns/public`, sin autenticación):
 * la ruta protegida es solo de administrador y el investigador también procesa
 * envíos (spec 93).
 */
export function listPublicTowns(departmentId?: string): Promise<TownSummary[]> {
  const url = departmentId
    ? `/api/towns/public?departmentId=${encodeURIComponent(departmentId)}`
    : "/api/towns/public";
  return apiClient.get<TownSummary[]>(url, { withAuth: false });
}
