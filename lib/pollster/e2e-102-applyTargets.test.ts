/**
 * e2e-102 — Spec 102 «Flujo del encuestador por productor en la web» (H7):
 * acciones de aplicar desde la ficha del encuestador (funciones puras).
 *
 * Escrito junto con el spec, antes de la implementación: arranca EN ROJO.
 * Cubre C5 y C8. Lo visual (botones, diálogo) vive en el `test-102` manual.
 *
 * Import dinámico por el mismo motivo que en `e2e-094-farmerFarms.test.ts`.
 *
 * ── Contrato que `lib/pollster/applyTargets.ts` debe exponer ──────────────
 *
 * - `listApplyTargets(detail: FarmerCoverageDetail): ApplyTarget[]`
 *   Una acción por unidad de cobertura aplicable. Se excluyen los
 *   instrumentos en `no_aplica`, las unidades en `no_aplica` y las unidades
 *   con `outOfScope`. Cada `ApplyTarget` trae:
 *     instrumentId, instrumentName, scopeLevel,
 *     farmId (null en nivel productor), farmCropId (null salvo nivel cultivo),
 *     label (la de la unidad),
 *     status: "falta" | "parcial" | "aplicado" (el de la unidad),
 *     requiresReapplyConfirm (true si la unidad está «aplicado»),
 *     lastAppliedAt (createdAt de `latestSurvey` del instrumento si la unidad
 *       está aplicada; null si no),
 *     coveredByOtherFarmer (bandera de la unidad; false si no viene).
 *   Orden: primero las unidades pendientes (`falta`, `parcial`) y después las
 *   aplicadas; a igual grupo, por nombre del instrumento (`localeCompare`
 *   «es») y luego por el orden de `units`. No muta la entrada.
 *
 * - `reapplyConfirmationText(target: ApplyTarget): string`
 *   Nombra el instrumento y la fecha de la última encuesta en formato
 *   dd/mm/aaaa. Si `coveredByOtherFarmer`, advierte que la aplicó otro
 *   productor (menciona «otro productor»). Sin fecha, no inventa una.
 */
import { describe, expect, it } from "vitest";

type Status = "aplicado" | "parcial" | "falta" | "no_aplica";
type Level = "farmer" | "farm" | "farm_crop";

interface Unit {
  unitType: Level;
  farmId?: string;
  farmCropId?: string;
  label: string;
  status: Status;
  surveyId: string | null;
  surveyCount: number;
  outOfScope?: boolean;
  coveredByOtherFarmer?: boolean;
}

interface Instrument {
  instrumentId: string;
  name: string;
  code: string | null;
  scopeLevel: Level;
  cropIds: string[];
  coverageGroup: string | null;
  memberIds: string[];
  status: Status;
  surveyCount: number;
  latestSurvey: { surveyId: string; createdAt: string } | null;
  units: Unit[];
}

interface Detail {
  farmerId: string;
  name: string;
  instruments: Instrument[];
  [key: string]: unknown;
}

interface ApplyTarget {
  instrumentId: string;
  instrumentName: string;
  scopeLevel: Level;
  farmId: string | null;
  farmCropId: string | null;
  label: string;
  status: "falta" | "parcial" | "aplicado";
  requiresReapplyConfirm: boolean;
  lastAppliedAt: string | null;
  coveredByOtherFarmer: boolean;
}

interface ApplyTargetsModule {
  listApplyTargets(detail: Detail): ApplyTarget[];
  reapplyConfirmationText(target: ApplyTarget): string;
}

async function load(): Promise<ApplyTargetsModule> {
  const specifier = "./applyTargets";
  return (await import(/* @vite-ignore */ specifier)) as ApplyTargetsModule;
}

function instrument(partial: Partial<Instrument>): Instrument {
  return {
    instrumentId: "i-x",
    name: "X",
    code: null,
    scopeLevel: "farmer",
    cropIds: [],
    coverageGroup: null,
    memberIds: [],
    status: "falta",
    surveyCount: 0,
    latestSurvey: null,
    units: [],
    ...partial,
  };
}

function detail(instruments: Instrument[]): Detail {
  return {
    farmerId: "farmer-1",
    name: "Ana Pérez",
    computedAt: "2026-11-07T10:00:00.000Z",
    summary: {},
    farms: [],
    warnings: [],
    unlocatedSurveys: [],
    unsyncedWithResponses: 0,
    instruments,
  };
}

const REGISTRO = instrument({
  instrumentId: "i-reg",
  name: "Registro del productor",
  scopeLevel: "farmer",
  status: "aplicado",
  surveyCount: 1,
  latestSurvey: { surveyId: "s-reg", createdAt: "2026-09-17T15:00:00.000Z" },
  units: [
    {
      unitType: "farmer",
      label: "Ana Pérez",
      status: "aplicado",
      surveyId: "s-reg",
      surveyCount: 1,
    },
  ],
});

