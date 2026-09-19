import type {
  InstrumentDraftAnswer,
  InstrumentQuestion,
} from "@/app/(instrument)/types";

/**
 * Spec 86 — el texto de la opción "Otros" viaja en la propia respuesta
 * (fila de la opción isOther, campo textValue). Mismo límite que la columna
 * text_value del backend para ese caso.
 */
export const OTHER_TEXT_MAX_LENGTH = 255;

export function findOtherOptionId(question: InstrumentQuestion): string | undefined {
  if (
    question.type.name !== "multiple_choice" &&
    question.type.name !== "single_choice"
  ) {
    return undefined;
  }
  return question.options.find((o) => o.isOther)?.optionId;
}

/** Indica si la opción "Otros" de la pregunta está elegida en la respuesta. */
export function isOtherOptionSelected(
  question: InstrumentQuestion,
  answer: InstrumentDraftAnswer,
): boolean {
  const otherOptionId = findOtherOptionId(question);
  if (!otherOptionId) return false;

  return question.type.name === "multiple_choice"
    ? (answer.optionIds ?? []).includes(otherOptionId)
    : answer.optionId === otherOptionId;
}

/**
 * Texto recortado de "Otros" que debe acompañar a la fila isOther, o
 * `undefined` si la opción no está elegida o el texto quedó vacío (un texto
 * residual de una selección anterior nunca se envía).
 */
export function getOtherTextValue(
  question: InstrumentQuestion,
  answer: InstrumentDraftAnswer,
): string | undefined {
  if (!isOtherOptionSelected(question, answer)) return undefined;
  const trimmed = answer.otherText?.trim();
  return trimmed ? trimmed : undefined;
}
