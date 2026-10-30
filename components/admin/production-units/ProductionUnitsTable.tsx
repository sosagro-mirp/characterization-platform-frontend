"use client";

import type { CoverageColumn, UnitRow } from "@/lib/production-units/types";
import { SELECTION_LABELS } from "@/lib/production-units/selection";
import { StatusChip } from "./StatusChip";

interface ProductionUnitsTableProps {
  rows: UnitRow[];
  columns: CoverageColumn[];
  columnFilters: Record<string, string>;
  onColumnFilter: (key: string, value: string) => void;
  onDecide: (row: UnitRow) => void;
}

const FIXED: { key: string; label: string }[] = [
  { key: "name", label: "Finca" },
  { key: "department", label: "Departamento" },
  { key: "town", label: "Municipio" },
  { key: "crops", label: "Cultivos" },
  { key: "farmers", label: "Productores" },
];

const WARNING_LABELS: Record<string, string> = {
  sin_cultivo: "Sin cultivo",
  sin_productor: "Sin productor",
};

const inputClass =
  "w-full min-w-[6rem] rounded border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[11px] font-normal normal-case tracking-normal text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]";

export function ProductionUnitsTable({
  rows,
  columns,
  columnFilters,
  onColumnFilter,
  onDecide,
}: ProductionUnitsTableProps) {
  return (
    <div className="overflow-auto rounded-md border border-[var(--border)] bg-[var(--surface)] max-h-[60vh]">
      <table className="w-full text-xs">
        <thead className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--surface-muted)] text-[10.5px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          <tr>
            {FIXED.map((c) => (
              <th key={c.key} className="px-3 py-2.5 text-left align-top">
                {c.label}
              </th>
            ))}
            <th className="px-3 py-2.5 text-left align-top">Decisión</th>
            <th className="px-3 py-2.5 text-left align-top">Encuestas</th>
            {columns.map((c) => (
              <th
                key={c.instrumentId}
                className="px-3 py-2.5 text-left align-top"
                title={c.name}
              >
                {c.coverageGroup ?? c.code ?? c.name}
              </th>
            ))}
          </tr>
          <tr>
            {FIXED.map((c) => (
              <th key={c.key} className="px-3 pb-2">
                <input
                  type="text"
                  value={columnFilters[c.key] ?? ""}
                  onChange={(e) => onColumnFilter(c.key, e.target.value)}
                  placeholder="Filtrar…"
                  aria-label={`Filtrar por ${c.label}`}
                  className={inputClass}
                />
              </th>
            ))}
            <th />
            <th />
            {columns.map((c) => (
              <th key={c.instrumentId} />
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {rows.map((row) => (
            <tr key={row.farmId} className="hover:bg-[var(--surface-muted)]">
              <td className="px-3 py-2.5 font-medium text-[var(--text-primary)]">
                {row.name}
                {row.warnings?.length ? (
                  <span className="ml-2 text-[10.5px] font-normal text-[var(--warning-fg)]">
                    {row.warnings
                      .map((w) => WARNING_LABELS[w] ?? w)
                      .join(" · ")}
                  </span>
                ) : null}
              </td>
              <td className="px-3 py-2.5 text-[var(--text-muted)]">
                {row.department?.name ?? "—"}
              </td>
              <td className="px-3 py-2.5 text-[var(--text-muted)]">
                {row.town?.name ?? "—"}
              </td>
              <td className="px-3 py-2.5 text-[var(--text-muted)]">
                {row.crops.length
                  ? row.crops.map((c) => c.name).join(", ")
                  : "—"}
              </td>
              <td className="px-3 py-2.5 text-[var(--text-muted)]">
                {row.farmers?.length
                  ? row.farmers.map((f) => f.name).join(", ")
                  : "—"}
              </td>
              <td className="px-3 py-2.5 whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => onDecide(row)}
                  title={row.selection?.reason ?? "Registrar decisión"}
                  className="rounded-full border border-[var(--border)] px-2.5 py-0.5 text-[10.5px] font-medium text-[var(--text-primary)] hover:bg-[var(--surface-muted)]"
                >
                  {row.selection
                    ? SELECTION_LABELS[row.selection.status]
                    : "Sin decisión"}
                </button>
              </td>
              <td className="px-3 py-2.5 text-[var(--text-muted)] whitespace-nowrap">
                {row.totalSurveys ?? 0}
                {row.unsyncedWithResponses ? (
                  <span
                    className="ml-1 text-[var(--warning-fg)]"
                    title="Encuestas con respuestas sin sincronizar"
                  >
                    (+{row.unsyncedWithResponses} sin sincronizar)
                  </span>
                ) : null}
              </td>
              {columns.map((c) => (
                <td key={c.instrumentId} className="px-3 py-2.5">
                  <StatusChip cell={row.coverage[c.instrumentId]} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
