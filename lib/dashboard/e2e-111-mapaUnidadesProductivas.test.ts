/**
 * e2e-111 — Spec 111 «Mapa de unidades productivas por departamento», frontend.
 * `spec/111_mapa_unidades_productivas_por_departamento.md` (raíz del ecosistema),
 * Fase 2. Cubre la parte automatizable de C7–C11; la verificación visual (zoom,
 * patrón de la celda suprimida, foco por teclado, VoiceOver, temas) vive en
 * `docs/testing/test-111-mapa-unidades-productivas-por-departamento.md`.
 *
 * Escrito junto con el spec, antes de la implementación: arranca EN ROJO. La
 * causa del rojo es el import de `./departmentMap`, que todavía no existe (falla
 * la carga del archivo completo), y de `MAP_SEQUENTIAL_RAMP` en `./palette`.
 *
 * El entorno de Vitest es `node` (ver `vitest.config.ts`): solo lógica pura, sin
 * React. `DepartmentMap.tsx` consume este módulo; `ServedChartFactory.tsx` le
 * pasa la fuente del gráfico (`sourceKind` + `metricKey`) para la unidad.
 *
 * Decisiones aplicadas (resueltas el 2026-11-24): A1 (texto de la celda
 * suprimida y nota de la leyenda), A2 (todos los mapas; unidad según la
 * fuente), A3 (fuera del proyecto con datos: gris, fuera de la escala, presente
 * en la alternativa textual marcado), A7 (rampa fija en `palette.ts`).
 *
 * ── Contrato supuesto ──────────────────────────────────────────────────────
 * `lib/dashboard/palette.ts`
 *   - `MAP_SEQUENTIAL_RAMP: readonly string[]` — hex `#rrggbb`, de claro a
 *     oscuro, idéntico en ambos temas. El índice 0 (`SUPPRESSED_STEP`) queda
 *     reservado a la celda suprimida; los pasos 1..N-1 son la escala de valores.
 *
 * `lib/dashboard/departmentMap.ts` (nuevo, puro)
 *   - `interface DepartmentValue { name: string; count: number | null;
 *       suppressed?: boolean }` — compatible con `AggregationOption` y con
 *     `ServedMetricBucket` (`name`/`text` los mapea el componente).
 *   - `interface ChartSource { sourceKind: "questions" | "entity_metric";
 *       metricKey?: string | null }`
 *   - `interface MapUnit { plural: string; emptyLabel: string }`
 *   - `unitFor(source: ChartSource): MapUnit`
 *   - `projectDepartments(): readonly string[]` — nombres de `territories`, en
 *     su orden; coinciden con `DeNombre` del GeoJSON.
 *   - `isProjectDepartment(name: string): boolean` — sin distinguir mayúsculas
 *     ni tildes.
 *   - `projectFeatureCollection(fc)` — `FeatureCollection` con solo las
 *     geometrías del proyecto (insumo de `fitExtent`).
 *   - `type DepartmentState = "value" | "suppressed" | "empty" | "outside"`
 *   - `interface DepartmentCell { name: string; state: DepartmentState;
 *       count: number | null; step: number | null; color: string | null;
 *       inProject: boolean; interactive: boolean }`
 *   - `interface LegendStep { step: number; color: string; min: number;
 *       max: number }`
 *   - `interface DepartmentMapModel { cells: DepartmentCell[];
 *       cellFor(name: string): DepartmentCell;
 *       legend: { steps: LegendStep[]; suppressedColor: string;
 *                 suppressedNote: string } }`
 *   - `classifyDepartments(values: DepartmentValue[]): DepartmentMapModel`
 *   - `SUPPRESSED_STEP = 0`
 *   - `stepFor(count: number, max: number): number` —
 *     `max(1, ceil(count * K / max))`, con `K = MAP_SEQUENTIAL_RAMP.length - 1`.
 *   - `tooltipText(cell: DepartmentCell, unit: MapUnit):
 *       { title: string; detail: string } | null` (null si no es interactiva).
 *   - `interface AccessibleRow { department: string; valueText: string;
 *       outsideProject: boolean; note: string | null }`
 *   - `accessibleRows(model: DepartmentMapModel, unit: MapUnit): AccessibleRow[]`
 *   - `PRIVACY_TOOLTIP`, `PRIVACY_ROW_TEXT`, `SUPPRESSION_LEGEND_NOTE`,
 *     `OUTSIDE_PROJECT_NOTE` — textos de A1/A3/C10.
 * Si la implementación elige otras firmas, se ajustan aquí con aprobación.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { territories } from "@/lib/landing-content/territories";
import {
  OUTSIDE_PROJECT_NOTE,
  PRIVACY_ROW_TEXT,
  PRIVACY_TOOLTIP,
  SUPPRESSED_STEP,
  SUPPRESSION_LEGEND_NOTE,
  accessibleRows,
  classifyDepartments,
  isProjectDepartment,
  projectDepartments,
  projectFeatureCollection,
  stepFor,
  tooltipText,
  unitFor,
  type DepartmentValue,
} from "./departmentMap";
import { MAP_SEQUENTIAL_RAMP } from "./palette";

// ── Datos de apoyo ──────────────────────────────────────────────────────────

interface GeoFeature {
  type: "Feature";
  properties: { DeNombre: string } | null;
  geometry: unknown;
}
interface GeoCollection {
  type: "FeatureCollection";
  features: GeoFeature[];
}

/** El mismo GeoJSON que sirve `DepartmentMap.tsx` (`/maps/colombia.geo.json`). */
const GEOJSON: GeoCollection = JSON.parse(
  readFileSync(resolve(__dirname, "../../public/maps/colombia.geo.json"), "utf8"),
);
const GEO_NAMES = new Set(GEOJSON.features.map((f) => f.properties?.DeNombre));

