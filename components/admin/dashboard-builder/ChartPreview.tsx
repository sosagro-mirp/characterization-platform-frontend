"use client";

import type { BuilderPreviewResult } from "@/app/(admin)/types";
import type { ServedChart } from "@/app/(dashboard)/types";
import ServedChartFactory from "@/app/(dashboard)/components/ServedChartFactory";
import { HealthBadge } from "./ui";

export interface ChartPreviewMeta {
  title: string;
  subtitle?: string | null;
  sourceKind: "questions" | "entity_metric";
  questionType: string | null;
  chartKind: string;
  combineMode: "merge" | "compare";
  layout: "normal" | "wide";
  audience: "public" | "private";
}

/** Convierte la vista previa del constructor a la forma de un gráfico servido. */
export function previewAsServedChart(
  id: string,
  meta: ChartPreviewMeta,
  preview: BuilderPreviewResult,
): ServedChart {
  const series = preview.series;
  return {
    chartId: id,
    title: meta.title || "Sin título",
    subtitle: meta.subtitle ?? null,
    sourceKind: meta.sourceKind,
    questionType: meta.questionType,
    chartKind: meta.chartKind,
    combineMode: meta.combineMode,
    layout: meta.layout,
    audience: meta.audience,
    settings: {},
    suppressed: series.length === 0 || series.every((s) => s.suppressed),
    answeredCount: Math.max(0, ...series.map((s) => s.answeredCount)),
    instrumentNames: [],
    metricKey: preview.metricKey,
    ignoredFilters: preview.ignoredFilters,
    normalization: preview.normalization,
    series,
  };
}

interface ChartPreviewProps {
  id: string;
  meta: ChartPreviewMeta;
  preview: BuilderPreviewResult;
}

/** Tarjeta de vista previa con datos reales (misma supresión que el dashboard). */
export default function ChartPreview({ id, meta, preview }: ChartPreviewProps) {
  const chart = previewAsServedChart(id, meta, preview);
  return (
    <article className="flex flex-col gap-3 rounded-md border border-[var(--border)] bg-[var(--surface)] p-4">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-[var(--text-primary)]">{chart.title}</h3>
          {chart.subtitle && (
            <p className="text-sm text-[var(--text-muted)]">{chart.subtitle}</p>
          )}
        </div>
        <HealthBadge health={preview.health} />
      </header>
      <ServedChartFactory chart={chart} />
      <p className="text-xs text-[var(--text-muted)]">
        {chart.answeredCount} {meta.sourceKind === "entity_metric" ? "registros" : "encuestas con respuesta"}
      </p>
      {preview.excludedSources.length > 0 && (
        <div className="rounded-md bg-[var(--warning-bg)] px-3 py-2 text-xs text-[var(--warning-fg)]">
          <p className="font-medium">Fuentes que no se usan al servir:</p>
          <ul className="list-disc pl-4">
            {preview.excludedSources.map((s) => (
              <li key={s.questionId}>{s.reason}</li>
            ))}
          </ul>
        </div>
      )}
      {preview.normalization && preview.normalization.excludedCount > 0 && (
        <p className="text-xs text-[var(--text-muted)]">
          {preview.normalization.excludedCount} respuesta(s) sin factor para «
          {preview.normalization.targetUnit}» quedan fuera.
        </p>
      )}
    </article>
  );
}
