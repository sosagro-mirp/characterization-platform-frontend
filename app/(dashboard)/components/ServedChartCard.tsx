import ServedChartFactory from "./ServedChartFactory";
import { ServedChart } from "../types";

interface ServedChartCardProps {
  chart: ServedChart;
}

const FILTER_LABELS: Record<string, string> = {
  gender: "género",
  ageRange: "edad",
  educationLevel: "nivel educativo",
  connectivity: "conectividad",
  profile: "perfil",
  tenure: "tenencia",
  chainStage: "etapa",
  actorTypeId: "tipo de actor",
  dateFrom: "fechas",
  dateTo: "fechas",
};

/**
 * Spec 109 — tarjeta de un gráfico servido: título y subtítulo configurados
 * en el constructor, el gráfico de su `chartKind`, su procedencia y, en una
 * métrica de entidad, qué filtros no le aplican.
 */
export default function ServedChartCard({ chart }: ServedChartCardProps) {
  const ignored = [
    ...new Set((chart.ignoredFilters ?? []).map((k) => FILTER_LABELS[k] ?? k)),
  ];
  return (
    <article className="rounded-lg border border-[var(--border)] bg-surface p-4 flex flex-col gap-3 h-full">
      <header>
        <h3 className="text-sm font-light uppercase tracking-wide text-text-primary">
          {chart.title}
        </h3>
        {chart.subtitle && (
          <p className="mt-1 text-xs text-text-muted">{chart.subtitle}</p>
        )}
      </header>

      {chart.suppressed && chart.combineMode === "merge" ? (
        <p className="text-sm text-warning-fg bg-warning-bg/40 rounded-md px-3 py-2">
          Muestra insuficiente para este gráfico (se requieren al menos 5
          respuestas).
        </p>
      ) : (
        <ServedChartFactory chart={chart} />
      )}

      {(chart.instrumentNames.length > 0 || ignored.length > 0) && (
        <footer className="mt-auto space-y-1 text-[11px] text-text-muted">
          {chart.instrumentNames.length > 0 && (
            <p>Fuente: {chart.instrumentNames.join(" · ")}</p>
          )}
          {ignored.length > 0 && (
            <p>No se filtra por {ignored.join(", ")}: es un conteo de productores o fincas.</p>
          )}
        </footer>
      )}
    </article>
  );
}
