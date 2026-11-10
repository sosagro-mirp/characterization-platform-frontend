import { ApiError } from "@/lib/apiClient";

/**
 * Spec 84 — `DELETE /api/sections/:sectionId/questions/:questionId` responde
 * 409 en dos casos (`backend/src/questions/questions.service.ts#remove`):
 *
 * - la pregunta tiene respuestas → body `{ message, questionId, responseCount }`
 *   ("…Archívela en su lugar."). Aquí sí tiene sentido ofrecer archivar.
 * - otras preguntas no archivadas o pasos de campaña dependen de ella → body
 *   `{ message, questionId, dependentQuestions, stepConditions }`. Archivarla
 *   también daría 409, así que no se ofrece: basta con el mensaje del backend.
 */
export type DeleteQuestionConflict = "responses" | "dependents";

export function getDeleteQuestionConflict(
  err: unknown,
): DeleteQuestionConflict | null {
  if (!(err instanceof ApiError) || err.status !== 409) return null;
  const body = err.body as
    | { responseCount?: unknown; dependentQuestions?: unknown }
    | null
    | undefined;
  if (Array.isArray(body?.dependentQuestions)) return "dependents";
  // Un 409 sin `dependentQuestions` (incluido uno sin cuerpo) se trata como
  // "tiene respuestas", que es como el editor lo trataba antes de este cambio.
  return "responses";
}
