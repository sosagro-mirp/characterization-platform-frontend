import { chartGridSpan } from "@/lib/dashboard/chartHint";
import ServedChartCard from "./ServedChartCard";
import { ServedChart } from "../types";

interface ChartsGridProps {
  charts: ServedChart[];
  emptyMessage?: string;
  /** Tarjetas fijas de la grilla (p. ej. bloques de `/overview`), una por celda. */
  leading?: React.ReactNode[];
  /**
   * Spec 111 (A6): cuántos gráficos servidos van antes de las tarjetas fijas.
   * Por defecto 0 (las fijas van primero).
   */
  leadingAfter?: number;
}

/**
 * Spec 109 (P23) — grilla de gráficos servidos en el orden configurado:
 * `normal` ocupa una columna y `wide` las dos.
 */
export default function ChartsGrid({
  charts,
  emptyMessage,
  leading = [],
  leadingAfter = 0,
}: ChartsGridProps) {
  if (charts.length === 0 && leading.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-surface-muted px-4 py-6 text-center text-text-muted">
        {emptyMessage ?? "Esta categoría todavía no tiene gráficos publicados."}
      </div>
    );
  }
  const renderChart = (chart: ServedChart) => (
    <li
      key={chart.chartId}
      className={chartGridSpan(chart.layout) === 2 ? "lg:col-span-2" : undefined}
    >
      <ServedChartCard chart={chart} />
    </li>
  );
  return (
    <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {charts.slice(0, leadingAfter).map(renderChart)}
      {leading.map((card, i) => (
        <li key={`leading-${i}`}>{card}</li>
      ))}
      {charts.slice(leadingAfter).map(renderChart)}
    </ul>
  );
}
