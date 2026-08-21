import { LIKERT_SCALE_COLORS } from "./palette";

export interface LikertBatteryItem {
  questionId: string;
  label: string;
  /** Conteos crudos o porcentajes, en los 5 niveles de la escala, en orden. */
  distribution: number[];
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
      const total = item.distribution.reduce((sum, value) => sum + value, 0);
      const segments: LikertDivergingSegment[] = item.distribution.map(
        (value, index) => ({
          percentage: total > 0 ? (value / total) * 100 : 0,
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
