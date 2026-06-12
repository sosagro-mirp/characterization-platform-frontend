import { apiClient } from "@/lib/apiClient";

export interface TownSummary {
  townId: string;
  name: string;
}

export function listTowns(departmentId?: string): Promise<TownSummary[]> {
  const url = departmentId
    ? `/api/towns?departmentId=${encodeURIComponent(departmentId)}`
    : "/api/towns";
  return apiClient.get<TownSummary[]>(url);
}
