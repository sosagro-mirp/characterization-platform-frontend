import type { AggregationBin } from "@/app/(dashboard)/types";
import { SUPPRESSED_BAR_PLACEHOLDER } from "./suppressedOption";

export interface HistogramBar {
  label: string;
  /** `null` si el intervalo está suprimido por privacidad. */
  count: number | null;
  /** Porcentaje del intervalo (0–100); el placeholder si está suprimido. */
  percentage: number;
  suppressed: boolean;
}

function formatEdge(value: number): string {
  return Number.isInteger(value)
    ? String(value)
    : String(Number(value.toFixed(4)));
}

function binLabel(bin: AggregationBin): string {
  if (bin.from === null && bin.to !== null)
    return `Menos de ${formatEdge(bin.to)}`;
  if (bin.to === null && bin.from !== null)
    return `${formatEdge(bin.from)} o más`;
  if (bin.from !== null && bin.to !== null) {
    return `${formatEdge(bin.from)}–${formatEdge(bin.to)}`;
  }
  return "Todos los valores";
}

/** Adapta los intervalos del backend (spec 107): el cliente ya no calcula
 * intervalos ni recibe valores crudos. Un intervalo suprimido usa el mismo
 * placeholder que `toBarDatum` — nunca 0, nunca omitido. */
export function binsToHistogram(bins: AggregationBin[]): HistogramBar[] {
  return bins.map((bin) => ({
    label: binLabel(bin),
    count: bin.suppressed ? null : bin.count,
    percentage: bin.suppressed
      ? SUPPRESSED_BAR_PLACEHOLDER
      : (bin.percentage ?? 0),
    suppressed: bin.suppressed,
  }));
}

/** Alternativa textual del histograma para lectores de pantalla (guía
 * `accessibility`: «Provide semantic data tables as accessible alternatives
 * for charts»): un intervalo por frase, con su conteo o «oculto». */
export function describeHistogram(bars: HistogramBar[]): string {
  return bars
    .map((bar) =>
      bar.suppressed
        ? `${bar.label}: oculto por privacidad`
        : `${bar.label}: ${bar.count} encuestas (${bar.percentage.toFixed(0)}%)`,
    )
    .join("; ");
}
