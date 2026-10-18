import { apiClient } from "@/lib/apiClient";
import { CreateFarmerPayload, FarmerSearchResult } from "@/app/(instrument)/types";
import type { Discrepancy } from "@/lib/farmers/farmerFarms";
import {
  FarmerDetail,
  FarmerDeletionPreview,
  UpdateFarmerRequest,
} from "@/app/(admin)/types";

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

// Spec 73 — borrado en cascada de un agricultor. Solo ADMIN.
export function getFarmerDeletionPreview(
  id: string,
): Promise<FarmerDeletionPreview> {
  return apiClient.get<FarmerDeletionPreview>(
    `/api/farmers/${id}/deletion-preview`,
    { cache: "no-store" },
  );
}

export function deleteFarmerCascade(
  id: string,
): Promise<FarmerDeletionPreview> {
  return apiClient.delete<FarmerDeletionPreview>(`/api/farmers/${id}/cascade`);
}

// Spec 95 — discrepancias de extracción (solo ADMIN y RESEARCHER). En la web
// solo se listan; aplicar o descartar queda para el spec 96/H5.
export function getFarmerDiscrepancies(
  farmerId: string,
  status: Discrepancy["status"] = "open",
): Promise<Discrepancy[]> {
  return apiClient.get<Discrepancy[]>(
    `/api/farmers/${farmerId}/discrepancies?status=${status}`,
    { cache: "no-store" },
  );
}
