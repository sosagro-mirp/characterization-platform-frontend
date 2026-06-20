import { apiClient } from "@/lib/apiClient";
import { CreateFarmerPayload, FarmerSearchResult } from "@/app/(instrument)/types";
import { FarmerDetail, UpdateFarmerRequest } from "@/app/(admin)/types";

export function searchFarmers(query: string): Promise<FarmerSearchResult[]> {
  return apiClient.get<FarmerSearchResult[]>(
    `/api/farmers/search?q=${encodeURIComponent(query)}`,
    { cache: "no-store" },
  );
}

export function createFarmer(
  data: CreateFarmerPayload,
): Promise<FarmerSearchResult> {
  return apiClient.post<FarmerSearchResult>("/api/farmers", data);
}

export function getFarmer(id: string): Promise<FarmerDetail> {
  return apiClient.get<FarmerDetail>(`/api/farmers/${id}`);
}

export function updateFarmer(
  id: string,
  data: UpdateFarmerRequest,
): Promise<FarmerDetail> {
  return apiClient.patch<FarmerDetail>(`/api/farmers/${id}`, data);
}
