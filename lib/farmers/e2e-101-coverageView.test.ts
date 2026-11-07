/**
 * e2e-101 — Spec 101 «Ficha y lista de productores por cobertura»: vista de la
 * pestaña «Cobertura» de `/admin/farmers/[id]` (funciones puras).
 *
 * Escrito junto con el spec, antes de la implementación: arranca EN ROJO.
 * Cubre C6, C7 y C9. Lo visual (enlace a la encuesta, C8) vive en el `test-101`
 * manual (raíz del ecosistema).
 *
 * Import dinámico por el mismo motivo que en `e2e-094-farmerFarms.test.ts`.
 *
 * ── Contrato que `lib/farmers/coverageView.ts` debe exponer ────────────────
 *
 * Los instrumentos son los de `GET /api/farmers/:farmerId/coverage` (spec 100,
 * contrato 1).
 *
 * - `groupInstrumentsByLevel(instruments: FarmerCoverageInstrument[]):
 *     CoverageLevelGroup[]`
 *   Un grupo por `scopeLevel`, en orden fijo `farmer → farm → farm_crop`, con
 *   título «Productor», «Fincas» y «Cultivos». Omite los grupos vacíos. Dentro
 *   de cada grupo, los pendientes primero: `falta`, `parcial`, `aplicado`,
 *   `no_aplica`; a igual estado, por nombre (`localeCompare` en «es»). No muta.
 *
 * - `missingUnits(instrument: FarmerCoverageInstrument): FarmerCoverageUnit[]`
 *   Las unidades (fincas o cultivos) en `falta` o `parcial`, en el orden de
 *   `units`. Vacío si el instrumento está aplicado o no aplica.
 *
 * - `unitBadges(unit: FarmerCoverageUnit): CoverageBadge[]`
 *   Una marca por bandera activa, en el orden `inferredFarm`, `inferredCrop`,
 *   `outOfScope`, `coveredByOtherFarmer`. Cada marca trae `kind`, `label` corto
 *   («Finca inferida», «Cultivo inferido», «Fuera de alcance», «Cubierta por otro
 *   productor») y `description`: texto explicativo para el tooltip, distinto
 *   de la etiqueta. Sin banderas, `[]`.
 *
 * Tipos locales y mínimos; la implementación los define con estos nombres de campo.
 */
import { describe, expect, it } from "vitest";

type CoverageStatus = "aplicado" | "parcial" | "falta" | "no_aplica";
type ScopeLevel = "farmer" | "farm" | "farm_crop";

interface FarmerCoverageUnit {
  unitType: ScopeLevel;
  farmId?: string;
  farmCropId?: string;
  label: string;
  status: CoverageStatus;
  surveyId: string | null;
  surveyCount: number;
  inferredFarm?: boolean;
  inferredCrop?: boolean;
  outOfScope?: boolean;
  coveredByOtherFarmer?: boolean;
}

interface FarmerCoverageInstrument {
  instrumentId: string;
  name: string;
  code: string | null;
  scopeLevel: ScopeLevel;
  coverageGroup: string | null;
  memberIds: string[];
  status: CoverageStatus;
  surveyCount: number;
  latestSurvey: { surveyId: string; createdAt: string } | null;
  units: FarmerCoverageUnit[];
}

interface CoverageLevelGroup {
  level: ScopeLevel;
  title: string;
  instruments: FarmerCoverageInstrument[];
}

type BadgeKind =
  | "inferredFarm"
  | "inferredCrop"
  | "outOfScope"
  | "coveredByOtherFarmer";

interface CoverageBadge {
  kind: BadgeKind;
  label: string;
  description: string;
}

interface CoverageViewModule {
  groupInstrumentsByLevel(
    instruments: FarmerCoverageInstrument[],
  ): CoverageLevelGroup[];
  missingUnits(instrument: FarmerCoverageInstrument): FarmerCoverageUnit[];
  unitBadges(unit: FarmerCoverageUnit): CoverageBadge[];
}

async function loadView(): Promise<CoverageViewModule> {
  const specifier = "./coverageView";
  return (await import(/* @vite-ignore */ specifier)) as CoverageViewModule;
}

function unit(
  partial: Partial<FarmerCoverageUnit> &
    Pick<FarmerCoverageUnit, "unitType" | "label" | "status">,
): FarmerCoverageUnit {
  return { surveyId: null, surveyCount: 0, ...partial };
}

