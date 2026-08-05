import { DashboardKpi } from "../types";

interface KpiCardProps {
  kpi: DashboardKpi;
  /** El diseño destaca el primer KPI de cada tira con verde institucional
   * fijo (independiente del tema) — "Regla de oro" de DESIGN.md: un badge/
   * KPI destacado es un bloque autocontenido, no navegación real, así que
   * no sigue la superficie reactiva del sidebar (`dark:bg-surface`). */
  featured?: boolean;
}

function formatValue(kpi: DashboardKpi): string {
  if (kpi.optionText) return kpi.optionText;
  if (kpi.value === null) return "—";
  const rounded = Number.isInteger(kpi.value)
    ? kpi.value.toString()
    : kpi.value.toFixed(1);
  return kpi.unit === "%" ? `${rounded}%` : rounded;
}

export default function KpiCard({ kpi, featured = false }: KpiCardProps) {
  return (
    <div
      className={`rounded-lg border p-3.5 ${
        featured
          ? "border-brand-dark bg-brand-dark text-white"
          : "border-[var(--border)] bg-surface"
      }`}
    >
      <p
        className={`text-[9px] font-semibold uppercase tracking-wide ${
          featured ? "text-brand-light/80" : "text-text-muted"
        }`}
      >
        {kpi.label}
      </p>

      {kpi.suppressed ? (
        <p
          className={`mt-1.5 text-sm font-medium ${
            featured ? "text-brand-light/80" : "text-text-muted"
          }`}
        >
          Sin datos
        </p>
      ) : (
        <p className="mt-1.5 text-2xl font-extrabold">
          {formatValue(kpi)}
          {kpi.unit && kpi.unit !== "%" && !kpi.optionText && (
            <span
              className={`ml-0.5 text-xs font-semibold ${
                featured ? "text-brand-light/70" : "text-text-muted"
              }`}
            >
              {kpi.unit}
            </span>
          )}
        </p>
      )}
    </div>
  );
}
