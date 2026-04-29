import { apiClient } from "@/lib/apiClient";
import {
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