/** Número de pasos de valor (el índice 0 de la rampa es el de suprimido). */
const K = MAP_SEQUENTIAL_RAMP.length - 1;

/**
 * Fixture: los seis del proyecto en todos los estados posibles, más dos de
 * fuera del proyecto con datos (A3), uno de ellos con un valor mucho mayor que
 * cualquiera del proyecto para comprobar que no entra en la escala.
 */
const VALUES: DepartmentValue[] = [
  { name: "Antioquia", count: 40, suppressed: false },
  { name: "Meta", count: 12, suppressed: false },
  { name: "Norte de Santander", count: 6, suppressed: false },
  { name: "Caquetá", count: null, suppressed: true },
  { name: "Chocó", count: 0, suppressed: false },
  // La Guajira no viene: sin datos.
  { name: "Cundinamarca", count: 300, suppressed: false },
  { name: "Santander", count: null, suppressed: true },
];

const PRODUCTION_UNITS = unitFor({
  sourceKind: "entity_metric",
  metricKey: "production_units_by_department",
});

// Luminancia relativa y contraste (WCAG 2.x) para la validación de A7.
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
/** `--surface` de `app/globals.css` en tema claro y oscuro. */
const SURFACE_LIGHT = "#ffffff";
const SURFACE_DARK = "#0f172a";

// ── C7 ──────────────────────────────────────────────────────────────────────

