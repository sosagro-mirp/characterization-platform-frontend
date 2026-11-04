/**
 * e2e-098 — Spec 98 «Exploración de unidades productivas»: filtros de la vista.
 *
 * Escrito junto con el spec, antes de la implementación: arranca EN ROJO.
 * Cubre C10. El entorno de Vitest de este repositorio es `node` (sin Testing
 * Library), así que aquí solo se prueba lógica pura; lo visual vive en el
 * `test-098` manual.
 *
 * El import es dinámico por el mismo motivo que en `e2e-094-farmerFarms.test.ts`:
 * `tsconfig.json` incluye `**\/*.ts`, y un import estático de un módulo que aún no
 * existe rompería el typecheck del repositorio.
 */
import { describe, expect, it } from "vitest";

type CoverageStatus = "aplicado" | "parcial" | "falta" | "no_aplica";

interface UnitRow {
  farmId: string;
  name: string;
  department: { departmentId: string; name: string } | null;
  town: { townId: string; name: string } | null;
  crops: { cropId: string; name: string }[];
  coverage: Record<string, { status: CoverageStatus }>;
}

interface UnitFilters {
  departmentIds?: string[];
  townIds?: string[];
  cropIds?: string[];
  instrument?: { instrumentId: string; statuses: CoverageStatus[] } | null;
  columns?: Record<string, string>;
}

interface FiltersModule {
  applyUnitFilters(rows: UnitRow[], filters: UnitFilters): UnitRow[];
}

async function loadFilters(): Promise<FiltersModule> {
  const specifier = "./filters";
  return (await import(/* @vite-ignore */ specifier)) as FiltersModule;
}

const ANTIOQUIA = { departmentId: "d-ant", name: "Antioquia" };
const CAQUETA = { departmentId: "d-caq", name: "Caquetá" };
const CAFE = { cropId: "c-cafe", name: "Café" };
const CACAO = { cropId: "c-cacao", name: "Cacao" };

const ROWS: UnitRow[] = [
  {
    farmId: "a",
    name: "La Esperanza",
    department: ANTIOQUIA,
    town: { townId: "t-andes", name: "Andes" },
    crops: [CAFE],
    coverage: { i1: { status: "aplicado" } },
  },
  {
    farmId: "b",
    name: "El Porvenir",
    department: ANTIOQUIA,
    town: { townId: "t-jardin", name: "Jardín" },
    crops: [CAFE, CACAO],
    coverage: { i1: { status: "parcial" } },
  },
  {
    farmId: "c",
    name: "Villa Nueva",
    department: CAQUETA,
    town: { townId: "t-florencia", name: "Florencia" },
    crops: [CACAO],
    coverage: { i1: { status: "falta" } },
  },
  {
    farmId: "d",
    name: "Sin ubicación",
    department: null,
    town: null,
    crops: [],
    coverage: { i1: { status: "no_aplica" } },
  },
];

const ids = (rows: UnitRow[]) => rows.map((r) => r.farmId);

describe("Spec 98 — filtros de unidades productivas", () => {
  it("sin filtros devuelve todas las filas", async () => {
    const { applyUnitFilters } = await loadFilters();
    expect(ids(applyUnitFilters(ROWS, {}))).toEqual(["a", "b", "c", "d"]);
  });

  it("filtra por departamento y municipio", async () => {
    const { applyUnitFilters } = await loadFilters();
    expect(ids(applyUnitFilters(ROWS, { departmentIds: ["d-ant"] }))).toEqual([
      "a",
      "b",
    ]);
    expect(ids(applyUnitFilters(ROWS, { townIds: ["t-jardin"] }))).toEqual([
      "b",
    ]);
  });

  it("una finca con dos cultivos aparece al filtrar por cualquiera", async () => {
    const { applyUnitFilters } = await loadFilters();
    expect(ids(applyUnitFilters(ROWS, { cropIds: ["c-cacao"] }))).toEqual([
      "b",
      "c",
    ]);
  });

  it("filtra por instrumento y uno o más estados", async () => {
    const { applyUnitFilters } = await loadFilters();
    const rows = applyUnitFilters(ROWS, {
      instrument: { instrumentId: "i1", statuses: ["falta", "parcial"] },
    });
    expect(ids(rows)).toEqual(["b", "c"]);
  });

  it("los filtros se combinan", async () => {
    const { applyUnitFilters } = await loadFilters();
    const rows = applyUnitFilters(ROWS, {
      departmentIds: ["d-ant"],
      cropIds: ["c-cacao"],
      instrument: { instrumentId: "i1", statuses: ["parcial"] },
    });
    expect(ids(rows)).toEqual(["b"]);
  });

  it("el filtro de columna ignora mayúsculas y tildes", async () => {
    const { applyUnitFilters } = await loadFilters();
    expect(
      ids(applyUnitFilters(ROWS, { columns: { town: "jardin" } })),
    ).toEqual(["b"]);
    expect(
      ids(applyUnitFilters(ROWS, { columns: { name: "ESPERANZA" } })),
    ).toEqual(["a"]);
  });

  it("no modifica las filas de entrada", async () => {
    const { applyUnitFilters } = await loadFilters();
    const before = JSON.stringify(ROWS);
    applyUnitFilters(ROWS, { departmentIds: ["d-ant"] });
    expect(JSON.stringify(ROWS)).toBe(before);
  });
});
