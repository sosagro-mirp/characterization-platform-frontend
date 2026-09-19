import type { SurveyResponseItem } from "@/app/(admin)/types";

/**
 * Texto con el que el admin muestra el valor de una respuesta. Compartido por
 * el detalle de encuestas del agricultor (ResponsesAccordion) y la bandeja de
 * envíos públicos.
 *
 * Spec 86 — una respuesta a la opción isOther se muestra como
 * "{opción}: {texto}" (ej. "Otros: Pozo profundo"), o solo con el nombre de la
 * opción si no trae texto.
 */
export function formatResponseValue(r: SurveyResponseItem): string {
  if (r.isOther) {
    const label = r.optionText ?? "Otros";
    const otherText = r.textValue?.trim();
    return otherText ? `${label}: ${otherText}` : label;
  }

  switch (r.questionType) {
    case "yes_no":
      if (r.booleanValue === true) return "Sí";
      if (r.booleanValue === false) return "No";
      return r.optionText ?? "—";
    case "numeric":
      return r.numericValue != null ? String(r.numericValue) : "—";
    case "numeric_with_unit":
      return r.numericValue != null && r.optionText
        ? `${r.numericValue} ${r.optionText}`
        : r.numericValue != null
          ? String(r.numericValue)
          : "—";
    case "open_text":
      return r.textValue ?? "—";
    case "single_choice":
    case "likert":
    case "compliance":
    case "multiple_choice":
      return r.optionText ?? r.textValue ?? "—";
    default:
      return (
        r.textValue ??
        r.optionText ??
        (r.numericValue != null ? String(r.numericValue) : "—")
      );
  }
}