describe("C7 — región del proyecto: seis departamentos desde `territories`", () => {
  it("projectDepartments() son los departamentos de `territories`, en su orden", () => {
    expect([...projectDepartments()]).toEqual(territories.map((t) => t.department));
    expect(projectDepartments()).toHaveLength(6);
  });

  it("cada departamento del proyecto existe con ese nombre exacto en el GeoJSON (`DeNombre`, tildes incluidas)", () => {
    for (const name of projectDepartments()) {
      expect(GEO_NAMES.has(name), `${name} no está en el GeoJSON`).toBe(true);
    }
  });

  it("isProjectDepartment reconoce los seis sin distinguir mayúsculas ni tildes, y rechaza los demás", () => {
    expect(isProjectDepartment("Caquetá")).toBe(true);
    expect(isProjectDepartment("CAQUETA")).toBe(true);
    expect(isProjectDepartment("choco")).toBe(true);
    expect(isProjectDepartment("NORTE DE SANTANDER")).toBe(true);
    expect(isProjectDepartment("Santander")).toBe(false);
    expect(isProjectDepartment("Cundinamarca")).toBe(false);
    expect(isProjectDepartment("Bogotá D.C.")).toBe(false);
    expect(isProjectDepartment("")).toBe(false);
  });

  it("projectFeatureCollection deja solo las seis geometrías del proyecto (encuadre de `fitExtent`)", () => {
    const fc = projectFeatureCollection(GEOJSON);
    expect(fc.type).toBe("FeatureCollection");
    expect(fc.features.map((f) => f.properties?.DeNombre).sort()).toEqual(
      [...projectDepartments()].sort(),
    );
    // No muta la colección original.
    expect(GEOJSON.features.length).toBeGreaterThan(6);
  });

  it("los departamentos fuera del proyecto no son interactivos (sin puntero ni foco), tengan o no datos", () => {
    const model = classifyDepartments(VALUES);
    for (const name of ["Cundinamarca", "Santander", "Boyacá", "Vichada"]) {
      const cell = model.cellFor(name);
      expect(cell.inProject).toBe(false);
      expect(cell.interactive).toBe(false);
      expect(cell.state).toBe("outside");
    }
    for (const name of projectDepartments()) {
      expect(model.cellFor(name).interactive).toBe(true);
    }
  });
});

// ── C8 ──────────────────────────────────────────────────────────────────────

