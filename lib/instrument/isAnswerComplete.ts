import type {
  InstrumentDraftAnswer,
  InstrumentQuestion,
} from "@/app/(instrument)/types";
import {
  isOtherOptionSelected,
  OTHER_TEXT_MAX_LENGTH,
} from "@/lib/instrument/otherOption";

/**
 * Spec 86 — con "Otros" elegido (selección múltiple o única) el texto es
 * obligatorio y no puede superar OTHER_TEXT_MAX_LENGTH caracteres.
 */
function isOtherTextValid(
  question: InstrumentQuestion,
  answer: InstrumentDraftAnswer,
): boolean {
  if (!isOtherOptionSelected(question, answer)) return true;
  const trimmed = answer.otherText?.trim() ?? "";
  return trimmed.length > 0 && trimmed.length <= OTHER_TEXT_MAX_LENGTH;
}

/**
 * Indica si la respuesta permite avanzar a la siguiente pregunta. Extraída
 * de InstrumentQuestionFlow para poder probarla sin renderizar. Las
 * preguntas no obligatorias siempre se consideran completas.
 */
export function isAnswerComplete(
  question: InstrumentQuestion,
  answer?: InstrumentDraftAnswer,
): boolean {
  if (!question.isRequired) {
    return true;
  }

  if (!answer) {
    return false;
  }

  switch (question.type.name) {
    case "open_text":
      return Boolean(answer.textValue?.trim());
    case "numeric":
      return answer.numericValue !== undefined;
    case "numeric_with_unit":
      return answer.numericValue !== undefined && Boolean(answer.optionId);
    case "yes_no":
      return answer.booleanValue !== undefined;
    case "multiple_choice": {
      const selectedIds = answer.optionIds ?? [];
      if (selectedIds.length === 0) return false;
      return isOtherTextValid(question, answer);
    }
    case "single_choice":
      return Boolean(answer.optionId) && isOtherTextValid(question, answer);
    case "likert":
      return Boolean(answer.optionId);
    default:
      return Boolean(
        answer.optionId ||
          answer.textValue ||
          answer.numericValue !== undefined ||
          answer.booleanValue !== undefined,
      );
  }
}
