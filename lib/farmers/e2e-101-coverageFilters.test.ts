/**
 * e2e-101 — Spec 101 «Ficha y lista de productores por cobertura»: filtros de
 * la lista `/admin/farmers` (funciones puras).
 *
 * Escrito junto con el spec, antes de la implementación: arranca EN ROJO.
 * Cubre C1–C5. El entorno de Vitest de este repositorio es `node` (sin Testing
 * Library), así que aquí solo se prueba lógica pura; lo visual vive en el
 * `test-101` manual (raíz del ecosistema).
 *
 * El import es dinámico por el mismo motivo que en `e2e-094-farmerFarms.test.ts`:
 * `tsconfig.json` incluye `**\/*.ts`, y un import estático de un módulo que aún no
 * existe rompería el typecheck del repositorio. Al implementar puede pasar a
 * import estático sin cambiar las aserciones.
 *
 * ── Contrato que `lib/farmers/coverageFilters.ts` debe exponer ─────────────
 *
 * Las filas son las de `GET /api/coverage/farmers` (spec 100, contrato 2).
 *
 * - `applyFarmerCoverageFilters(rows: FarmerCoverageRow[],
 *     filters: FarmerCoverageFilters): FarmerCoverageRow[]`
 *   Todos los filtros se combinan con AND; no muta las filas y conserva el orden.
 *   · `search`: nombre o `documentId`, sin tildes ni mayúsculas (mismo criterio
 *     que `normalizeText` de `lib/production-units/filters.ts`). Vacío = sin filtro.
 *     `documentId: null` (API key) no rompe la búsqueda.
 *   · `departmentIds` / `townIds`: sobre `primaryFarm.department` / `primaryFarm.town`.
 *     Un productor sin finca principal no pasa si el filtro está activo.
 *   · `cropIds`: pasa si algún `cropIds` del productor está en la lista.
 *   · `missingInstrumentId`: pasa si `statusByInstrument[id]` es `falta` o `parcial`.
 *   · `status`: `completo` (ningún instrumento en falta o parcial y sin aviso
 *     `sin_finca`), `con_pendientes` (al menos uno en falta o parcial),
 *     `sin_finca` (`warnings` incluye `sin_finca`).
 *   · `withOpenDiscrepancies: true`: solo `openDiscrepancies > 0`.
 *
 * - `summarizeFarmerCoverage(row: FarmerCoverageRow):
 *     { applied: number; applicable: number; pending: number; label: string }`
 *   `applied` y `applicable` vienen de `summary`; `pending` = instrumentos en
 *   falta + parciales (`summary.pending + summary.partial`); `label` = "3 de 5".
 *
 * Los tipos de abajo son locales y mínimos; la implementación los define en
 * `lib/farmers/types.ts` (o `app/(admin)/types`) con estos mismos nombres de campo.
 */
import { describe, expect, it } from "vitest";

type CoverageStatus = "aplicado" | "parcial" | "falta" | "no_aplica";
type FarmerWarning = "sin_finca" | "sin_cultivo" | "encuestas_sin_ubicar";

interface FarmerCoverageRow {
  farmerId: string;
  name: string;
  documentId: string | null;
  primaryFarm: {
    farmId: string;
    name: string;
    town: { townId: string; name: string } | null;
    department: { departmentId: string; name: string } | null;
  } | null;
  farmsCount: number;
  cropIds: string[];
  hasPendingConsent: boolean;
  openDiscrepancies: number;
  summary: {
    applicable: number;
    applied: number;
    partial: number;
    pending: number;
    notApplicable: number;
    instrumentsWithoutScope: number;
  };
  statusByInstrument: Record<string, CoverageStatus>;
  warnings: FarmerWarning[];
}

interface FarmerCoverageFilters {
  search?: string;
  departmentIds?: string[];
  townIds?: string[];
  cropIds?: string[];
  missingInstrumentId?: string | null;
  status?: "completo" | "con_pendientes" | "sin_finca" | null;
  withOpenDiscrepancies?: boolean;
}

interface CoverageFiltersModule {
  applyFarmerCoverageFilters(
    rows: FarmerCoverageRow[],
    filters: FarmerCoverageFilters,
  ): FarmerCoverageRow[];
  summarizeFarmerCoverage(row: FarmerCoverageRow): {
    applied: number;
    applicable: number;
    pending: number;
    label: string;
  };
}

async function loadFilters(): Promise<CoverageFiltersModule> {
  const specifier = "./coverageFilters";
  return (await import(/* @vite-ignore */ specifier)) as CoverageFiltersModule;
}

const ANTIOQUIA = { departmentId: "d-ant", name: "Antioquia" };
const CAQUETA = { departmentId: "d-caq", name: "Caquetá" };

