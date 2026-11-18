import { LIKERT_SCALE_COLORS } from "./palette";

export interface LikertBatteryItem {
  questionId: string;
  label: string;
  /** Conteos crudos o porcentajes, en los 5 niveles de la escala, en orden.
   * `null` en una posición (spec 66, D2) es una celda suprimida por privacidad
   * — nunca se inventa un valor. */
  distribution: (number | null)[];
  meanScore: number | null;
  /** Total real del ítem (respuestas, o 100 si `distribution` son porcentajes).
   * Con celdas suprimidas evita inflar los tramos visibles: cada tramo se mide
   * contra el total y lo oculto queda como un tramo «suprimido» (spec 109,
   * heredado de la auditoría 95 del 66). */
  total?: number;
}

export interface LikertDivergingSegment {
  percentage: number;
  color: string;
  /** Tramo de las celdas ocultas por privacidad: se dibuja aparte, sin valor. */
  suppressed?: boolean;
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
      // Spec 109 (auditoría 95 del 66): una celda suprimida ya no se pinta
      // como 0 ni infla los tramos visibles. Con `total`, cada tramo visible
      // se mide contra él y la parte oculta se agrupa en un tramo
      // «suprimido». Sin `total` se normaliza como antes.
      const hasHidden = item.distribution.some((value) => value === null);
      const visibleSum = item.distribution.reduce<number>(
        (sum, value) => sum + (value ?? 0),
        0,
      );
      const denominator = item.total ?? visibleSum;
      const segments: LikertDivergingSegment[] = item.distribution.map(
        (value, index) => ({
          percentage:
            denominator > 0 && value !== null ? (value / denominator) * 100 : 0,
          color: LIKERT_SCALE_COLORS[index % LIKERT_SCALE_COLORS.length],
        }),
      );
      if (hasHidden && item.total !== undefined && denominator > 0) {
        const hiddenPct = Math.max(0, 100 - (visibleSum / denominator) * 100);
        if (hiddenPct > 0) {
          segments.push({
            percentage: hiddenPct,
            color: "var(--border-strong)",
            suppressed: true,
          });
        }
      }
      return {
        questionId: item.questionId,
        label: item.label,
        meanScore: item.meanScore,
        segments,
      };
    })
    .sort((a, b) => b.meanScore - a.meanScore);
}
