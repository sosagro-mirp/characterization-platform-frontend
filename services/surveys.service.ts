import { apiClient } from "@/lib/apiClient";
import {
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
