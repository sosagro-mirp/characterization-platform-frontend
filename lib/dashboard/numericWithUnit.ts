import type { AggregationUnitGroup } from "@/app/(dashboard)/types";

/**
 * El backend deja las estadísticas de un grupo en `null` cuando ese grupo no
 * alcanza el umbral de privacidad: entonces solo se muestra su conteo.
 */
export function hasUnitStats(group: AggregationUnitGroup): boolean {
  return group.average !== null && group.min !== null && group.max !== null;
}

/** La unidad que se muestra primero: la primera (más respondida) con estadísticas. */
export function defaultUnitIndex(groups: AggregationUnitGroup[]): number {
  const index = groups.findIndex(hasUnitStats);
  return index === -1 ? 0 : index;
}
