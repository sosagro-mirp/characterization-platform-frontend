/**
 * Spec 66 (Fase 3, D3): resuelve qué gráfica renderizar para una pregunta,
 * dando prioridad a la decisión curada en el backend
 * (`dashboard-question-curation.config.ts`, campo `chartHint` del DTO) sobre
 * la regla genérica por tipo de pregunta (`dashboard.md §3`).
 *
 * `QuestionChartFactory` consume `resolveChartKind` para decidir qué
 * componente renderizar; el mapeo `ChartKind` → componente vive ahí, no acá
 * — este módulo es lógica pura, sin JSX, para poder probarse con Vitest en
 * entorno `node` (ver `vitest.config.ts`).
 */

export const CHART_KINDS = [
  "donut",
  "bars",
  "horizontal-bars",
  "diverging",
  "histogram",
  "histogram-by-unit",
  "harvest-calendar",
  "map",
  "unsupported",
  "hidden",
] as const;

export type ChartKind = (typeof CHART_KINDS)[number];

/** Regla por defecto (`dashboard.md §3`): tipo de pregunta → gráfica, cuando
 * no hay `chartHint` curado. `multiple_choice` nunca cae a dona — la suma de
 * respuestas puede superar el 100 %. */
const DEFAULT_CHART_BY_TYPE: Record<string, ChartKind> = {
  yes_no: "donut",
  single_choice: "bars",
  multiple_choice: "horizontal-bars",
  compliance: "bars",
  likert: "diverging",
  numeric: "histogram",
  numeric_with_unit: "histogram-by-unit",
};

export interface ResolveChartKindInput {
  questionType: string;
  /** `chartHint` del DTO (spec 66, D3) — gana sobre el default del tipo. */
  chartHint?: ChartKind | string | null;
  /** true si la pregunta fue ocultada por curaduría editorial (spec 66, D4). */
  hidden?: boolean;
}

/** Resuelve qué gráfica corresponde a una pregunta. `hidden` gana sobre
 * cualquier `chartHint`; un `chartHint` válido gana sobre el default por
 * tipo; un `chartHint` desconocido (no está en `CHART_KINDS`) no rompe nada
 * — cae al comportamiento por tipo como si no se hubiera declarado. */
export function resolveChartKind(input: ResolveChartKindInput): ChartKind {
  if (input.hidden) return "hidden";

  if (
    input.chartHint &&
    (CHART_KINDS as readonly string[]).includes(input.chartHint)
  ) {
    return input.chartHint as ChartKind;
  }

  return DEFAULT_CHART_BY_TYPE[input.questionType] ?? "unsupported";
}

// ─── Spec 109 — resolución desde el gráfico servido ─────────────────────────

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
