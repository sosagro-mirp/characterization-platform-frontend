import { apiClient } from "@/lib/apiClient";
import type { SystemFieldDef } from "@/lib/system-fields/systemFieldOptions";

/** Spec 97 — catálogo de destinos (`GET /api/system-fields`); `all` incluye los en desuso. */
export function listSystemFields(all = false): Promise<SystemFieldDef[]> {
  return apiClient.get<SystemFieldDef[]>(
    `/api/system-fields${all ? "?all=true" : ""}`,
    { cache: "no-store" },
  );
}
