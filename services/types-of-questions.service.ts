import { apiClient } from "@/lib/apiClient";
import { TypeOfQuestionSummary } from "@/app/(admin)/types";

export function getTypesOfQuestions(): Promise<TypeOfQuestionSummary[]> {
  return apiClient.get<TypeOfQuestionSummary[]>("/api/types-of-questions", {
    cache: "no-store",
  });
}
