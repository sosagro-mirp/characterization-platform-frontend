import { AggregationOption } from "../types";

interface OptionBarsProps {
  options: AggregationOption[];
}

/** Ranking horizontal genérico (spec 43, D7) — barreras de adopción,
 * habilidades digitales, plataformas, canal preferido: mismo shape
 * (`AggregationOption[]`), sin envolver en un `DashboardQuestion` falso. */
export default function OptionBars({ options }: OptionBarsProps) {
  if (options.length === 0) {
    return <p className="text-sm text-text-muted">Sin datos suficientes.</p>;
  }

  // Spec 109: una celda suprimida llega con `percentage: null`; va al final
  // y se muestra como «—», nunca como cero.
  const pct = (option: AggregationOption): number | null =>
    (option.percentage as number | null) ?? null;
  const sorted = [...options].sort((a, b) => (pct(b) ?? -1) - (pct(a) ?? -1));

  return (
    <div className="flex flex-col gap-2">
      {sorted.map((option) => (
        <div key={option.optionId} className="flex items-center gap-2">
          <span className="w-28 shrink-0 truncate text-right text-xs text-text-primary">
            {option.text}
          </span>
          <div className="h-2.5 flex-1 rounded-full bg-surface-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-brand"
              style={{ width: `${pct(option) ?? 0}%` }}
            />
          </div>
          <span className="w-10 shrink-0 text-xs font-semibold text-text-muted">
            {pct(option) === null ? "—" : `${pct(option)!.toFixed(0)}%`}
          </span>
        </div>
      ))}
    </div>
  );
}
