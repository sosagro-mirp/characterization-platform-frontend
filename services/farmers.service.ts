import { apiClient } from "@/lib/apiClient";
import { CreateFarmerPayload, FarmerSearchResult } from "@/app/(instrument)/types";

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
