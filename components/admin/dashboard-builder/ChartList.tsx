"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { BuilderChart } from "@/app/(admin)/types";
import { chartKindLabel, moveChart } from "@/lib/dashboard/chartCompat";
import {
  builderChartAction,
  reorderBuilderCharts,
  type BuilderChartAction,
} from "@/services/dashboard-builder.service";
import {
  AudienceBadge,
  ConfirmModal,
  HealthBadge,
  StatusBadge,
  errorMessage,
  ghostButton,
} from "./ui";

interface ChartListProps {
  categoryId: string;
  charts: BuilderChart[];
  archived: boolean;
  onChanged: () => void;
}

const ACTION_LABELS: Record<BuilderChartAction, string> = {
  publish: "Publicar",
  unpublish: "Despublicar",
  archive: "Archivar",
  restore: "Restaurar",
  duplicate: "Duplicar",
};

/**
 * Gráficos de una categoría en su orden. Reordenar es con botones «subir» y
 * «bajar» (sin arrastre): la lista se reordena en sitio y un único
 * `role="status"` anuncia el resultado; el foco queda en el botón usado.
 */
export default function ChartList({ categoryId, charts, archived, onChanged }: ChartListProps) {
  const [order, setOrder] = useState<string[]>(() => charts.map((c) => c.chartId));
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<{ chart: BuilderChart; action: BuilderChartAction } | null>(
    null,
  );

  // La lista de la API manda si cambia (nuevo gráfico, archivado…).
  const ids = charts.map((c) => c.chartId).join(",");
  const [lastIds, setLastIds] = useState(ids);
  if (ids !== lastIds) {
    setLastIds(ids);
    setOrder(charts.map((c) => c.chartId));
  }

  const byId = new Map(charts.map((c) => [c.chartId, c]));
  const ordered = order.map((id) => byId.get(id)).filter((c): c is BuilderChart => !!c);

  async function move(chart: BuilderChart, direction: "up" | "down") {
    const next = moveChart(order, chart.chartId, direction);
    if (next.join(",") === order.join(",")) return;
    const previous = order;
    setOrder(next);
    setError(null);
    try {
      await reorderBuilderCharts(categoryId, next);
      setStatus(
        `«${chart.title}» quedó en la posición ${next.indexOf(chart.chartId) + 1} de ${next.length}.`,
      );
    } catch (err) {
      setOrder(previous);
      setError(errorMessage(err, "No se pudo reordenar."));
    }
  }

  async function runAction(chart: BuilderChart, action: BuilderChartAction) {
    setBusy(true);
    setError(null);
    try {
      await builderChartAction(chart.chartId, action);
      setStatus(`${ACTION_LABELS[action]}: «${chart.title}».`);
      onChanged();
    } catch (err) {
      setError(errorMessage(err, `No se pudo ${ACTION_LABELS[action].toLowerCase()}.`));
    } finally {
      setBusy(false);
    }
  }

  function requestAction(chart: BuilderChart, action: BuilderChartAction) {
    // Despublicar o archivar un gráfico publicado lo saca del dashboard: se confirma.
    if (action === "archive" || action === "unpublish") setPending({ chart, action });
    else runAction(chart, action);
  }

  return (
    <div className="flex flex-col gap-3">
      <p role="status" className="sr-only">
        {status}
      </p>
      {error && (
        <p className="rounded-md bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger-fg)]">
          {error}
        </p>
      )}
      {ordered.length === 0 ? (
        <p className="rounded-md border border-dashed border-[var(--border)] px-4 py-8 text-center text-sm text-[var(--text-muted)]">
          {archived ? "No hay gráficos archivados." : "Esta categoría todavía no tiene gráficos."}
        </p>
      ) : (
        <ol className="flex flex-col gap-2">
          {ordered.map((chart, index) => (
            <li
              key={chart.chartId}
              className="flex flex-wrap items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
            >
              {!archived && (
                <div className="flex flex-col">
                  <button
                    type="button"
                    className={ghostButton}
                    onClick={() => move(chart, "up")}
                    disabled={index === 0}
                    aria-label={`Subir «${chart.title}»`}
                  >
                    <ArrowUp size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={ghostButton}
                    onClick={() => move(chart, "down")}
                    disabled={index === ordered.length - 1}
                    aria-label={`Bajar «${chart.title}»`}
                  >
                    <ArrowDown size={16} aria-hidden="true" />
                  </button>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/dashboard-builder/charts/${chart.chartId}`}
                  className="block truncate text-sm font-medium text-[var(--text-primary)] hover:text-brand hover:underline"
                >
                  {chart.title}
                </Link>
                <p className="text-xs text-[var(--text-muted)]">
                  {chart.sourceKind === "entity_metric" ? "Métrica" : "Preguntas"} ·{" "}
                  {chartKindLabel(chart.chartKind)}
                  {chart.combineMode === "compare" ? " · comparación" : ""}
                  {chart.layout === "wide" ? " · ancho" : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <StatusBadge status={chart.status} />
                <AudienceBadge audience={chart.audience} />
                <HealthBadge health={chart.health} />
              </div>
              <div className="flex flex-wrap gap-1">
                {archived ? (
                  <button type="button" className={ghostButton} disabled={busy} onClick={() => requestAction(chart, "restore")}>
                    Restaurar
                  </button>
                ) : (
                  <>
                    {chart.status === "draft" ? (
                      <button type="button" className={ghostButton} disabled={busy} onClick={() => requestAction(chart, "publish")}>
                        Publicar
                      </button>
                    ) : (
                      <button type="button" className={ghostButton} disabled={busy} onClick={() => requestAction(chart, "unpublish")}>
                        Despublicar
                      </button>
                    )}
                    <button type="button" className={ghostButton} disabled={busy} onClick={() => requestAction(chart, "duplicate")}>
                      Duplicar
                    </button>
                    <button type="button" className={ghostButton} disabled={busy} onClick={() => requestAction(chart, "archive")}>
                      Archivar
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}

      <ConfirmModal
        open={pending !== null}
        title={pending?.action === "archive" ? "¿Archivar este gráfico?" : "¿Despublicar este gráfico?"}
        description={
          pending
            ? `«${pending.chart.title}» dejará de verse en el dashboard${
                pending.action === "archive" ? " y pasará a «Archivados», desde donde se puede restaurar" : ""
              }.`
            : ""
        }
        confirmLabel={pending?.action === "archive" ? "Archivar" : "Despublicar"}
        destructive
        onConfirm={() => {
          const p = pending;
          setPending(null);
          if (p) runAction(p.chart, p.action);
        }}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}
