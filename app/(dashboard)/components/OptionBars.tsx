import { AggregationOption } from "../types";

interface OptionBarsProps {
  options: AggregationOption[];
}

/** D2 (spec 66): altura mínima de barra para una opción suprimida — nunca 0,
 * nunca ausente del ranking (criterio de aceptación 3). */
const SUPPRESSED_BAR_PLACEHOLDER = 2;

/** Ranking horizontal genérico (spec 43, D7) — barreras de adopción,
 * habilidades digitales, plataformas, canal preferido: mismo shape
 * (`AggregationOption[]`), sin envolver en un `DashboardQuestion` falso. */
export default function OptionBars({ options }: OptionBarsProps) {
  if (options.length === 0) {
    return <p className="text-sm text-text-muted">Sin datos suficientes.</p>;
  }

  // D2 (spec 66): orden sobre el conteo real (una celda suprimida sigue
  // existiendo, solo deja de mostrar su valor) antes de aplicar el
  // placeholder de la barra.
  const sorted = [...options].sort((a, b) => (b.count ?? 0) - (a.count ?? 0));

  return (
    <div className="flex flex-col gap-2">
      {sorted.map((option) => {
        const displayPercentage = option.suppressed
          ? SUPPRESSED_BAR_PLACEHOLDER
          : (option.percentage ?? 0);
        return (
          <div key={option.optionId} className="flex items-center gap-2">
            <span className="w-28 shrink-0 truncate text-right text-xs text-text-primary">
              {option.text}
            </span>
            <div className="h-2.5 flex-1 rounded-full bg-surface-muted overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${displayPercentage}%`,
                  backgroundColor: option.suppressed
                    ? "var(--warning-fg)"
                    : "var(--color-brand)",
                  opacity: option.suppressed ? 0.5 : 1,
                }}
                title={
                  option.suppressed
                    ? "Oculto por privacidad (menos de 5 respuestas)"
                    : undefined
                }
              />
            </div>
            <span className="w-10 shrink-0 text-xs font-semibold text-text-muted">
              {option.suppressed ? "—" : `${displayPercentage.toFixed(0)}%`}
            </span>
          </div>
        );
      })}
    </div>
  );
}
