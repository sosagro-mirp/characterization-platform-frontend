import { apiClient } from "@/lib/apiClient";
import type {
  CreateResponsePayload,
  DuplicateCheckResult,
  ExtractCropsResult,
  ExtractFarmerResult,
} from "@/app/(instrument)/types";
import type {
  PublicSubmissionListItem,
  PublicSubmissionReviewStatus,
  SurveyListItem,
  SurveyResponsesResult,
} from "@/app/(admin)/types";

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
}): Promise<{ discardedSurveyId: string }> {
  return apiClient.post<{ discardedSurveyId: string }>(
    "/api/surveys/overwrite",
    payload,
  );
}

export function skipStep(payload: {
  sessionId: string;
  instrumentId: string;
  stepOrder: number;
}): Promise<{ surveyId: string }> {
  return apiClient.post<{ surveyId: string }>("/api/surveys/skip-step", payload);
}

export function submitBatchResponses(responses: CreateResponsePayload[]): Promise<void> {
  return apiClient.post<void>("/api/responses/batch", responses);
}

export function getSurveysByFarmer(farmerId: string): Promise<SurveyListItem[]> {
  return apiClient.get<SurveyListItem[]>(
    `/api/surveys?farmerId=${farmerId}`,
    { cache: "no-store" },
  );
}

export function getSurveyResponses(surveyId: string): Promise<SurveyResponsesResult> {
  return apiClient.get<SurveyResponsesResult>(
    `/api/surveys/${surveyId}/responses`,
    { cache: "no-store" },
  );
}

// ── Bandeja de revisión de envíos públicos (spec 79) ────────────────────────

export function getPublicSubmissions(filters?: {
  instrumentId?: string;
  reviewStatus?: PublicSubmissionReviewStatus;
}): Promise<PublicSubmissionListItem[]> {
  const params = new URLSearchParams();
  if (filters?.instrumentId) params.set("instrumentId", filters.instrumentId);
  if (filters?.reviewStatus) params.set("reviewStatus", filters.reviewStatus);
  const qs = params.toString();
  return apiClient.get<PublicSubmissionListItem[]>(
    `/api/surveys/public-submissions${qs ? `?${qs}` : ""}`,
    { cache: "no-store" },
  );
}

/**
 * Reutiliza extractFarmer del lado del backend (incluida la detección de
 * colisiones del spec 68): un 409 con { documentId, submittedName,
 * existingFarmer } significa que hace falta declarar `resolution` para
 * continuar.
 */
export function processPublicSubmission(
  surveyId: string,
  resolution?: "same_person" | "separate_person",
): Promise<ExtractFarmerResult> {
  return apiClient.post<ExtractFarmerResult>(
    `/api/surveys/${surveyId}/process-public`,
    resolution ? { resolution } : {},
  );
}

export function discardPublicSubmission(
  surveyId: string,
): Promise<{ surveyId: string; reviewStatus: string }> {
  return apiClient.post<{ surveyId: string; reviewStatus: string }>(
    `/api/surveys/${surveyId}/discard-public`,
    {},
  );
}
