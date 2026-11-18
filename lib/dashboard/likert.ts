import { LIKERT_SCALE_COLORS } from "./palette";

export interface LikertBatteryItem {
  questionId: string;
  label: string;
  /** Conteos crudos o porcentajes, en los 5 niveles de la escala, en orden.
   * `null` en una posición (spec 66, D2) es una celda suprimida por privacidad
   * — se trata como 0 al sumar el total, nunca se inventa un valor. */
  distribution: (number | null)[];
  meanScore: number | null;
}

export interface LikertDivergingSegment {
  percentage: number;
  color: string;
}

export interface LikertDivergingRow {
  questionId: string;
  label: string;
  meanScore: number;
  segments: LikertDivergingSegment[];
}

/**
 * Spec 43 (hueco #1 del análisis de impacto): matriz Likert divergente — una
 * fila por ítem, con las 5 bandas de la escala normalizadas a 100 % (acepta
 * tanto conteos crudos como porcentajes ya calculados) y coloreadas con
 * `LIKERT_SCALE_COLORS`. Ordena por media descendente; excluye ítems sin
 * media (suprimidos) en vez de mandarlos al final con un valor falso.
 */
export function buildDivergingRows(
  items: LikertBatteryItem[],
): LikertDivergingRow[] {
  return items
    .filter((item): item is LikertBatteryItem & { meanScore: number } =>
      item.meanScore !== null,
    )
    .map((item) => {
      // DEBT (spec 66, D2): una celda `null` (suprimida por privacidad) se
      // trata como 0 al sumar — evita NaN sin inventar un valor real, pero
      // el segmento queda visualmente indistinguible de "cero respuestas
      // reales". El tratamiento visual explícito (igual al de los charts de
      // `lib/dashboard/suppressedOption.ts`) queda para la fase de spec 66
      // que cure esta matriz (Overview/C15), no se resuelve acá.
      const total = item.distribution.reduce<number>(
        (sum, value) => sum + (value ?? 0),
        0,
      );
      const segments: LikertDivergingSegment[] = item.distribution.map(
        (value, index) => ({
          percentage: total > 0 && value !== null ? (value / total) * 100 : 0,
          color: LIKERT_SCALE_COLORS[index % LIKERT_SCALE_COLORS.length],
        }),
      );
      return {
        questionId: item.questionId,
        label: item.label,
        meanScore: item.meanScore,
        segments,
      };
    })
    .sort((a, b) => b.meanScore - a.meanScore);
}
