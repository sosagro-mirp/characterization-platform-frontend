"use client";

import { useEffect, useState } from "react";
import {
  NO_DECISION_LABEL,
  SELECTION_LABELS,
} from "@/lib/production-units/selection";
import {
  getSelectionHistory,
  type SelectionEvent,
} from "@/services/unit-selections.service";

/** Historial inalterable de una finca, del más reciente al más antiguo. */
export function SelectionHistory({ farmId }: { farmId: string }) {
  const [events, setEvents] = useState<SelectionEvent[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSelectionHistory(farmId)
      .then(setEvents)
      .catch((err) =>
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo cargar el historial.",
        ),
      );
  }, [farmId]);

  if (error) return <p className="text-xs text-[var(--danger-fg)]">{error}</p>;
  if (!events)
    return <p className="text-xs text-[var(--text-muted)]">Cargando…</p>;
  if (!events.length)
    return (
      <p className="text-xs text-[var(--text-muted)]">
        Sin cambios registrados.
      </p>
    );

  return (
    <ol className="space-y-2">
      {events.map((e, i) => {
        const snapshot = e.coverageSnapshot ?? [];
        const missing = snapshot.filter(
          (c) => c.cell.status === "falta" || c.cell.status === "parcial",
        ).length;
        return (
          <li
            key={`${e.createdAt}-${i}`}
            className="rounded-md border border-[var(--border)] px-3 py-2 text-xs"
          >
            <p className="font-medium text-[var(--text-primary)]">
              {e.fromStatus
                ? SELECTION_LABELS[e.fromStatus]
                : NO_DECISION_LABEL}
              {" → "}
              {SELECTION_LABELS[e.toStatus]}
            </p>
            <p className="text-[var(--text-primary)]">{e.reason}</p>
            <p className="text-[var(--text-muted)]">
              {e.userName} · {new Date(e.createdAt).toLocaleString("es-CO")} ·
              cobertura de entonces: {missing} de {snapshot.length} instrumentos
              con faltantes
            </p>
          </li>
        );
      })}
    </ol>
  );
}
