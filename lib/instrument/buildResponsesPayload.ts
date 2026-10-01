import type {
  CreateResponsePayload,
  InstrumentDraftAnswer,
  InstrumentQuestion,
} from "@/app/(instrument)/types";
import { isQuestionVisible } from "@/lib/isQuestionVisible";
import { findOtherOptionId, getOtherTextValue } from "@/lib/instrument/otherOption";

export interface FlattenedQuestionItem {
  sectionId: string;
  sectionName: string;
  sectionOrder: number;
  question: InstrumentQuestion;
}

/**
 * Arma las filas de respuesta de una encuesta autenticada (POST de lote).
 * Extraída de useInstrumentSurveyStore para poder probarla sin el store.
 *
 * Spec 86 — la fila de la opción isOther lleva el texto de "Otros" en
 * `textValue` (selección múltiple y única). `otherText` nunca se envía.
 */
export function buildResponsesPayload(
  surveyId: string,
  flattenedQuestions: FlattenedQuestionItem[],
  answers: Record<string, InstrumentDraftAnswer>,
): CreateResponsePayload[] {
  const payload: CreateResponsePayload[] = [];

  flattenedQuestions
    .filter(({ question }) => isQuestionVisible(question, answers))
    .forEach(({ question }) => {
      const answer = answers[question.questionId];

      if (!answer) {
        return;
      }

      const otherTextValue = getOtherTextValue(question, answer);

      if (question.type.name === "multiple_choice") {
        const selectedOptionIds = answer.optionIds ?? [];
        const otherOptionId = findOtherOptionId(question);

        selectedOptionIds.forEach((optionId) => {
          payload.push({
            surveyId,
            questionId: question.questionId,
            optionId,
            ...(optionId === otherOptionId && otherTextValue
              ? { textValue: otherTextValue }
              : {}),
          });
        });

        return;
      }

      const trimmedText = otherTextValue ?? answer.textValue?.trim();
      const item = {
        surveyId,
        questionId: answer.questionId,
        ...(answer.optionId !== undefined && { optionId: answer.optionId }),
        ...(trimmedText ? { textValue: trimmedText } : {}),
        ...(answer.numericValue !== undefined && { numericValue: answer.numericValue }),
        ...(answer.booleanValue !== undefined && { booleanValue: answer.booleanValue }),
      };

      const hasValue =
        "optionId" in item ||
        "textValue" in item ||
        "numericValue" in item ||
        "booleanValue" in item;

      if (hasValue) payload.push(item);
    });

  return payload;
}
