import { apiClient } from "@/lib/apiClient";
import {
  CreateOptionRequest,
  OptionDetail,
  UpdateOptionRequest,
} from "@/app/(admin)/types";

export function batchCreateOptions(
  questionId: string,
  options: CreateOptionRequest[],
): Promise<OptionDetail[]> {
  return apiClient.post<OptionDetail[]>(
    `/api/questions/${questionId}/options/batch`,
    options,
  );
}

export function updateOption(
  questionId: string,
  optionId: string,
  data: UpdateOptionRequest,
): Promise<OptionDetail> {
  return apiClient.patch<OptionDetail>(
    `/api/questions/${questionId}/options/${optionId}`,
    data,
  );
}

export function deleteOption(
  questionId: string,
  optionId: string,
): Promise<void> {
  return apiClient.delete<void>(
    `/api/questions/${questionId}/options/${optionId}`,
  );
}