function instrument(
  partial: Partial<FarmerCoverageInstrument> &
    Pick<
      FarmerCoverageInstrument,
      "instrumentId" | "name" | "scopeLevel" | "status"
    >,
): FarmerCoverageInstrument {
  return {
    code: null,
    coverageGroup: null,
    memberIds: [partial.instrumentId],
    surveyCount: 0,
    latestSurvey: null,
    units: [],
    ...partial,
  };
}

const INSTRUMENTS: FarmerCoverageInstrument[] = [
  instrument({
    instrumentId: "crop-1",
    name: "Manejo del cultivo",
    scopeLevel: "farm_crop",
    status: "parcial",
    units: [
      unit({
        unitType: "farm_crop",
        farmId: "f1",
        farmCropId: "fc1",
        label: "La Esperanza · Café",
        status: "aplicado",
        surveyId: "s1",
        surveyCount: 1,
      }),
      unit({
        unitType: "farm_crop",
        farmId: "f1",
        farmCropId: "fc2",
        label: "La Esperanza · Cacao",
        status: "falta",
      }),
      unit({
        unitType: "farm_crop",
        farmId: "f2",
        farmCropId: "fc3",
        label: "El Porvenir · Café",
        status: "falta",
      }),
    ],
  }),
  instrument({
    instrumentId: "farmer-ok",
    name: "Caracterización del productor",
    scopeLevel: "farmer",
    status: "aplicado",
    surveyCount: 2,
    latestSurvey: { surveyId: "s9", createdAt: "2026-10-01T10:00:00.000Z" },
  }),
  instrument({
    instrumentId: "farm-partial",
    name: "Información de la finca",
    scopeLevel: "farm",
    status: "parcial",
    units: [
      unit({
        unitType: "farm",
        farmId: "f1",
        label: "La Esperanza",
        status: "aplicado",
        surveyId: "s2",
        surveyCount: 1,
        coveredByOtherFarmer: true,
      }),
      unit({
        unitType: "farm",
        farmId: "f2",
        label: "El Porvenir",
        status: "falta",
      }),
    ],
  }),
  instrument({
    instrumentId: "farmer-missing",
    name: "Bienestar del hogar",
    scopeLevel: "farmer",
    status: "falta",
  }),
  instrument({
    instrumentId: "farm-na",
    name: "Agua y suelos",
    scopeLevel: "farm",
    status: "no_aplica",
  }),
  instrument({
    instrumentId: "farmer-partial-b",
    name: "Acceso a crédito",
    scopeLevel: "farmer",
    status: "falta",
  }),
];

const names = (group: CoverageLevelGroup) =>
  group.instruments.map((i) => i.instrumentId);