function summary(
  statuses: Record<string, CoverageStatus>,
): FarmerCoverageRow["summary"] {
  const values = Object.values(statuses);
  const count = (s: CoverageStatus) => values.filter((v) => v === s).length;
  return {
    applicable: values.length - count("no_aplica"),
    applied: count("aplicado"),
    partial: count("parcial"),
    pending: count("falta"),
    notApplicable: count("no_aplica"),
    instrumentsWithoutScope: 0,
  };
}

function row(
  partial: Partial<FarmerCoverageRow> &
    Pick<FarmerCoverageRow, "farmerId" | "name" | "statusByInstrument">,
): FarmerCoverageRow {
  return {
    documentId: null,
    primaryFarm: null,
    farmsCount: 0,
    cropIds: [],
    hasPendingConsent: false,
    openDiscrepancies: 0,
    warnings: [],
    summary: summary(partial.statusByInstrument),
    ...partial,
  };
}

const ROWS: FarmerCoverageRow[] = [
  row({
    farmerId: "a",
    name: "José Ramírez",
    documentId: "1001",
    primaryFarm: {
      farmId: "f-a",
      name: "La Esperanza",
      town: { townId: "t-andes", name: "Andes" },
      department: ANTIOQUIA,
    },
    farmsCount: 1,
    cropIds: ["c-cafe"],
    statusByInstrument: { i1: "aplicado", i2: "aplicado", i3: "no_aplica" },
  }),
  row({
    farmerId: "b",
    name: "María Gómez",
    documentId: "2002",
    primaryFarm: {
      farmId: "f-b",
      name: "El Porvenir",
      town: { townId: "t-jardin", name: "Jardín" },
      department: ANTIOQUIA,
    },
    farmsCount: 2,
    cropIds: ["c-cafe", "c-cacao"],
    openDiscrepancies: 2,
    statusByInstrument: { i1: "parcial", i2: "aplicado", i3: "aplicado" },
  }),
  row({
    farmerId: "c",
    name: "Ángela Muñoz",
    documentId: "3003",
    primaryFarm: {
      farmId: "f-c",
      name: "Villa Nueva",
      town: { townId: "t-florencia", name: "Florencia" },
      department: CAQUETA,
    },
    farmsCount: 1,
    cropIds: ["c-cacao"],
    statusByInstrument: { i1: "falta", i2: "falta", i3: "aplicado" },
  }),
  row({
    farmerId: "d",
    name: "Pedro Sin Finca",
    documentId: null,
    warnings: ["sin_finca"],
    openDiscrepancies: 1,
    statusByInstrument: { i1: "no_aplica", i2: "falta", i3: "no_aplica" },
  }),
];

const ids = (rows: FarmerCoverageRow[]) => rows.map((r) => r.farmerId);

