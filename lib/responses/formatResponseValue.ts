/** Campos mínimos de una respuesta necesarios para mostrarla como texto. */
export interface FormattableResponse {
  questionType: string;
  numericValue: number | null;
  optionText: string | null;
  textValue: string | null;
  booleanValue: boolean | null;
  /** Spec 86 — la respuesta es a la opción "Otros"; su texto viene en `textValue`. */
  isOther?: boolean;
}

const NUMBER_FORMAT = new Intl.NumberFormat("en-US", {
  useGrouping: false,
  maximumFractionDigits: 20,
});

/**
 * Número determinista (no depende del idioma del navegador): sin notación
 * científica, sin separador de miles y sin ceros sobrantes.
 */
function formatNumber(value: number): string {
  return NUMBER_FORMAT.format(value);
}

/**
 * Texto legible de una respuesta (ficha del agricultor y bandeja de envíos).
 *
 * Spec 86 — una respuesta a la opción isOther se muestra como
 * "{opción}: {texto}" (ej. "Otros: Pozo profundo"), o solo con el nombre de la
 * opción si no trae texto.
 */
export function formatResponseValue(r: FormattableResponse): string {
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
