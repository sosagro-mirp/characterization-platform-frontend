import { apiClient } from "@/lib/apiClient";
import { CropSummary } from "@/app/(instrument)/types";

export function listCrops(): Promise<CropSummary[]> {
  return apiClient.get<CropSummary[]>("/api/types-of-crops");
}
