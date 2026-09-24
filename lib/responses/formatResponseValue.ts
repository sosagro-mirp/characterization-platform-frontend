/** Campos mínimos de una respuesta necesarios para mostrarla como texto. */
export interface FormattableResponse {
  questionType: string;
  numericValue: number | null;
  optionText: string | null;
  textValue: string | null;
  booleanValue: boolean | null;
}

/** Número sin notación científica, sin separador de miles y sin ceros sobrantes. */
function formatNumber(value: number): string {
  return value.toLocaleString("fullwide", {
    useGrouping: false,
    maximumFractionDigits: 6,
  });
}

/** Texto legible de una respuesta (ficha del agricultor y bandeja de envíos). */
export function formatResponseValue(r: FormattableResponse): string {
  switch (r.questionType) {
    case "yes_no":
      if (r.booleanValue === true) return "Sí";
      if (r.booleanValue === false) return "No";
      return r.optionText ?? "—";
    case "numeric":
      return r.numericValue != null ? formatNumber(r.numericValue) : "—";
    case "numeric_with_unit":
      return r.numericValue != null && r.optionText
        ? `${formatNumber(r.numericValue)} ${r.optionText}`
        : r.numericValue != null
          ? formatNumber(r.numericValue)
          : (r.optionText ?? "—");
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
        (r.numericValue != null ? formatNumber(r.numericValue) : "—")
      );
  }
}
