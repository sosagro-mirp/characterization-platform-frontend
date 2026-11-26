/**
 * e2e-112 — Spec 112 «Avance de cobertura»: agregación pura de la vista.
 *
 * Escrito junto con el spec, antes de la implementación: arranca EN ROJO.
 * Cubre C09–C11. Lo visual vive en el `test-112` manual.
 *
 * `AGGREGATION_CASES` es copia literal de la tabla de
 * `backend/src/coverage/e2e-112-coverage-progress.spec.ts`: las dos copias de
 * `summarizeProgress` deben dar los mismos números. Si se cambia una, se cambia
 * la otra.
 *
 * Import dinámico por el mismo motivo que en `e2e-098-filters.test.ts`.
 */
import { describe, expect, it } from "vitest";

type CoverageStatus = "aplicado" | "parcial" | "falta" | "no_aplica";

interface CoverageCell {
  status: CoverageStatus;
  possible?: number;
  done?: number;
  cropUnits?: { farmCropId: string; cropId: string; covered: boolean }[];
}

interface Progress {
  done: number;
  possible: number;
  percent: number | null;
}

interface ProgressRow {
  farmId: string;
  coverage: Record<string, CoverageCell>;
}

interface ProgressSummary {
  global: Progress;
  byColumn: Record<string, Progress>;
  byRow: Record<string, Progress>;
}

interface ProgressModule {
  summarizeProgress(
    rows: ProgressRow[],
    columnIds: string[],
    options?: { cropIds?: string[] },
  ): ProgressSummary;
  formatProgress(p: Progress): string;
}

interface FiltersModule {
  applyUnitFilters<T>(rows: T[], filters: Record<string, unknown>): T[];
}

async function loadProgress(): Promise<ProgressModule> {
  const specifier = "./progress";
  return (await import(/* @vite-ignore */ specifier)) as ProgressModule;
}

async function loadFilters(): Promise<FiltersModule> {
  const specifier = "./filters";
  return (await import(/* @vite-ignore */ specifier)) as FiltersModule;
}

const CAFE = "crop-cafe";
const CACAO = "crop-cacao";

const AGGREGATION_CASES: {
  name: string;
  rows: ProgressRow[];
  columns: string[];
  cropIds?: string[];
  expected: ProgressSummary;
}[] = [
  {
    name: "suma contadores, no promedia porcentajes; no_aplica se omite",
    columns: ["reg", "cult"],
    rows: [
      {
        farmId: "a",
        coverage: {
          reg: { status: "aplicado", possible: 1, done: 1 },
          cult: {
            status: "parcial",
            possible: 2,
            done: 1,
            cropUnits: [
              { farmCropId: "a-cafe", cropId: CAFE, covered: true },
              { farmCropId: "a-cacao", cropId: CACAO, covered: false },
            ],
          },
        },
      },
      {
        farmId: "b",
        coverage: {
          reg: { status: "falta", possible: 2, done: 0 },
          cult: { status: "no_aplica", possible: 0, done: 0, cropUnits: [] },
        },
      },
    ],
    expected: {
      global: { done: 2, possible: 5, percent: 0.4 },
      byColumn: {
        reg: { done: 1, possible: 3, percent: 1 / 3 },
        cult: { done: 1, possible: 2, percent: 0.5 },
      },
      byRow: {
        a: { done: 2, possible: 3, percent: 2 / 3 },
        b: { done: 0, possible: 2, percent: 0 },
      },
    },
  },
  {
    name: "filtro de cultivo: farm_crop cuenta solo los cultivos filtrados",
    columns: ["reg", "cult"],
    cropIds: [CACAO],
    rows: [
      {
        farmId: "a",
        coverage: {
          reg: { status: "aplicado", possible: 1, done: 1 },
          cult: {
            status: "parcial",
            possible: 2,
            done: 1,
            cropUnits: [
              { farmCropId: "a-cafe", cropId: CAFE, covered: true },
              { farmCropId: "a-cacao", cropId: CACAO, covered: false },
            ],
          },
        },
      },
    ],
    expected: {
      global: { done: 1, possible: 2, percent: 0.5 },
      byColumn: {
        reg: { done: 1, possible: 1, percent: 1 },
        cult: { done: 0, possible: 1, percent: 0 },
      },
      byRow: { a: { done: 1, possible: 2, percent: 0.5 } },
    },
  },
  {
    name: "sin posibles: percent null, nunca 0 ni 1",
    columns: ["cult"],
    rows: [
      {
        farmId: "a",
        coverage: {
          cult: { status: "no_aplica", possible: 0, done: 0, cropUnits: [] },
        },
      },
    ],
    expected: {
      global: { done: 0, possible: 0, percent: null },
      byColumn: { cult: { done: 0, possible: 0, percent: null } },
      byRow: { a: { done: 0, possible: 0, percent: null } },
    },
  },
];

function expectProgress(actual: Progress, expected: Progress) {
  expect(actual.done).toBe(expected.done);
  expect(actual.possible).toBe(expected.possible);
  if (expected.percent === null) expect(actual.percent).toBeNull();
  else expect(actual.percent).toBeCloseTo(expected.percent);
}

describe("e2e-112 — summarizeProgress (C10, C11)", () => {
  it.each(AGGREGATION_CASES.map((c) => [c.name, c] as const))(
    "%s",
    async (_name, c) => {
      const { summarizeProgress } = await loadProgress();
      const result = summarizeProgress(c.rows, c.columns, {
        cropIds: c.cropIds,
      });
      expectProgress(result.global, c.expected.global);
      for (const [id, p] of Object.entries(c.expected.byColumn)) {
        expectProgress(result.byColumn[id], p);
      }
      for (const [id, p] of Object.entries(c.expected.byRow)) {
        expectProgress(result.byRow[id], p);
      }
    },
  );

  it("C11 — sin posibles se muestra «—»", async () => {
    const { formatProgress } = await loadProgress();
    expect(formatProgress({ done: 0, possible: 0, percent: null })).toBe("—");
    expect(formatProgress({ done: 1, possible: 2, percent: 0.5 })).toContain(
      "50",
    );
  });
});

describe("e2e-112 — el avance sigue a los filtros (C09)", () => {
  const rows = [
    {
      farmId: "a",
      name: "A",
      department: { departmentId: "ant", name: "Antioquia" },
      town: null,
      crops: [{ cropId: CAFE, name: "Café" }],
      coverage: { reg: { status: "aplicado" as const, possible: 1, done: 1 } },
    },
    {
      farmId: "b",
      name: "B",
      department: { departmentId: "caq", name: "Caquetá" },
      town: null,
      crops: [{ cropId: CACAO, name: "Cacao" }],
      coverage: { reg: { status: "falta" as const, possible: 1, done: 0 } },
    },
  ];

  it("filtrar por departamento recalcula el global", async () => {
    const { summarizeProgress } = await loadProgress();
    const { applyUnitFilters } = await loadFilters();
    expect(summarizeProgress(rows, ["reg"]).global.percent).toBeCloseTo(0.5);
    const antioquia = applyUnitFilters(rows, { departmentIds: ["ant"] });
    expect(summarizeProgress(antioquia, ["reg"]).global.percent).toBe(1);
    const caqueta = applyUnitFilters(rows, { departmentIds: ["caq"] });
    expect(summarizeProgress(caqueta, ["reg"]).global.percent).toBe(0);
  });
});
