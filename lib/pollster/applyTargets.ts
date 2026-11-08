/**
 * Spec 102 — acciones «Aplicar» de la ficha del encuestador, derivadas de la
 * cobertura del productor. Funciones puras.
 */
import type {
  FarmerCoverageDetail,
  FarmerScopeLevel,
} from "@/app/(admin)/types";

export interface ApplyTarget {
  instrumentId: string;
  instrumentName: string;
  scopeLevel: FarmerScopeLevel;
  farmId: string | null;
  farmCropId: string | null;
  label: string;
  status: "falta" | "parcial" | "aplicado";
  requiresReapplyConfirm: boolean;
  lastAppliedAt: string | null;
  coveredByOtherFarmer: boolean;
}

export function listApplyTargets(detail: FarmerCoverageDetail): ApplyTarget[] {
  const targets: ApplyTarget[] = [];
  for (const instrument of detail.instruments) {
    if (instrument.status === "no_aplica") continue;
    for (const unit of instrument.units) {
      if (unit.status === "no_aplica" || unit.outOfScope) continue;
      const applied = unit.status === "aplicado";
      targets.push({
        instrumentId: instrument.instrumentId,
        instrumentName: instrument.name,
        scopeLevel: instrument.scopeLevel,
        farmId: unit.farmId ?? null,
        farmCropId: unit.farmCropId ?? null,
        label: unit.label,
        status: unit.status,
        requiresReapplyConfirm: applied,
        lastAppliedAt: applied ? (instrument.latestSurvey?.createdAt ?? null) : null,
        coveredByOtherFarmer: unit.coveredByOtherFarmer ?? false,
      });
    }
  }
  const rank = (t: ApplyTarget) => (t.status === "aplicado" ? 1 : 0);
  // sort estable: conserva el orden de `units` a igualdad.
  return targets.sort(
    (a, b) =>
      rank(a) - rank(b) ||
      a.instrumentName.localeCompare(b.instrumentName, "es"),
  );
}

function formatDmy(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getUTCFullYear()}`;
}

export function reapplyConfirmationText(target: ApplyTarget): string {
  const when = target.lastAppliedAt
    ? ` La última encuesta es del ${formatDmy(target.lastAppliedAt)}.`
    : "";
  const other = target.coveredByOtherFarmer
    ? " Esta unidad ya fue cubierta por otro productor."
    : "";
  return `«${target.instrumentName}» ya está aplicado en ${target.label}.${when}${other} ¿Aplicarlo de nuevo?`;
}