describe("C8 — estados y escala secuencial por pasos", () => {
  const model = classifyDepartments(VALUES);

  it("clasifica cada departamento del proyecto: valor / suprimido / sin datos (0 o ausente)", () => {
    expect(model.cellFor("Antioquia").state).toBe("value");
    expect(model.cellFor("Meta").state).toBe("value");
    expect(model.cellFor("Norte de Santander").state).toBe("value");
    expect(model.cellFor("Caquetá").state).toBe("suppressed");
    expect(model.cellFor("Chocó").state).toBe("empty");
    expect(model.cellFor("La Guajira").state).toBe("empty");
  });

  it("cruza por nombre sin distinguir mayúsculas ni tildes y devuelve el nombre canónico del proyecto", () => {
    const m = classifyDepartments([{ name: "NORTE DE SANTANDER", count: 9, suppressed: false }]);
    const cell = m.cellFor("Norte de Santander");
    expect(cell.state).toBe("value");
    expect(cell.count).toBe(9);
    expect(cell.name).toBe("Norte de Santander");
  });

  it("`cells` trae siempre los seis del proyecto y, además, los de fuera con datos (A3); nada más", () => {
    const names = model.cells.map((c) => c.name).sort();
    expect(names).toEqual(
      [...projectDepartments(), "Cundinamarca", "Santander"].sort(),
    );
  });

  it("la celda suprimida nunca expone conteo, va en el paso reservado más claro y con color de la rampa", () => {
    const cell = model.cellFor("Caquetá");
    expect(cell.count).toBeNull();
    expect(SUPPRESSED_STEP).toBe(0);
    expect(cell.step).toBe(SUPPRESSED_STEP);
    expect(cell.color).toBe(MAP_SEQUENTIAL_RAMP[0]);
    expect(model.legend.suppressedColor).toBe(MAP_SEQUENTIAL_RAMP[0]);
  });

  it("sin datos/0 y fuera del proyecto quedan fuera de la escala: sin paso ni color de la rampa (los pinta un token)", () => {
    for (const name of ["Chocó", "La Guajira", "Cundinamarca", "Santander", "Boyacá"]) {
      const cell = model.cellFor(name);
      expect(cell.step, name).toBeNull();
      expect(cell.color, name).toBeNull();
    }
  });

  it("stepFor sigue `max(1, ceil(count * K / max))`: el máximo va al paso más oscuro", () => {
    expect(K).toBeGreaterThanOrEqual(3);
    expect(stepFor(40, 40)).toBe(K);
    expect(stepFor(1, 40)).toBe(1);
    expect(stepFor(12, 40)).toBe(Math.max(1, Math.ceil((12 * K) / 40)));
    expect(stepFor(6, 40)).toBe(Math.max(1, Math.ceil((6 * K) / 40)));
  });

  it("los pasos se calculan solo con valores visibles del proyecto: el valor grande de fuera (Cundinamarca 300) no aplana la escala", () => {
    expect(model.cellFor("Antioquia").step).toBe(K);
    expect(model.cellFor("Antioquia").color).toBe(MAP_SEQUENTIAL_RAMP[K]);
    expect(model.cellFor("Meta").step).toBe(stepFor(12, 40));
    expect(model.cellFor("Norte de Santander").step).toBe(stepFor(6, 40));
    // Mismo resultado sin los de fuera del proyecto ni el suprimido.
    const onlyProjectVisible = classifyDepartments(
      VALUES.filter((v) => isProjectDepartment(v.name) && !v.suppressed),
    );
    for (const name of projectDepartments()) {
      if (model.cellFor(name).state !== "value") continue;
      expect(onlyProjectVisible.cellFor(name).step, name).toBe(model.cellFor(name).step);
    }
  });

  it("los pasos de valor están en 1..K y nunca usan el reservado para suprimido", () => {
    for (const cell of model.cells.filter((c) => c.state === "value")) {
      expect(cell.step).toBeGreaterThanOrEqual(1);
      expect(cell.step).toBeLessThanOrEqual(K);
      expect(cell.color).toBe(MAP_SEQUENTIAL_RAMP[cell.step as number]);
    }
  });

  it("la leyenda lista los cortes de cada paso, contiguos y cubriendo 1..máximo", () => {
    const { steps } = model.legend;
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].min).toBe(1);
    expect(steps[steps.length - 1].max).toBe(40);
    for (let i = 0; i < steps.length; i++) {
      expect(steps[i].min).toBeLessThanOrEqual(steps[i].max);
      expect(steps[i].color).toBe(MAP_SEQUENTIAL_RAMP[steps[i].step]);
      if (i > 0) {
        expect(steps[i].step).toBeGreaterThan(steps[i - 1].step);
        expect(steps[i].min).toBe(steps[i - 1].max + 1);
      }
    }
  });

  it("cada conteo cae dentro del rango de leyenda de su propio paso", () => {
    const { steps } = model.legend;
    for (let count = 1; count <= 40; count++) {
      const legendStep = steps.find((s) => s.step === stepFor(count, 40));
      expect(legendStep, `paso de ${count}`).toBeDefined();
      expect(count).toBeGreaterThanOrEqual(legendStep!.min);
      expect(count).toBeLessThanOrEqual(legendStep!.max);
    }
  });

  it("la leyenda explica la supresión con el texto de A1", () => {
    expect(SUPPRESSION_LEGEND_NOTE).toBe(
      "Se ocultan los departamentos con menos de 5 unidades y, si hace falta, otro más para que el dato no se pueda deducir",
    );
    expect(model.legend.suppressedNote).toBe(SUPPRESSION_LEGEND_NOTE);
  });

  it("sin ningún valor visible en el proyecto la leyenda no tiene pasos y no se divide por cero", () => {
    const m = classifyDepartments([
      { name: "Caquetá", count: null, suppressed: true },
      { name: "Meta", count: null, suppressed: true },
      { name: "Cundinamarca", count: 50, suppressed: false },
    ]);
    expect(m.legend.steps).toEqual([]);
    expect(m.cellFor("Meta").step).toBe(SUPPRESSED_STEP);
    expect(m.cellFor("Antioquia").state).toBe("empty");
    expect(classifyDepartments([]).legend.steps).toEqual([]);
  });
});

