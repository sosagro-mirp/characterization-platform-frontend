import { apiClient } from "@/lib/apiClient";
import {
  DuplicateCheckResult,
  ExtractCropsResult,
  ExtractFarmerResult,
} from "@/app/(instrument)/types";

export interface CreateSurveyPayload {
  instrumentIds: string[];
  campaignSessionId?: string;
  stepOrder?: number;
}

export interface CreateSurveyResult {
  surveyId: string;
}

export function createSurvey(
  payload: CreateSurveyPayload,
): Promise<CreateSurveyResult> {
  return apiClient.post<CreateSurveyResult>("/api/surveys", payload);
}

export function extractFarmer(surveyId: string): Promise<ExtractFarmerResult> {
  return apiClient.post<ExtractFarmerResult>(
    `/api/surveys/${surveyId}/extract-farmer`,
    {},
  );
}

export function extractCrops(surveyId: string): Promise<ExtractCropsResult> {
  return apiClient.post<ExtractCropsResult>(
    `/api/surveys/${surveyId}/extract-crops`,
    {},
  );
}

export function checkDuplicate(
  farmerId: string,
  instrumentId: string,
  campaignId: string,
): Promise<DuplicateCheckResult> {
  const params = new URLSearchParams({ farmerId, instrumentId, campaignId });
  return apiClient.get<DuplicateCheckResult>(
    `/api/surveys/check-duplicate?${params.toString()}`,
    { cache: "no-store" },
  );
}

export function overwriteSurvey(payload: {
  surveyId: string;
  sessionId: string;
  instrumentId: string;
  stepOrder: number;
}): Promise<{ surveyId: string }> {
  return apiClient.post<{ surveyId: string }>("/api/surveys/overwrite", payload);
}

export function skipStep(payload: {
  sessionId: string;
  instrumentId: string;
  stepOrder: number;
}): Promise<{ surveyId: string }> {
  return apiClient.post<{ surveyId: string }>("/api/surveys/skip-step", payload);
}
