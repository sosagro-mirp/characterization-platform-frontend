"use client";

import { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import { SelectionCounter } from "@/components/admin/production-units/SelectionCounter";
import { SelectionDialog } from "@/components/admin/production-units/SelectionDialog";
import { ProductionUnitsTable } from "@/components/admin/production-units/ProductionUnitsTable";
import { STATUS_LABELS } from "@/components/admin/production-units/StatusChip";
import {
  applyUnitFilters,
  exportFileName,
} from "@/lib/production-units/filters";
import {
  NO_DECISION_LABEL,
  SELECTION_LABELS,
} from "@/lib/production-units/selection";
import type {
  CoverageStatus,
  ProductionUnitsResponse,
  SelectionStatus,
  UnitRow,
} from "@/lib/production-units/types";
import {
  exportProductionUnits,
  getProductionUnits,
} from "@/services/production-units.service";
import {
  exportSelection,
  getSelectionSummary,
  type SelectionSummary,
} from "@/services/unit-selections.service";

const selectClass =
  "rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]";

const STATUSES = Object.keys(STATUS_LABELS) as CoverageStatus[];

const REASONS: Record<string, string> = {
  sin_productor: "Sin productor",
  productor_sin_finca: "Productor sin finca",
  productor_varias_fincas: "Productor con varias fincas",
  cultivo_ambiguo: "Finca con varios cultivos y encuesta sin cultivo",
};

export default function ProductionUnitsPage() {
  const [data, setData] = useState<ProductionUnitsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [departmentId, setDepartmentId] = useState("");
  const [townId, setTownId] = useState("");
  const [cropId, setCropId] = useState("");
  const [instrumentId, setInstrumentId] = useState("");
  const [statuses, setStatuses] = useState<CoverageStatus[]>([]);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>(
    {},
  );
  const [showUnlocated, setShowUnlocated] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const [selectionFilter, setSelectionFilter] = useState<
    (SelectionStatus | "none")[]
  >([]);
  const [summary, setSummary] = useState<SelectionSummary | null>(null);
  const [deciding, setDeciding] = useState<UnitRow | null>(null);

  const load = () => {
    getProductionUnits()
      .then(setData)
      .catch((err) =>
        setError(
          err instanceof Error
            ? err.message
            : "Error al cargar las unidades productivas.",
        ),
      );
    getSelectionSummary()
      .then(setSummary)
      .catch(() => setSummary(null));
  };

  useEffect(load, []);

  const downloadBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  };

  const handleExportSelection = async () => {
    setExportError(null);
    try {
      const blob = await exportSelection();
      downloadBlob(
        blob,
        exportFileName().replace("unidades-productivas", "seleccion-unidades"),
      );
    } catch (err) {
      setExportError(
        err instanceof Error ? err.message : "No se pudo generar el Excel.",
      );
    }
  };

  const options = useMemo(() => {
    const departments = new Map<string, string>();
    const towns = new Map<
      string,
      { name: string; departmentId: string | null }
    >();
    const crops = new Map<string, string>();
    for (const row of data?.rows ?? []) {
      if (row.department)
        departments.set(row.department.departmentId, row.department.name);
      if (row.town) {
        towns.set(row.town.townId, {
          name: row.town.name,
          departmentId: row.department?.departmentId ?? null,
        });
      }
      for (const crop of row.crops) crops.set(crop.cropId, crop.name);
    }
    const byName = (a: [string, string], b: [string, string]) =>
      a[1].localeCompare(b[1], "es");
    return {
      departments: [...departments].sort(byName),
      towns: [...towns]
        .filter(([, t]) => !departmentId || t.departmentId === departmentId)
        .map(([id, t]) => [id, t.name] as [string, string])
        .sort(byName),
      crops: [...crops].sort(byName),
    };
  }, [data, departmentId]);

  const filtered = useMemo(
    () =>
      applyUnitFilters(data?.rows ?? [], {
        departmentIds: departmentId ? [departmentId] : [],
        townIds: townId ? [townId] : [],
        cropIds: cropId ? [cropId] : [],
        instrument:
          instrumentId && statuses.length ? { instrumentId, statuses } : null,
        columns: columnFilters,
        selection: selectionFilter,
      }),
    [
      data,
      departmentId,
      townId,
      cropId,
      instrumentId,
      statuses,
      columnFilters,
      selectionFilter,
    ],
  );

  const toggleStatus = (status: CoverageStatus) =>
    setStatuses((current) =>
      current.includes(status)
        ? current.filter((s) => s !== status)
        : [...current, status],
    );

  const pendingConsent = filtered.filter((r) => r.hasPendingConsent).length;

  const handleExport = async () => {
    if (!filtered.length || exporting) return;
    setExporting(true);
    setExportError(null);
    try {
      const blob = await exportProductionUnits(
        filtered.map((r) => r.farmId),
        {
          departmentId,
          townId,
          cropId,
          instrumentId,
          statuses,
          columns: columnFilters,
          selection: selectionFilter,
        },
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = exportFileName();
      document.body.appendChild(link);
      link.click();
      link.remove();
      // Revocar de inmediato corta la descarga en algunos navegadores.
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch (err) {
      setExportError(
        err instanceof Error ? err.message : "No se pudo generar el Excel.",
      );
    } finally {
      setExporting(false);
    }
  };

  const clear = () => {
    setDepartmentId("");
    setTownId("");
    setCropId("");
    setInstrumentId("");
    setStatuses([]);
    setColumnFilters({});
    setSelectionFilter([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          Unidades productivas
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          {data
            ? `${filtered.length} de ${data.summary.farms} fincas · ${data.summary.totalSurveys} encuestas`
            : "Cobertura de instrumentos por finca, según el alcance de cada uno."}
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger-fg)]">
          {error}
        </p>
      )}

      {data && data.summary.instrumentsWithoutScope > 0 && (
        <p className="rounded-lg bg-[var(--warning-bg)] px-3 py-2 text-sm text-[var(--warning-fg)]">
          {data.summary.instrumentsWithoutScope} instrumento
          {data.summary.instrumentsWithoutScope === 1 ? "" : "s"} activo
          {data.summary.instrumentsWithoutScope === 1 ? "" : "s"} sin alcance
          declarado: no aparecen en la cobertura. Decláralo desde la edición del
          instrumento.
        </p>
      )}

      {!data && !error && (
        <p className="text-sm text-[var(--text-muted)]">Cargando…</p>
      )}

      {summary && <SelectionCounter summary={summary} />}

      {data && (
        <>
          <div className="flex flex-wrap items-end gap-3">
            <select
              aria-label="Departamento"
              value={departmentId}
              onChange={(e) => {
                setDepartmentId(e.target.value);
                setTownId("");
              }}
              className={selectClass}
            >
              <option value="">Todos los departamentos</option>
              {options.departments.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
            <select
              aria-label="Municipio"
              value={townId}
              onChange={(e) => setTownId(e.target.value)}
              className={selectClass}
            >
              <option value="">Todos los municipios</option>
              {options.towns.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
            <select
              aria-label="Cultivo"
              value={cropId}
              onChange={(e) => setCropId(e.target.value)}
              className={selectClass}
            >
              <option value="">Todos los cultivos</option>
              {options.crops.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
            <select
              aria-label="Instrumento"
              value={instrumentId}
              onChange={(e) => setInstrumentId(e.target.value)}
              className={selectClass}
            >
              <option value="">Instrumento…</option>
              {data.instruments.map((i) => (
                <option key={i.instrumentId} value={i.instrumentId}>
                  {i.coverageGroup ?? i.code ?? i.name}
                </option>
              ))}
            </select>
            {instrumentId && (
              <div
                className="flex flex-wrap gap-1.5"
                role="group"
                aria-label="Estado"
              >
                {STATUSES.map((status) => {
                  const on = statuses.includes(status);
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => toggleStatus(status)}
                      aria-pressed={on}
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                        on
                          ? "border-brand bg-brand-subtle-bg text-brand-subtle-fg"
                          : "border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-muted)]"
                      }`}
                    >
                      {STATUS_LABELS[status]}
                    </button>
                  );
                })}
              </div>
            )}
            <div
              className="flex flex-wrap gap-1.5"
              role="group"
              aria-label="Decisión"
            >
              {(
                [
                  ...(Object.keys(SELECTION_LABELS) as SelectionStatus[]),
                  "none",
                ] as const
              ).map((s) => {
                const on = selectionFilter.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={on}
                    onClick={() =>
                      setSelectionFilter((cur) =>
                        cur.includes(s)
                          ? cur.filter((x) => x !== s)
                          : [...cur, s],
                      )
                    }
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      on
                        ? "border-brand bg-brand-subtle-bg text-brand-subtle-fg"
                        : "border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-muted)]"
                    }`}
                  >
                    {s === "none" ? NO_DECISION_LABEL : SELECTION_LABELS[s]}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={clear}
              className="rounded-md px-3 py-2 text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--surface-muted)]"
            >
              Limpiar filtros
            </button>
            <button
              type="button"
              onClick={() => void handleExport()}
              disabled={exporting || filtered.length === 0}
              className="ml-auto flex items-center gap-1.5 rounded-md bg-[var(--brand)] px-4 py-2 text-xs font-medium text-[var(--brand-foreground)] transition-colors hover:bg-[var(--brand-hover)] disabled:opacity-50"
            >
              <Download className="size-3.5" aria-hidden="true" />
              {exporting
                ? "Generando…"
                : `Exportar a Excel (${filtered.length})`}
            </button>
            <button
              type="button"
              onClick={() => void handleExportSelection()}
              className="flex items-center gap-1.5 rounded-md border border-[var(--border)] px-4 py-2 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--surface-muted)]"
            >
              <Download className="size-3.5" aria-hidden="true" />
              Exportar selección
            </button>
          </div>

          {pendingConsent > 0 && (
            <p className="rounded-lg bg-[var(--warning-bg)] px-3 py-2 text-sm text-[var(--warning-fg)]">
              {pendingConsent} de las {filtered.length} fincas filtradas tienen
              el consentimiento pendiente. El Excel las incluye y lo informa en
              la columna «Consentimiento».
            </p>
          )}
          {exportError && (
            <p className="rounded-lg bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger-fg)]">
              {exportError}
            </p>
          )}

          {filtered.length > 0 ? (
            <ProductionUnitsTable
              rows={filtered}
              columns={data.instruments}
              columnFilters={columnFilters}
              onColumnFilter={(key, value) =>
                setColumnFilters((current) => ({ ...current, [key]: value }))
              }
              onDecide={setDeciding}
            />
          ) : (
            <p className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-6 py-12 text-center text-sm text-[var(--text-muted)]">
              Ninguna finca cumple los filtros.
            </p>
          )}

          <p className="text-[11px] text-[var(--text-muted)]">
            * La celda usa una encuesta fuera del alcance declarado o con
            cultivo o finca inferidos. Pasa el cursor sobre el estado para ver
            el detalle.
          </p>

          <section>
            <button
              type="button"
              onClick={() => setShowUnlocated((v) => !v)}
              aria-expanded={showUnlocated}
              className="text-sm font-medium text-[var(--text-primary)] hover:underline"
            >
              Sin ubicar ({data.summary.unlocated})
            </button>
            {showUnlocated && (
              <div className="mt-2 overflow-auto rounded-md border border-[var(--border)] bg-[var(--surface)]">
                {data.unlocated.length === 0 ? (
                  <p className="px-4 py-6 text-center text-xs text-[var(--text-muted)]">
                    Todas las encuestas están asociadas a una finca.
                  </p>
                ) : (
                  <table className="w-full text-xs">
                    <thead className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-[10.5px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                      <tr>
                        <th className="px-3 py-2.5 text-left">Encuesta</th>
                        <th className="px-3 py-2.5 text-left">Encuestado</th>
                        <th className="px-3 py-2.5 text-left">Origen</th>
                        <th className="px-3 py-2.5 text-left">Respuestas</th>
                        <th className="px-3 py-2.5 text-left">Motivo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {data.unlocated.map((s) => (
                        <tr key={s.surveyId}>
                          <td className="px-3 py-2.5 text-[var(--text-muted)]">
                            {s.surveyId.slice(0, 8)} ·{" "}
                            {new Date(s.createdAt).toLocaleDateString("es-CO")}
                          </td>
                          <td className="px-3 py-2.5">
                            {s.respondentName ?? "—"}
                          </td>
                          <td className="px-3 py-2.5 text-[var(--text-muted)]">
                            {s.origin === "public" ? "Pública" : "Campo"}
                          </td>
                          <td className="px-3 py-2.5 text-[var(--text-muted)]">
                            {s.responseCount}
                          </td>
                          <td className="px-3 py-2.5 text-[var(--text-muted)]">
                            {REASONS[s.reason] ?? s.reason}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </section>
        </>
      )}
      {deciding && data && (
        <SelectionDialog
          key={deciding.farmId}
          row={deciding}
          columns={data.instruments}
          onClose={() => setDeciding(null)}
          onSaved={() => {
            setDeciding(null);
            load();
          }}
          onConflict={() => {
            setDeciding(null);
            load();
          }}
        />
      )}
    </div>
  );
}
