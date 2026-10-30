"use client";

import { useState } from "react";
import { ApiError } from "@/lib/apiClient";
import {
  missingInstruments,
  SELECTION_LABELS,
} from "@/lib/production-units/selection";
import type {
  CoverageColumn,
  SelectionStatus,
  UnitRow,
} from "@/lib/production-units/types";
import {
  setSelection,
  type SelectionState,
} from "@/services/unit-selections.service";
import { SelectionHistory } from "./SelectionHistory";

interface SelectionDialogProps {
  row: UnitRow;
  columns: CoverageColumn[];
  onClose: () => void;
  /** Se llama con la decisión guardada, o `reload` si hubo conflicto de versión. */
  onSaved: (state: SelectionState) => void;
  onConflict: () => void;
}

const STATUSES = Object.keys(SELECTION_LABELS) as SelectionStatus[];

export function SelectionDialog({
  row,
  columns,
  onClose,
  onSaved,
  onConflict,
}: SelectionDialogProps) {
  const [status, setStatus] = useState<SelectionStatus>(
    row.selection?.status ?? "in_review",
  );
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflict, setConflict] = useState(false);

  const missing = missingInstruments(row).map((id) => {
    const c = columns.find((col) => col.memberIds.includes(id));
    return c ? (c.coverageGroup ?? c.code ?? c.name) : id;
  });
  const warnMissing = status === "included" && missing.length > 0;

  const save = async () => {
    if (!reason.trim() || saving) return;
    setSaving(true);
    setError(null);
    try {
      const saved = await setSelection(row.farmId, {
        status,
        reason: reason.trim(),
        expectedVersion: row.selection?.version ?? 0,
      });
      onSaved(saved);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setConflict(true);
        setError(
          "Otra persona cambió esta decisión. Recarga para ver la versión actual.",
        );
      } else {
        setError(err instanceof Error ? err.message : "No se pudo guardar.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Decisión sobre ${row.name}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <div className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-auto rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            {row.name}
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            Decisión actual:{" "}
            {row.selection
              ? SELECTION_LABELS[row.selection.status]
              : "Sin decisión"}
          </p>
        </div>

        <div className="flex gap-1.5" role="group" aria-label="Decisión">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={status === s}
              onClick={() => setStatus(s)}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                status === s
                  ? "border-brand bg-brand-subtle-bg text-brand-subtle-fg"
                  : "border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-muted)]"
              }`}
            >
              {SELECTION_LABELS[s]}
            </button>
          ))}
        </div>

        {warnMissing && (
          <p className="rounded-lg bg-[var(--warning-bg)] px-3 py-2 text-xs text-[var(--warning-fg)]">
            Esta finca tiene instrumentos pendientes: {missing.join(", ")}. Se
            puede incluir igual; deja el motivo por escrito.
          </p>
        )}

        <label className="block text-xs font-medium text-[var(--text-primary)]">
          Motivo (obligatorio)
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
          />
        </label>

        {error && (
          <p className="rounded-lg bg-[var(--danger-bg)] px-3 py-2 text-xs text-[var(--danger-fg)]">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          {conflict ? (
            <button
              type="button"
              onClick={onConflict}
              className="rounded-md bg-[var(--brand)] px-4 py-2 text-xs font-medium text-[var(--brand-foreground)]"
            >
              Recargar
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md px-4 py-2 text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--surface-muted)]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void save()}
                disabled={!reason.trim() || saving}
                className="rounded-md bg-[var(--brand)] px-4 py-2 text-xs font-medium text-[var(--brand-foreground)] disabled:opacity-50"
              >
                {saving ? "Guardando…" : "Guardar decisión"}
              </button>
            </>
          )}
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-[var(--text-primary)]">
            Historial
          </h3>
          <SelectionHistory farmId={row.farmId} />
        </div>
      </div>
    </div>
  );
}
