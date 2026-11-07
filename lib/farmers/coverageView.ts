import type {
  FarmerCoverageInstrument,
  FarmerCoverageStatus,
  FarmerCoverageUnit,
  FarmerScopeLevel,
} from "@/app/(admin)/types";

export interface CoverageLevelGroup {
  level: FarmerScopeLevel;
  title: string;
  instruments: FarmerCoverageInstrument[];
}

const LEVELS: { level: FarmerScopeLevel; title: string }[] = [
  { level: "farmer", title: "Productor" },
  { level: "farm", title: "Fincas" },
  { level: "farm_crop", title: "Cultivos" },
];

const STATUS_ORDER: Record<FarmerCoverageStatus, number> = {
  falta: 0,
  parcial: 1,
  aplicado: 2,
  no_aplica: 3,
};

/** Un grupo por nivel (Productor, Fincas, Cultivos), pendientes primero. No muta. */
export function groupInstrumentsByLevel(
  instruments: FarmerCoverageInstrument[],
): CoverageLevelGroup[] {
  return LEVELS.map(({ level, title }) => ({
    level,
    title,
    instruments: instruments
      .filter((i) => i.scopeLevel === level)
      .sort(
        (a, b) =>
          STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
          a.name.localeCompare(b.name, "es"),
      ),
  })).filter((g) => g.instruments.length > 0);
}

/** Unidades (fincas o cultivos) en falta o parciales, en el orden de `units`. */
export function missingUnits(
  instrument: FarmerCoverageInstrument,
): FarmerCoverageUnit[] {
  return instrument.units.filter(
    (u) => u.status === "falta" || u.status === "parcial",
  );
}

export type BadgeKind =
  | "inferredFarm"
  | "inferredCrop"
  | "outOfScope"
  | "coveredByOtherFarmer";

export interface CoverageBadge {
  kind: BadgeKind;
  label: string;
  description: string;
}

const BADGES: Record<BadgeKind, Omit<CoverageBadge, "kind">> = {
  inferredFarm: {
    label: "Finca inferida",
    description:
      "La encuesta no indicó la finca; se asignó a la única finca del productor.",
  },
  inferredCrop: {
    label: "Cultivo inferido",
    description:
      "La encuesta no indicó el cultivo; se asignó al único cultivo que aplica.",
  },
  outOfScope: {
    label: "Fuera de alcance",
    description:
      "La encuesta se aplicó a una unidad que el instrumento no declara en su alcance; se muestra, pero no cuenta como cobertura.",
  },
  coveredByOtherFarmer: {
    label: "Cubierta por otro productor",
    description:
      "La encuesta de esta finca la aplicó otro productor que comparte la finca.",
  },
};

const BADGE_ORDER: [keyof FarmerCoverageUnit, BadgeKind][] = [
  ["inferredFarm", "inferredFarm"],
  ["inferredCrop", "inferredCrop"],
  ["outOfScope", "outOfScope"],
  ["coveredByOtherFarmer", "coveredByOtherFarmer"],
];

/** Una marca por bandera activa, con etiqueta corta y texto explicativo. */
export function unitBadges(unit: FarmerCoverageUnit): CoverageBadge[] {
  return BADGE_ORDER.filter(([flag]) => unit[flag] === true).map(
    ([, kind]) => ({ kind, ...BADGES[kind] }),
  );
}
