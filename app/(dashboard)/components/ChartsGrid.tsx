import { chartGridSpan } from "@/lib/dashboard/chartHint";
import ServedChartCard from "./ServedChartCard";
import { ServedChart } from "../types";

interface ChartsGridProps {
  charts: ServedChart[];
  emptyMessage?: string;
  /** Tarjeta fija que va primero en la grilla (p. ej. un bloque de `/overview`). */
  leading?: React.ReactNode;
}

/**
 * Spec 109 (P23) — grilla de gráficos servidos en el orden configurado:
 * `normal` ocupa una columna y `wide` las dos.
 */
export default function ChartsGrid({ charts, emptyMessage, leading }: ChartsGridProps) {
  if (charts.length === 0 && !leading) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-surface-muted px-4 py-6 text-center text-text-muted">
        {emptyMessage ?? "Esta categoría todavía no tiene gráficos publicados."}
      </div>
    );
  }
  return (
    <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {leading && <li>{leading}</li>}
      {charts.map((chart) => (
        <li
          key={chart.chartId}
          className={chartGridSpan(chart.layout) === 2 ? "lg:col-span-2" : undefined}
        >
          <ServedChartCard chart={chart} />
        </li>
      ))}
    </ul>
  );
}
