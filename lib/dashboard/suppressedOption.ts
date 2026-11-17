/**
 * Spec 66 (Fase 2, D2): tratamiento compartido de una celda suprimida por
 * privacidad (`AggregationOption.suppressed`) en las gráficas de barras que
 * consumen `aggregation.options` (`SingleChoiceChart`, `MultipleChoiceChart`,
 * `ComplianceChart`, `FocalizationChart`). Una celda con menos de
 * `MIN_CELL_SIZE` respondientes nunca se muestra como `0` ni se omite del
 * listado en silencio (criterio de aceptación 3) — se representa con una
 * barra mínima y un tooltip explícito.
 *
 * Este es el tratamiento de **transición**: mantiene los charts existentes
 * correctos y no engañosos mientras cada categoría se cura fase a fase
 * (spec 66, Fases 3–17). El estilo final por tipo de gráfica lo define el
 * usuario categoría a categoría (ver bitácora de ajustes de estilo del spec).
 */
import { AggregationOption, DashboardQuestion } from "@/app/(dashboard)/types";

export const SUPPRESSED_TOOLTIP_LABEL =
  "Oculto por privacidad (menos de 5 respuestas)";

/** Altura mínima de barra para que la celda suprimida sea visible en el
 * listado sin insinuar un valor real — nunca 0, nunca ausente. */
export const SUPPRESSED_BAR_PLACEHOLDER = 2;

export interface BarDatum {
  name: string;
  percentage: number;
  count: number | null;
  suppressed: boolean;
}

/** Mapea una `AggregationOption` a los datos que consume un `<Bar>` de
 * Recharts, sustituyendo el valor suprimido por el placeholder mínimo. */
export function toBarDatum(option: AggregationOption): BarDatum {
  return {
    name: option.text,
    percentage: option.suppressed
      ? SUPPRESSED_BAR_PLACEHOLDER
      : (option.percentage ?? 0),
    count: option.count,
    suppressed: option.suppressed,
  };
}

/** Texto del tooltip: el mensaje de supresión reemplaza por completo el
 * porcentaje/conteo — nunca se muestra el placeholder como si fuera real. */
export function formatBarTooltip(datum: BarDatum): string {
  if (datum.suppressed) return SUPPRESSED_TOOLTIP_LABEL;
  return `${datum.percentage.toFixed(1)}% (${datum.count})`;
}

/** Mapea una pregunta `yes_no` a un `BarDatum` ("% Sí") con una etiqueta de
 * categoría explícita — usado para combinar varias preguntas `yes_no`
 * relacionadas en una sola `HorizontalBarChart` (ej. "¿Cultiva
 * actualmente X?" × 4 cultivos → una barra por cultivo). La supresión es a
 * nivel de pregunta completa (`question.suppressed`), no de opción. */
export function yesNoToBarDatum(question: DashboardQuestion, label: string): BarDatum {
  if (question.suppressed || question.aggregation?.type !== "yes_no") {
    return { name: label, percentage: SUPPRESSED_BAR_PLACEHOLDER, count: null, suppressed: true };
  }
  return {
    name: label,
    percentage: question.aggregation.yesPercentage,
    count: question.aggregation.yesCount,
    suppressed: false,
  };
}