describe("Spec 101 — vista de la pestaña Cobertura", () => {
  it("C6 — agrupa por nivel en el orden Productor, Fincas, Cultivos", async () => {
    const { groupInstrumentsByLevel } = await loadView();
    const groups = groupInstrumentsByLevel(INSTRUMENTS);
    expect(groups.map((g) => [g.level, g.title])).toEqual([
      ["farmer", "Productor"],
      ["farm", "Fincas"],
      ["farm_crop", "Cultivos"],
    ]);
  });

  it("C6 — dentro de cada nivel, los pendientes van primero", async () => {
    const { groupInstrumentsByLevel } = await loadView();
    const [farmer, farm, crop] = groupInstrumentsByLevel(INSTRUMENTS);
    // Dos en falta (por nombre: «Acceso…» antes que «Bienestar…»), luego el aplicado.
    expect(names(farmer)).toEqual([
      "farmer-partial-b",
      "farmer-missing",
      "farmer-ok",
    ]);
    // Parcial antes que no aplica.
    expect(names(farm)).toEqual(["farm-partial", "farm-na"]);
    expect(names(crop)).toEqual(["crop-1"]);
  });

  it("C6 — falta va antes que parcial, y no aplica al final", async () => {
    const { groupInstrumentsByLevel } = await loadView();
    const [group] = groupInstrumentsByLevel([
      instrument({ instrumentId: "na", name: "A", scopeLevel: "farm", status: "no_aplica" }),
      instrument({ instrumentId: "ok", name: "B", scopeLevel: "farm", status: "aplicado" }),
      instrument({ instrumentId: "pa", name: "C", scopeLevel: "farm", status: "parcial" }),
      instrument({ instrumentId: "fa", name: "D", scopeLevel: "farm", status: "falta" }),
    ]);
    expect(names(group)).toEqual(["fa", "pa", "ok", "na"]);
  });

  it("C6 — omite los niveles sin instrumentos y no muta la entrada", async () => {
    const { groupInstrumentsByLevel } = await loadView();
    const only = INSTRUMENTS.filter((i) => i.scopeLevel === "farm");
    const before = JSON.stringify(only);
    const groups = groupInstrumentsByLevel(only);
    expect(groups.map((g) => g.level)).toEqual(["farm"]);
    expect(JSON.stringify(only)).toBe(before);
    expect(groupInstrumentsByLevel([])).toEqual([]);
  });

  it("C7 — un instrumento de finca parcial lista las fincas que faltan", async () => {
    const { missingUnits } = await loadView();
    const farm = INSTRUMENTS.find((i) => i.instrumentId === "farm-partial")!;
    expect(missingUnits(farm).map((u) => u.label)).toEqual(["El Porvenir"]);
  });

  it("C7 — un instrumento de cultivo parcial lista los cultivos que faltan, por finca", async () => {
    const { missingUnits } = await loadView();
    const crop = INSTRUMENTS.find((i) => i.instrumentId === "crop-1")!;
    expect(missingUnits(crop).map((u) => u.farmCropId)).toEqual(["fc2", "fc3"]);
    expect(missingUnits(crop).map((u) => u.label)).toEqual([
      "La Esperanza · Cacao",
      "El Porvenir · Café",
    ]);
  });

  it("C7 — una unidad parcial también se lista como pendiente", async () => {
    const { missingUnits } = await loadView();
    const inst = instrument({
      instrumentId: "x",
      name: "X",
      scopeLevel: "farm",
      status: "parcial",
      units: [
        unit({ unitType: "farm", farmId: "f1", label: "Uno", status: "parcial" }),
        unit({ unitType: "farm", farmId: "f2", label: "Dos", status: "no_aplica" }),
      ],
    });
    expect(missingUnits(inst).map((u) => u.label)).toEqual(["Uno"]);
  });

  it("C7 — un instrumento aplicado o sin unidades no tiene faltantes", async () => {
    const { missingUnits } = await loadView();
    const ok = INSTRUMENTS.find((i) => i.instrumentId === "farmer-ok")!;
    expect(missingUnits(ok)).toEqual([]);
  });

  it("C9 — marca de finca inferida con texto explicativo", async () => {
    const { unitBadges } = await loadView();
    const badges = unitBadges(
      unit({ unitType: "farm", label: "La Esperanza", status: "aplicado", inferredFarm: true }),
    );
    expect(badges).toHaveLength(1);
    expect(badges[0].kind).toBe("inferredFarm");
    expect(badges[0].label).toMatch(/inferida/i);
    expect(badges[0].description.length).toBeGreaterThan(badges[0].label.length);
    expect(badges[0].description).not.toBe(badges[0].label);
  });

  it("C9 — marcas de fuera de alcance y cubierta por otro productor, con texto explicativo", async () => {
    const { unitBadges } = await loadView();
    const badges = unitBadges(
      unit({
        unitType: "farm_crop",
        label: "La Esperanza · Cáñamo",
        status: "aplicado",
        outOfScope: true,
        coveredByOtherFarmer: true,
      }),
    );
    expect(badges.map((b) => b.kind)).toEqual([
      "outOfScope",
      "coveredByOtherFarmer",
    ]);
    expect(badges[0].label).toMatch(/fuera de alcance/i);
    expect(badges[1].label).toMatch(/otro productor/i);
    for (const b of badges) {
      expect(b.description.trim()).not.toBe("");
      expect(b.description).not.toBe(b.label);
    }
  });

  it("C9 — cultivo inferido y orden estable de las marcas", async () => {
    const { unitBadges } = await loadView();
    const badges = unitBadges(
      unit({
        unitType: "farm_crop",
        label: "El Porvenir · Café",
        status: "aplicado",
        coveredByOtherFarmer: true,
        inferredCrop: true,
        inferredFarm: true,
      }),
    );
    expect(badges.map((b) => b.kind)).toEqual([
      "inferredFarm",
      "inferredCrop",
      "coveredByOtherFarmer",
    ]);
    expect(badges[1].label).toMatch(/inferido/i);
  });

  it("C9 — una unidad sin banderas no tiene marcas", async () => {
    const { unitBadges } = await loadView();
    expect(
      unitBadges(unit({ unitType: "farm", label: "X", status: "falta" })),
    ).toEqual([]);
    expect(
      unitBadges(
        unit({ unitType: "farm", label: "X", status: "falta", outOfScope: false }),
      ),
    ).toEqual([]);
  });
});
