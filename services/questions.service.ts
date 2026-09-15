import { apiClient } from "@/lib/apiClient";
import {
  CopyQuestionResponse,
  CreateQuestionRequest,
  QuestionDetail,
  UpdateQuestionRequest,
} from "@/app/(admin)/types";

export function getQuestion(
  sectionId: string,
  questionId: string,
): Promise<QuestionDetail> {
  return apiClient.get<QuestionDetail>(
    `/api/sections/${sectionId}/questions/${questionId}`,
    { cache: "no-store" },
  );
}

export function createQuestion(
  sectionId: string,
  data: CreateQuestionRequest,
): Promise<QuestionDetail> {
  return apiClient.post<QuestionDetail>(
    `/api/sections/${sectionId}/questions`,
    data,
  );
}

export function updateQuestion(
  sectionId: string,
  questionId: string,
  data: UpdateQuestionRequest,
): Promise<QuestionDetail> {
  return apiClient.patch<QuestionDetail>(
    `/api/sections/${sectionId}/questions/${questionId}`,
    data,
  );
}

export function deleteQuestion(
  sectionId: string,
  questionId: string,
): Promise<void> {
  return apiClient.delete<void>(
    `/api/sections/${sectionId}/questions/${questionId}`,
  );
}

export function copyQuestionToSection(
  targetSectionId: string,
  sourceQuestionId: string,
): Promise<CopyQuestionResponse> {
  return apiClient.post<CopyQuestionResponse>(
    `/api/sections/${targetSectionId}/questions/copy`,
    { sourceQuestionId },
  );
}

// Spec 84 — "editar en sitio + archivar": una pregunta con respuestas nunca
// se borra. `deleteQuestion` puede devolver 409 (ver `ApiError.status` en el
// catch del llamador); estas dos son la alternativa.

export function archiveQuestion(
  sectionId: string,
  questionId: string,
): Promise<QuestionDetail> {
  return apiClient.patch<QuestionDetail>(
    `/api/sections/${sectionId}/questions/${questionId}/archive`,
  );
}

export function unarchiveQuestion(
  sectionId: string,
  questionId: string,
): Promise<QuestionDetail> {
  return apiClient.patch<QuestionDetail>(
    `/api/sections/${sectionId}/questions/${questionId}/unarchive`,
  );
}

/** Spec 84 — mueve la pregunta a otra sección del mismo instrumento. */
export function moveQuestionToSection(
  sourceSectionId: string,
  questionId: string,
  targetSectionId: string,
): Promise<QuestionDetail> {
  return apiClient.patch<QuestionDetail>(
    `/api/sections/${sourceSectionId}/questions/${questionId}`,
    { targetSectionId },
  );
}
