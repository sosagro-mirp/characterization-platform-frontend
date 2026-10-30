import type { UnitFilters, UnitRow } from "./types";

/** Minúsculas y sin tildes, para que "jardin" encuentre "Jardín". */
export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

const COLUMN_TEXT: Record<string, (row: UnitRow) => string> = {
  name: (r) => r.name,
  department: (r) => r.department?.name ?? "",
  town: (r) => r.town?.name ?? "",
  crops: (r) => r.crops.map((c) => c.name).join(" "),
  farmers: (r) =>
    (r.farmers ?? []).map((f) => `${f.name} ${f.documentId ?? ""}`).join(" "),
};

/** Aplica los filtros generales y por columna; todos se combinan (AND). No muta las filas. */
export function applyUnitFilters(
  rows: UnitRow[],
  filters: UnitFilters,
): UnitRow[] {
  const { departmentIds, townIds, cropIds, instrument, columns } = filters;
  const columnTerms = Object.entries(columns ?? {})
    .map(([key, value]) => [key, normalizeText(value)] as const)
    .filter(([key, value]) => value !== "" && key in COLUMN_TEXT);

  return rows.filter((row) => {
    if (departmentIds?.length) {
      if (!row.department || !departmentIds.includes(row.department.departmentId)) {
        return false;
      }
    }
    if (townIds?.length) {
      if (!row.town || !townIds.includes(row.town.townId)) return false;
    }
    if (cropIds?.length) {
      if (!row.crops.some((c) => cropIds.includes(c.cropId))) return false;
    }
    if (instrument && instrument.statuses.length) {
      const status = row.coverage[instrument.instrumentId]?.status;
      if (!status || !instrument.statuses.includes(status)) return false;
    }
    for (const [key, term] of columnTerms) {
      if (!normalizeText(COLUMN_TEXT[key](row)).includes(term)) return false;
    }
    return true;
  });
}
