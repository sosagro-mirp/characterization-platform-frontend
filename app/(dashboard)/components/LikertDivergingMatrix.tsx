import { buildDivergingRows, LikertBatteryItem } from "@/lib/dashboard/likert";
import { LIKERT_SCALE_COLORS } from "@/lib/dashboard/palette";

const LEGEND_LABELS = [
  "Totalmente en desacuerdo",
  "Desacuerdo",
  "Neutral",
  "De acuerdo",
  "Totalmente de acuerdo",
];

interface LikertDivergingMatrixProps {
  items: LikertBatteryItem[];
  /** Límite de filas a mostrar (el diseño muestra un ranking, no la batería completa). */
  limit?: number;
}

/**
 * Matriz Likert divergente (spec 43, hueco #1 del análisis de impacto):
 * una fila por ítem, barra 100% apilada de 5 tramos, media a la derecha.
 * A diferencia de `LikertChart` (una sola pregunta, barra centrada en cero),
 * esta consolida **varias** preguntas en un ranking — la usa
 * `OverviewView`/`DigitalDemandView`, no `QuestionCard`.
 */
export default function LikertDivergingMatrix({
  items,
  limit,
}: LikertDivergingMatrixProps) {
  const rows = buildDivergingRows(items);
  const visibleRows = limit ? rows.slice(0, limit) : rows;

  if (visibleRows.length === 0) {
    return (
      <p className="text-sm text-text-muted text-center py-6">
        Sin datos suficientes para esta batería.
      </p>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-3">
        {LEGEND_LABELS.map((label, index) => (
          <span
            key={label}
            className="flex items-center gap-1.5 text-[10px] text-text-muted"
          >
            <span
              className="h-2 w-2 rounded-sm shrink-0"
              style={{ backgroundColor: LIKERT_SCALE_COLORS[index] }}
            />
            {label}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-2.5">
        {visibleRows.map((row) => (
          <div key={row.questionId} className="flex items-center gap-3">
            <span className="w-52 shrink-0 truncate text-xs text-text-primary">
              {row.label}
            </span>
            <div className="flex h-4 flex-1 overflow-hidden rounded-sm">
              {row.segments.map((segment, index) => (
                <div
                  key={index}
                  style={{
                    width: `${segment.percentage}%`,
                    backgroundColor: segment.color,
                  }}
                />
              ))}
            </div>
            <span className="w-8 shrink-0 text-right text-xs font-bold text-brand">
              {row.meanScore.toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