const FINCA = instrument({
  instrumentId: "i-finca",
  name: "Información de la finca",
  scopeLevel: "farm",
  status: "parcial",
  surveyCount: 1,
  latestSurvey: { surveyId: "s-f1", createdAt: "2026-10-02T15:00:00.000Z" },
  units: [
    {
      unitType: "farm",
      farmId: "farm-1",
      label: "La Soledad · Andes",
      status: "aplicado",
      surveyId: "s-f1",
      surveyCount: 1,
      coveredByOtherFarmer: true,
    },
    {
      unitType: "farm",
      farmId: "farm-2",
      label: "El Retiro · Jardín",
      status: "falta",
      surveyId: null,
      surveyCount: 0,
    },
  ],
});

const CULTIVO = instrument({
  instrumentId: "i-cult",
  name: "Atributos del cultivo",
  scopeLevel: "farm_crop",
  status: "falta",
  units: [
    {
      unitType: "farm_crop",
      farmId: "farm-1",
      farmCropId: "fc-1",
      label: "Café · La Soledad",
      status: "falta",
      surveyId: null,
      surveyCount: 0,
    },
    {
      unitType: "farm_crop",
      farmId: "farm-1",
      farmCropId: "fc-2",
      label: "Cacao · La Soledad",
      status: "no_aplica",
      surveyId: null,
      surveyCount: 0,
      outOfScope: true,
    },
  ],
});

const NO_APLICA = instrument({
  instrumentId: "i-na",
  name: "Cannabis — licencias",
  scopeLevel: "farm",
  status: "no_aplica",
  units: [],
});

describe("Spec 102 — acciones de aplicar en la ficha del encuestador", () => {
  it("C5 — una acción por unidad aplicable, con el ancla de su nivel", async () => {
    const { listApplyTargets } = await load();
    const targets = listApplyTargets(detail([REGISTRO, FINCA, CULTIVO]));
    const keys = targets.map((t) => [
      t.instrumentId,
      t.farmId,
      t.farmCropId,
    ]);
    expect(keys).toEqual(
      expect.arrayContaining([
        ["i-reg", null, null],
        ["i-finca", "farm-1", null],
        ["i-finca", "farm-2", null],
        ["i-cult", "farm-1", "fc-1"],
      ]),
    );
    expect(targets).toHaveLength(4);
  });

  it("C5 — sin acción para instrumentos que no aplican ni unidades fuera de alcance", async () => {
    const { listApplyTargets } = await load();
    const targets = listApplyTargets(detail([CULTIVO, NO_APLICA]));
    expect(targets.map((t) => t.farmCropId)).toEqual(["fc-1"]);
    expect(targets.some((t) => t.instrumentId === "i-na")).toBe(false);
  });

  it("C5 — los pendientes van primero, luego los aplicados", async () => {
    const { listApplyTargets } = await load();
    const targets = listApplyTargets(detail([REGISTRO, FINCA, CULTIVO]));
    const statuses = targets.map((t) => t.status);
    const firstApplied = statuses.indexOf("aplicado");
    expect(firstApplied).toBeGreaterThan(0);
    expect(statuses.slice(firstApplied).every((s) => s === "aplicado")).toBe(
      true,
    );
    // Pendientes por nombre de instrumento: «Atributos…» antes que «Información…».
    expect(targets[0]).toMatchObject({ instrumentId: "i-cult", farmCropId: "fc-1" });
    expect(targets[1]).toMatchObject({ instrumentId: "i-finca", farmId: "farm-2" });
  });

  it("C8 — una unidad aplicada pide confirmación y trae la fecha", async () => {
    const { listApplyTargets } = await load();
    const targets = listApplyTargets(detail([REGISTRO, FINCA]));
    const reg = targets.find((t) => t.instrumentId === "i-reg");
    expect(reg).toMatchObject({
      status: "aplicado",
      requiresReapplyConfirm: true,
      lastAppliedAt: "2026-09-17T15:00:00.000Z",
      coveredByOtherFarmer: false,
    });
    const pending = targets.find((t) => t.farmId === "farm-2");
    expect(pending).toMatchObject({
      requiresReapplyConfirm: false,
      lastAppliedAt: null,
    });
  });

  it("no muta el detalle de cobertura", async () => {
    const { listApplyTargets } = await load();
    const input = detail([FINCA, CULTIVO]);
    const snapshot = JSON.stringify(input);
    listApplyTargets(input);
    expect(JSON.stringify(input)).toBe(snapshot);
  });

  it("C8 — la confirmación nombra el instrumento y la fecha dd/mm/aaaa", async () => {
    const { listApplyTargets, reapplyConfirmationText } = await load();
    const reg = listApplyTargets(detail([REGISTRO])).find(
      (t) => t.instrumentId === "i-reg",
    )!;
    const text = reapplyConfirmationText(reg);
    expect(text).toContain("Registro del productor");
    expect(text).toContain("17/09/2026");
    expect(text).not.toMatch(/otro productor/i);
  });

  it("C8 — finca cubierta por otro productor: la confirmación lo advierte", async () => {
    const { listApplyTargets, reapplyConfirmationText } = await load();
    const shared = listApplyTargets(detail([FINCA])).find(
      (t) => t.farmId === "farm-1",
    )!;
    expect(shared.coveredByOtherFarmer).toBe(true);
    const text = reapplyConfirmationText(shared);
    expect(text).toMatch(/otro productor/i);
    expect(text).toContain("02/10/2026");
  });
});