// ── C9 ──────────────────────────────────────────────────────────────────────

describe("C9 — tooltip: nombre, conteo y unidad según la fuente", () => {
  const model = classifyDepartments([
    ...VALUES,
    { name: "La Guajira", count: 1234, suppressed: false },
  ]);

  it.each([
    [{ sourceKind: "entity_metric", metricKey: "production_units_by_department" }, "unidades productivas", "Sin unidades registradas"],
    [{ sourceKind: "entity_metric", metricKey: "farms_by_department" }, "fincas", "Sin fincas registradas"],
    [{ sourceKind: "entity_metric", metricKey: "farmers_by_department" }, "productores", "Sin productores registrados"],
    [{ sourceKind: "questions", metricKey: null }, "respuestas", "Sin respuestas"],
    [{ sourceKind: "questions" }, "respuestas", "Sin respuestas"],
  ] as const)("unitFor(%o) → «%s» / «%s»", (source, plural, emptyLabel) => {
    expect(unitFor(source)).toEqual({ plural, emptyLabel });
  });

  it("una métrica desconocida cae a una unidad genérica, nunca a «encuestas»", () => {
    const unit = unitFor({ sourceKind: "entity_metric", metricKey: "otra_metrica" });
    expect(unit).toEqual({ plural: "registros", emptyLabel: "Sin registros" });
  });

  it("departamento con valor: nombre y «N unidades productivas» (miles con punto, es-CO)", () => {
    expect(tooltipText(model.cellFor("Antioquia"), PRODUCTION_UNITS)).toEqual({
      title: "Antioquia",
      detail: "40 unidades productivas",
    });
    expect(tooltipText(model.cellFor("La Guajira"), PRODUCTION_UNITS)).toEqual({
      title: "La Guajira",
      detail: "1.234 unidades productivas",
    });
  });

  it("la unidad sigue a la fuente: el mismo departamento en un mapa de preguntas dice «respuestas»", () => {
    const answers = unitFor({ sourceKind: "questions" });
    expect(tooltipText(model.cellFor("Meta"), answers)?.detail).toBe("12 respuestas");
    const farms = unitFor({ sourceKind: "entity_metric", metricKey: "farms_by_department" });
    expect(tooltipText(model.cellFor("Meta"), farms)?.detail).toBe("12 fincas");
  });

  it("suprimido (A1): «Dato protegido por privacidad», sin cifra ni «menos de 5»", () => {
    expect(PRIVACY_TOOLTIP).toBe("Dato protegido por privacidad");
    const tip = tooltipText(model.cellFor("Caquetá"), PRODUCTION_UNITS);
    expect(tip).toEqual({ title: "Caquetá", detail: PRIVACY_TOOLTIP });
    expect(tip?.detail).not.toMatch(/\d/);
  });

  it("sin datos o 0: el texto vacío de la unidad («Sin unidades registradas»), nunca «0 …»", () => {
    expect(tooltipText(model.cellFor("Chocó"), PRODUCTION_UNITS)).toEqual({
      title: "Chocó",
      detail: "Sin unidades registradas",
    });
    const farmers = unitFor({ sourceKind: "entity_metric", metricKey: "farmers_by_department" });
    expect(tooltipText(model.cellFor("Chocó"), farmers)?.detail).toBe("Sin productores registrados");
  });

  it("fuera del proyecto no tiene tooltip (no es interactivo), aunque tenga datos", () => {
    expect(tooltipText(model.cellFor("Cundinamarca"), PRODUCTION_UNITS)).toBeNull();
    expect(tooltipText(model.cellFor("Boyacá"), PRODUCTION_UNITS)).toBeNull();
  });
});

// ── C10 ─────────────────────────────────────────────────────────────────────

