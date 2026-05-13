import { apiClient } from "@/lib/apiClient";
import {
  CampaignSessionResponse,
  CreateCampaignSessionPayload,
  NextStepResponse,
} from "@/app/(instrument)/types";

export function createSession(
  data: CreateCampaignSessionPayload,
): Promise<CampaignSessionResponse> {
  return apiClient.post<CampaignSessionResponse>(
    "/api/campaign-sessions",
    data,
  );
}

export function getSession(
  sessionId: string,
): Promise<CampaignSessionResponse> {
  return apiClient.get<CampaignSessionResponse>(
    `/api/campaign-sessions/${sessionId}`,
    { cache: "no-store" },
  );
}

export function getNextStep(sessionId: string): Promise<NextStepResponse> {
  return apiClient.get<NextStepResponse>(
    `/api/campaign-sessions/${sessionId}/next-step`,
    { cache: "no-store" },
  );
}

export function syncSession(
  sessionId: string,
): Promise<CampaignSessionResponse> {
  return apiClient.patch<CampaignSessionResponse>(
    `/api/campaign-sessions/${sessionId}/sync`,
    {},
  );
}
