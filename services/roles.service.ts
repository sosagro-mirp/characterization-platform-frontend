import { apiClient } from "@/lib/apiClient";
import { RoleSummary } from "@/app/(admin)/types";

export function listRoles(): Promise<RoleSummary[]> {
  return apiClient.get<RoleSummary[]>("/api/roles", { cache: "no-store" });
}
