import { apiClient } from "@/lib/apiClient";
import type {
  ChangeRequestListItem,
  CreateChangeRequestWebPayload,
} from "@/app/(admin)/types";

export function listRequests(
  status?: "open" | "resolved" | "all",
  source?: "mobile" | "web" | "all",
): Promise<ChangeRequestListItem[]> {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (source) params.set("source", source);
  const qs = params.toString();
  return apiClient.get<ChangeRequestListItem[]>(
    `/api/change-requests${qs ? `?${qs}` : ""}`,
    { cache: "no-store" },
  );
}

export function resolveRequest(changeRequestId: string): Promise<ChangeRequestListItem> {
  return apiClient.patch<ChangeRequestListItem>(
    `/api/change-requests/${changeRequestId}/resolve`,
  );
}

export function createRequest(
  payload: CreateChangeRequestWebPayload,
): Promise<ChangeRequestListItem> {
  return apiClient.post<ChangeRequestListItem>("/api/change-requests", payload);
}
