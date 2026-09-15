import { apiClient } from "@/lib/apiClient";
import {
  CreateOptionRequest,
  OptionDetail,
  UpdateOptionRequest,
} from "@/app/(admin)/types";

export function createOption(
  questionId: string,
  text: string,
): Promise<{ optionId: string; text: string }> {
  return apiClient.post<{ optionId: string; text: string }>(
    `/api/questions/${questionId}/options`,
    { text },
  );
}

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

// Spec 84 — alternativa a borrar cuando la opción ya tiene respuestas
// (`deleteOption` devuelve 409 en ese caso).

export function archiveOption(
  questionId: string,
  optionId: string,
): Promise<OptionDetail> {
  return apiClient.patch<OptionDetail>(
    `/api/questions/${questionId}/options/${optionId}/archive`,
  );
}

export function unarchiveOption(
  questionId: string,
  optionId: string,
): Promise<OptionDetail> {
  return apiClient.patch<OptionDetail>(
    `/api/questions/${questionId}/options/${optionId}/unarchive`,
  );
}