describe("Spec 101 — filtros de la lista de productores por cobertura", () => {
  it("sin filtros devuelve todas las filas, en el mismo orden y sin mutarlas", async () => {
    const { applyFarmerCoverageFilters } = await loadFilters();
    const before = JSON.stringify(ROWS);
    expect(ids(applyFarmerCoverageFilters(ROWS, {}))).toEqual([
      "a",
      "b",
      "c",
      "d",
    ]);
    expect(JSON.stringify(ROWS)).toBe(before);
  });

  it("C1 — resume aplicados/aplicables y pendientes de cada fila", async () => {
    const { summarizeFarmerCoverage } = await loadFilters();
    expect(summarizeFarmerCoverage(ROWS[0])).toEqual({
      applied: 2,
      applicable: 2,
      pending: 0,
      label: "2 de 2",
    });
    // b: un parcial cuenta como pendiente.
    expect(summarizeFarmerCoverage(ROWS[1])).toMatchObject({
      applied: 2,
      applicable: 3,
      pending: 1,
      label: "2 de 3",
    });
    expect(summarizeFarmerCoverage(ROWS[2])).toMatchObject({
      applied: 1,
      applicable: 3,
      pending: 2,
    });
  });

  it("C2 — «le falta el instrumento X» incluye falta y parcial, no aplicado ni no aplica", async () => {
    const { applyFarmerCoverageFilters } = await loadFilters();
    expect(
      ids(applyFarmerCoverageFilters(ROWS, { missingInstrumentId: "i1" })),
    ).toEqual(["b", "c"]);
    expect(
      ids(applyFarmerCoverageFilters(ROWS, { missingInstrumentId: "i2" })),
    ).toEqual(["c", "d"]);
    expect(
      ids(applyFarmerCoverageFilters(ROWS, { missingInstrumentId: null })),
    ).toHaveLength(4);
  });

  it("C3 — departamento, municipio y cultivo se combinan con AND", async () => {
    const { applyFarmerCoverageFilters } = await loadFilters();
    expect(
      ids(applyFarmerCoverageFilters(ROWS, { departmentIds: ["d-ant"] })),
    ).toEqual(["a", "b"]);
    expect(
      ids(applyFarmerCoverageFilters(ROWS, { townIds: ["t-florencia"] })),
    ).toEqual(["c"]);
    expect(
      ids(applyFarmerCoverageFilters(ROWS, { cropIds: ["c-cacao"] })),
    ).toEqual(["b", "c"]);
    expect(
      ids(
        applyFarmerCoverageFilters(ROWS, {
          departmentIds: ["d-ant"],
          cropIds: ["c-cacao"],
        }),
      ),
    ).toEqual(["b"]);
    expect(
      ids(
        applyFarmerCoverageFilters(ROWS, {
          townIds: ["t-andes"],
          cropIds: ["c-cacao"],
        }),
      ),
    ).toEqual([]);
  });

  it("C3 — un productor sin finca principal no pasa un filtro de ubicación", async () => {
    const { applyFarmerCoverageFilters } = await loadFilters();
    const rows = applyFarmerCoverageFilters(ROWS, {
      departmentIds: ["d-ant", "d-caq"],
    });
    expect(ids(rows)).not.toContain("d");
  });

  it("C3 — la búsqueda por nombre ignora tildes y mayúsculas", async () => {
    const { applyFarmerCoverageFilters } = await loadFilters();
    expect(ids(applyFarmerCoverageFilters(ROWS, { search: "angela" }))).toEqual(
      ["c"],
    );
    expect(ids(applyFarmerCoverageFilters(ROWS, { search: "JOSÉ" }))).toEqual([
      "a",
    ]);
    expect(
      ids(applyFarmerCoverageFilters(ROWS, { search: "  munoz " })),
    ).toEqual(["c"]);
    expect(ids(applyFarmerCoverageFilters(ROWS, { search: "" }))).toHaveLength(
      4,
    );
  });

  it("C3 — la búsqueda también encuentra por documento y tolera documentId nulo", async () => {
    const { applyFarmerCoverageFilters } = await loadFilters();
    expect(ids(applyFarmerCoverageFilters(ROWS, { search: "2002" }))).toEqual([
      "b",
    ]);
    expect(() =>
      applyFarmerCoverageFilters(ROWS, { search: "pedro" }),
    ).not.toThrow();
    expect(ids(applyFarmerCoverageFilters(ROWS, { search: "pedro" }))).toEqual(
      ["d"],
    );
  });

  it("C3 — la búsqueda se combina con los filtros de ubicación y cultivo", async () => {
    const { applyFarmerCoverageFilters } = await loadFilters();
    expect(
      ids(
        applyFarmerCoverageFilters(ROWS, {
          search: "maria",
          departmentIds: ["d-ant"],
          cropIds: ["c-cafe"],
        }),
      ),
    ).toEqual(["b"]);
    expect(
      ids(
        applyFarmerCoverageFilters(ROWS, {
          search: "maria",
          departmentIds: ["d-caq"],
        }),
      ),
    ).toEqual([]);
  });

  it("C4 — «sin finca» muestra solo productores con el aviso sin_finca", async () => {
    const { applyFarmerCoverageFilters } = await loadFilters();
    expect(
      ids(applyFarmerCoverageFilters(ROWS, { status: "sin_finca" })),
    ).toEqual(["d"]);
  });

  it("estado «completo» y «con pendientes»", async () => {
    const { applyFarmerCoverageFilters } = await loadFilters();
    expect(
      ids(applyFarmerCoverageFilters(ROWS, { status: "completo" })),
    ).toEqual(["a"]);
    expect(
      ids(applyFarmerCoverageFilters(ROWS, { status: "con_pendientes" })),
    ).toEqual(["b", "c", "d"]);
  });

  it("C5 — «con diferencias abiertas» muestra solo openDiscrepancies > 0", async () => {
    const { applyFarmerCoverageFilters } = await loadFilters();
    expect(
      ids(applyFarmerCoverageFilters(ROWS, { withOpenDiscrepancies: true })),
    ).toEqual(["b", "d"]);
    expect(
      ids(applyFarmerCoverageFilters(ROWS, { withOpenDiscrepancies: false })),
    ).toHaveLength(4);
  });

  it("C2 + C5 — los filtros de cobertura se combinan con el resto", async () => {
    const { applyFarmerCoverageFilters } = await loadFilters();
    expect(
      ids(
        applyFarmerCoverageFilters(ROWS, {
          missingInstrumentId: "i2",
          withOpenDiscrepancies: true,
        }),
      ),
    ).toEqual(["d"]);
  });
});