describe("C10 — alternativa textual accesible", () => {
  const model = classifyDepartments(VALUES);
  const rows = accessibleRows(model, PRODUCTION_UNITS);

  it("incluye todos los departamentos con valor o suprimidos —del proyecto y de fuera (A3)— y omite los sin datos/0", () => {
    expect(rows.map((r) => r.department).sort()).toEqual(
      ["Antioquia", "Caquetá", "Cundinamarca", "Meta", "Norte de Santander", "Santander"].sort(),
    );
    expect(rows.find((r) => r.department === "Chocó")).toBeUndefined();
    expect(rows.find((r) => r.department === "La Guajira")).toBeUndefined();
  });

  it("ordena por valor de mayor a menor (todos los visibles, de dentro y de fuera) y deja los suprimidos al final, alfabéticos", () => {
    expect(rows.map((r) => r.department)).toEqual([
      "Cundinamarca",
      "Antioquia",
      "Meta",
      "Norte de Santander",
      "Caquetá",
      "Santander",
    ]);
  });

  it("el valor visible lleva la unidad de la fuente; el suprimido dice «Protegido por privacidad»", () => {
    expect(PRIVACY_ROW_TEXT).toBe("Protegido por privacidad");
    const byName = Object.fromEntries(rows.map((r) => [r.department, r]));
    expect(byName["Antioquia"].valueText).toBe("40 unidades productivas");
    expect(byName["Cundinamarca"].valueText).toBe("300 unidades productivas");
    expect(byName["Caquetá"].valueText).toBe(PRIVACY_ROW_TEXT);
    expect(byName["Santander"].valueText).toBe(PRIVACY_ROW_TEXT);
  });

  it("los de fuera del proyecto van marcados «fuera de la región del proyecto»; los del proyecto, sin nota", () => {
    expect(OUTSIDE_PROJECT_NOTE.toLowerCase()).toBe("fuera de la región del proyecto");
    for (const row of rows) {
      const outside = !isProjectDepartment(row.department);
      expect(row.outsideProject, row.department).toBe(outside);
      expect(row.note, row.department).toBe(outside ? OUTSIDE_PROJECT_NOTE : null);
    }
  });

  it("la unidad de las filas sigue a la fuente (mapa de preguntas → «respuestas»)", () => {
    const answerRows = accessibleRows(model, unitFor({ sourceKind: "questions" }));
    expect(answerRows.find((r) => r.department === "Meta")?.valueText).toBe("12 respuestas");
  });

  it("sin ningún departamento con dato no hay filas", () => {
    expect(accessibleRows(classifyDepartments([]), PRODUCTION_UNITS)).toEqual([]);
  });
});

// ── C11 (parte automatizable) ───────────────────────────────────────────────

describe("C11 — rampa secuencial fija en `palette.ts` (A7)", () => {
  it("son hex `#rrggbb` con al menos 4 tonos (suprimido + 3 pasos de valor)", () => {
    expect(MAP_SEQUENTIAL_RAMP.length).toBeGreaterThanOrEqual(4);
    for (const hex of MAP_SEQUENTIAL_RAMP) expect(hex).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it("va de claro a oscuro: luminancia estrictamente decreciente, pasos distinguibles", () => {
    for (let i = 1; i < MAP_SEQUENTIAL_RAMP.length; i++) {
      expect(luminance(MAP_SEQUENTIAL_RAMP[i])).toBeLessThan(
        luminance(MAP_SEQUENTIAL_RAMP[i - 1]),
      );
    }
  });

  it("contraste ≥ 3:1 de los extremos contra `--surface`: el más oscuro en claro y el más claro en oscuro", () => {
    const darkest = MAP_SEQUENTIAL_RAMP[MAP_SEQUENTIAL_RAMP.length - 1];
    const lightest = MAP_SEQUENTIAL_RAMP[0];
    expect(contrast(darkest, SURFACE_LIGHT)).toBeGreaterThanOrEqual(3);
    expect(contrast(lightest, SURFACE_DARK)).toBeGreaterThanOrEqual(3);
  });
});
