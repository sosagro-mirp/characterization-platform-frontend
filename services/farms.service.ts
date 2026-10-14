import { apiClient } from "@/lib/apiClient";
import { FarmDetail, FarmSummaryForFarmer, UpdateFarmRequest } from "@/app/(admin)/types";

// Spec 94: incluye `farmers[]` (productores vinculados, con rol) y `farmCrops`.
export function getFarm(id: string): Promise<FarmDetail> {
  return apiClient.get<FarmDetail>(`/api/farms/${id}`);
}

export function updateFarm(
  id: string,
  data: UpdateFarmRequest,
): Promise<FarmSummaryForFarmer> {
  return apiClient.patch<FarmSummaryForFarmer>(`/api/farms/${id}`, data);
}
