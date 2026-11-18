/**
 * Spec 109 — tabla de `ChartKind` y su resolución desde el gráfico servido.
 *
 * El componente lo decide el `chartKind` que configuró el admin en el
 * constructor (spec 108), no el tipo de pregunta ni una curaduría en código.
 * Un `chartKind` que el frontend no conoce cae a `unsupported` sin lanzar.
 */

export const SERVED_CHART_KINDS = [
  "donut",
  "yes-percent-bars",
  "bars",
  "horizontal-bars",
  "map",
  "harvest-calendar",
  "diverging",
  "histogram",
  "histogram-by-unit",
  "histogram-normalized",
] as const;

export type ServedChartKind = (typeof SERVED_CHART_KINDS)[number];

/** Lo que dibuja la fábrica: un `ChartKind`, la matriz Likert de comparación o el marcador. */
export type RenderedChartKind = ServedChartKind | "diverging-matrix" | "unsupported";

const KNOWN = new Set<string>(SERVED_CHART_KINDS);

export function resolveServedChartKind(chart: {
  chartKind: string;
  combineMode?: "merge" | "compare" | string;
}): RenderedChartKind {
  if (!KNOWN.has(chart.chartKind)) return "unsupported";
  if (chart.chartKind === "diverging" && chart.combineMode === "compare") {
    return "diverging-matrix";
  }
  return chart.chartKind as ServedChartKind;
}

/** P23: columnas que ocupa un gráfico en la grilla (normal = 1, wide = 2). */
export function chartGridSpan(layout: "normal" | "wide" | string): 1 | 2 {
  return layout === "wide" ? 2 : 1;
}
