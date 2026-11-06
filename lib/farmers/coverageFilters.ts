import type {
  FarmerCoverageRow,
  FarmerCoverageStatus,
} from "@/app/(admin)/types";
import { normalizeText } from "@/lib/production-units/filters";

export interface FarmerCoverageFilters {
  search?: string;
  departmentIds?: string[];
  townIds?: string[];
  cropIds?: string[];
  missingInstrumentId?: string | null;
  status?: "completo" | "con_pendientes" | "sin_finca" | null;
  withOpenDiscrepancies?: boolean;
}

const PENDING: FarmerCoverageStatus[] = ["falta", "parcial"];

function hasPending(row: FarmerCoverageRow): boolean {
  return Object.values(row.statusByInstrument).some((s) => PENDING.includes(s));
}

/** Aplica todos los filtros (AND). No muta las filas y conserva el orden. */
export function applyFarmerCoverageFilters(
  rows: FarmerCoverageRow[],
  filters: FarmerCoverageFilters,
): FarmerCoverageRow[] {
  const term = normalizeText(filters.search ?? "");
  const { departmentIds, townIds, cropIds, missingInstrumentId, status } =
    filters;

  return rows.filter((row) => {
    if (term) {
      const haystack = normalizeText(`${row.name} ${row.documentId ?? ""}`);
      if (!haystack.includes(term)) return false;
    }
    if (departmentIds?.length) {
      const id = row.primaryFarm?.department?.departmentId;
      if (!id || !departmentIds.includes(id)) return false;
    }
    if (townIds?.length) {
      const id = row.primaryFarm?.town?.townId;
      if (!id || !townIds.includes(id)) return false;
    }
    if (cropIds?.length && !row.cropIds.some((c) => cropIds.includes(c))) {
      return false;
    }
    if (missingInstrumentId) {
      const s = row.statusByInstrument[missingInstrumentId];
      if (!s || !PENDING.includes(s)) return false;
    }
    if (status === "sin_finca" && !row.warnings.includes("sin_finca")) {
      return false;
    }
    if (status === "con_pendientes" && !hasPending(row)) return false;
    if (
      status === "completo" &&
      (hasPending(row) || row.warnings.includes("sin_finca"))
    ) {
      return false;
    }
    if (filters.withOpenDiscrepancies && row.openDiscrepancies <= 0) {
      return false;
    }
    return true;
  });
}

/** Aplicados / aplicables y pendientes (falta + parcial) de una fila. */
export function summarizeFarmerCoverage(row: FarmerCoverageRow): {
  applied: number;
  applicable: number;
  pending: number;
  label: string;
} {
  const { applied, applicable, pending, partial } = row.summary;
  return {
    applied,
    applicable,
    pending: pending + partial,
    label: `${applied} de ${applicable}`,
  };
}
