/**
 * e2e-099 — Spec 99 «Selección de las 40 unidades»: lógica pura de la vista.
 *
 * Escrito junto con el spec, antes de la implementación: arranca EN ROJO.
 * Cubre C07, C08 y C09. Lo visual vive en el `test-099` manual.
 *
 * Import dinámico por el mismo motivo que en `e2e-098-filters.test.ts`.
 */
import { describe, expect, it } from "vitest";
import {
  isDeletionBlocked,
  summarizeDeletionPreview,
  type FarmerDeletionPreview,
} from "@/lib/farmers/cascadeDeletion";

type SelectionStatus = "included" | "excluded" | "in_review";
type CoverageStatus = "aplicado" | "parcial" | "falta" | "no_aplica";

interface Row {
  farmId: string;
  selection: { status: SelectionStatus } | null;
  coverage: Record<string, { status: CoverageStatus }>;
}

interface SelectionModule {
  filterBySelection(rows: Row[], statuses: (SelectionStatus | "none")[]): Row[];
  overTarget(included: number, target: number): boolean;
  missingInstruments(row: Row): string[];
}

async function loadSelection(): Promise<SelectionModule> {
  const specifier = "./selection";
  return (await import(/* @vite-ignore */ specifier)) as SelectionModule;
}

const ROWS: Row[] = [
  {
    farmId: "a",
    selection: { status: "included" },
    coverage: { i1: { status: "aplicado" } },
  },
  {
    farmId: "b",
    selection: { status: "excluded" },
    coverage: { i1: { status: "falta" } },
  },
  {
    farmId: "c",
    selection: { status: "in_review" },
    coverage: { i1: { status: "parcial" } },
  },
  {
    farmId: "d",
    selection: null,
    coverage: { i1: { status: "no_aplica" }, i2: { status: "falta" } },
  },
];

describe("Spec 99 — selección", () => {
  it("C09 — filtra por decisión", async () => {
    const { filterBySelection } = await loadSelection();
    const ids = filterBySelection(ROWS, ["included", "in_review"]).map(
      (r) => r.farmId,
    );
    expect(ids).toEqual(["a", "c"]);
  });

  it("C09 — filtra las fincas sin decisión", async () => {
    const { filterBySelection } = await loadSelection();
    expect(filterBySelection(ROWS, ["none"]).map((r) => r.farmId)).toEqual([
      "d",
    ]);
  });

  it("C07 — la meta avisa solo al superarla", async () => {
    const { overTarget } = await loadSelection();
    expect(overTarget(40, 40)).toBe(false);
    expect(overTarget(41, 40)).toBe(true);
  });

  it("C08 — lista lo que falta, sin contar lo que no aplica", async () => {
    const { missingInstruments } = await loadSelection();
    expect(missingInstruments(ROWS[3])).toEqual(["i2"]);
    expect(missingInstruments(ROWS[0])).toEqual([]);
  });

  it("C08 — parcial también advierte", async () => {
    const { missingInstruments } = await loadSelection();
    expect(missingInstruments(ROWS[2])).toEqual(["i1"]);
  });
});

describe("C11 — vista previa del borrado con decisiones de selección", () => {
  const baseFarm = {
    farmId: "f1",
    name: "La Esperanza",
    willBeDeleted: true,
  };
  const preview = (farms: object[]) =>
    ({
      name: "Productor",
      documentId: "123",
      farm: null,
      farms,
      counts: {
        campaignSessions: 0,
        surveys: 0,
        responses: 0,
        documentCollisions: 0,
        relations: 0,
        consentRecords: 0,
      },
      preserved: { changeRequests: 0 },
    }) as unknown as FarmerDeletionPreview;

  it("bloquea y lo explica cuando una finca tiene decisiones", () => {
    const blocked = preview([{ ...baseFarm, blockedBy: "selection" }]);
    expect(isDeletionBlocked(blocked)).toBe(true);
    expect(summarizeDeletionPreview(blocked)).toEqual([
      'La finca "La Esperanza" tiene decisiones de selección de unidades productivas: no se puede borrar.',
    ]);
  });

  it("no bloquea una finca sin decisiones", () => {
    const free = preview([baseFarm]);
    expect(isDeletionBlocked(free)).toBe(false);
    expect(summarizeDeletionPreview(free)).toEqual([
      'La finca "La Esperanza" se eliminará (no la comparte ningún otro agricultor).',
    ]);
  });
});
