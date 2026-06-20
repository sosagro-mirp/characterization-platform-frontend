import { apiClient } from "@/lib/apiClient";
import { FarmSummaryForFarmer, UpdateFarmRequest } from "@/app/(admin)/types";

export function getFarm(id: string): Promise<FarmSummaryForFarmer> {
  return apiClient.get<FarmSummaryForFarmer>(`/api/farms/${id}`);
}

export function updateFarm(
  id: string,
  data: UpdateFarmRequest,
): Promise<FarmSummaryForFarmer> {
  return apiClient.patch<FarmSummaryForFarmer>(`/api/farms/${id}`, data);
}
