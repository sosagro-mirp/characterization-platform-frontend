import { apiClient } from "@/lib/apiClient";
import {
  CampaignDetail,
  CampaignStepDetail,
  CampaignSummary,
  CreateCampaignRequest,
  CreateCampaignStepRequest,
  CreateStepConditionRequest,
  StepConditionDetail,
  UpdateCampaignRequest,
  UpdateCampaignStepRequest,
  UpdateStepConditionRequest,
} from "@/app/(admin)/types";
import {
  CampaignActiveSummary,
  CampaignRender,
} from "@/app/(instrument)/types";

export function listCampaigns(): Promise<CampaignSummary[]> {
  return apiClient.get<CampaignSummary[]>("/api/campaigns", {
    cache: "no-store",
  });
}

export function getCampaign(campaignId: string): Promise<CampaignDetail> {
  return apiClient.get<CampaignDetail>(`/api/campaigns/${campaignId}`, {
    cache: "no-store",
  });
}

export function createCampaign(
  data: CreateCampaignRequest,
): Promise<CampaignSummary> {
  return apiClient.post<CampaignSummary>("/api/campaigns", data);
}

export function updateCampaign(
  campaignId: string,
  data: UpdateCampaignRequest,
): Promise<CampaignDetail> {
  return apiClient.patch<CampaignDetail>(
    `/api/campaigns/${campaignId}`,
    data,
  );
}

export function deleteCampaign(campaignId: string): Promise<void> {
  return apiClient.delete<void>(`/api/campaigns/${campaignId}`);
}

export function listSteps(campaignId: string): Promise<CampaignStepDetail[]> {
  return apiClient.get<CampaignStepDetail[]>(
    `/api/campaigns/${campaignId}/steps`,
    { cache: "no-store" },
  );
}

export function createStep(
  campaignId: string,
  data: CreateCampaignStepRequest,
): Promise<CampaignStepDetail> {
  return apiClient.post<CampaignStepDetail>(
    `/api/campaigns/${campaignId}/steps`,
    data,
  );
}

export function updateStep(
  campaignId: string,
  stepId: string,
  data: UpdateCampaignStepRequest,
): Promise<CampaignStepDetail> {
  return apiClient.patch<CampaignStepDetail>(
    `/api/campaigns/${campaignId}/steps/${stepId}`,
    data,
  );
}

export function deleteStep(campaignId: string, stepId: string): Promise<void> {
  return apiClient.delete<void>(
    `/api/campaigns/${campaignId}/steps/${stepId}`,
  );
}

export function listStepConditions(
  campaignId: string,
  stepId: string,
): Promise<StepConditionDetail[]> {
  return apiClient.get<StepConditionDetail[]>(
    `/api/campaigns/${campaignId}/steps/${stepId}/conditions`,
    { cache: "no-store" },
  );
}

export function createStepCondition(
  campaignId: string,
  stepId: string,
  data: CreateStepConditionRequest,
): Promise<StepConditionDetail> {
  return apiClient.post<StepConditionDetail>(
    `/api/campaigns/${campaignId}/steps/${stepId}/conditions`,
    data,
  );
}

export function updateStepCondition(
  campaignId: string,
  stepId: string,
  conditionId: string,
  data: UpdateStepConditionRequest,
): Promise<StepConditionDetail> {
  return apiClient.patch<StepConditionDetail>(
    `/api/campaigns/${campaignId}/steps/${stepId}/conditions/${conditionId}`,
    data,
  );
}

export function deleteStepCondition(
  campaignId: string,
  stepId: string,
  conditionId: string,
): Promise<void> {
  return apiClient.delete<void>(
    `/api/campaigns/${campaignId}/steps/${stepId}/conditions/${conditionId}`,
  );
}

export function listActiveCampaigns(): Promise<CampaignActiveSummary[]> {
  return apiClient.get<CampaignActiveSummary[]>("/api/campaigns/active", {
    cache: "no-store",
    withAuth: false,
  });
}

export function getCampaignRender(campaignId: string): Promise<CampaignRender> {
  return apiClient.get<CampaignRender>(
    `/api/campaigns/${campaignId}/render`,
    { cache: "no-store", withAuth: false },
  );
}
