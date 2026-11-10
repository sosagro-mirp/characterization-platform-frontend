import type { SelectionStatus, UnitRow } from "./types";

// Spec 99 — lógica pura de la selección de unidades productivas.

export const SELECTION_LABELS: Record<SelectionStatus, string> = {
  included: "Incluida",
  excluded: "Excluida",
  in_review: "En revisión",
};

export const NO_DECISION_LABEL = "Sin decisión";

type WithSelection = { selection?: { status: SelectionStatus } | null };

/** Filtra por decisión; `none` deja las fincas sin decisión. Lista vacía = todas. */
export function filterBySelection<T extends WithSelection>(
  rows: T[],
  statuses: (SelectionStatus | "none")[],
): T[] {
  if (!statuses.length) return rows;
  return rows.filter((row) =>
    statuses.includes(row.selection ? row.selection.status : "none"),
  );
}

/** La meta es un aviso, no un tope: solo se resalta al superarla. */
export function overTarget(included: number, target: number): boolean {
  return included > target;
}

/** Instrumentos con cobertura `falta` o `parcial`; `no_aplica` no cuenta. */
export function missingInstruments(row: Pick<UnitRow, "coverage">): string[] {
  return Object.entries(row.coverage)
    .filter(([, cell]) => cell.status === "falta" || cell.status === "parcial")
    .map(([instrumentId]) => instrumentId);
}
