/**
 * Spec 111 — lógica pura de los mapas por departamento del constructor
 * (`charts/DepartmentMap.tsx`), sin React para poder probarla con Vitest
 * (`e2e-111-mapaUnidadesProductivas.test.ts`).
 *
 * - Región: los seis departamentos de `territories` (los del proyecto). El
 *   mapa se encuadra en ellos; los demás quedan grises y sin interacción.
 * - Escala: pasos de `MAP_SEQUENTIAL_RAMP` calculados solo con los valores
 *   visibles del proyecto (A3: un valor grande de fuera no aplana la escala).
 * - Privacidad (A1): la celda suprimida va en el paso reservado más claro y
 *   nunca expone conteo; su texto no afirma «menos de 5» porque la supresión
 *   complementaria también oculta celdas mayores.
 * - Unidad (A2): sale de la fuente del gráfico, no de un texto fijo.
 */
import { territories } from "@/lib/landing-content/territories";
import { MAP_SEQUENTIAL_RAMP } from "./palette";

export const SUPPRESSED_STEP = 0;
export const PRIVACY_TOOLTIP = "Dato protegido por privacidad";
export const PRIVACY_ROW_TEXT = "Protegido por privacidad";
export const SUPPRESSION_LEGEND_NOTE =
  "Se ocultan los departamentos con menos de 5 unidades y, si hace falta, otro más para que el dato no se pueda deducir";
export const OUTSIDE_PROJECT_NOTE = "Fuera de la región del proyecto";

/**
 * Token del borde de los departamentos del proyecto. La rampa no puede tener
 * todos sus tonos a 3:1 contra un fondo blanco y uno oscuro a la vez; el borde
 * sí (≥ 3:1 contra `--surface` en ambos temas, verificado en e2e-111, C11), y
 * es el que delimita cada departamento (decisión del usuario, 2026-11-25).
 */
export const REGION_STROKE_TOKEN = "--text-muted";
export const REGION_STROKE = `var(${REGION_STROKE_TOKEN})`;

/** Pasos de valor disponibles (el índice 0 es el de suprimido). */
const VALUE_STEPS = MAP_SEQUENTIAL_RAMP.length - 1;

export interface DepartmentValue {
  name: string;
  count: number | null;
  suppressed?: boolean;
}

export interface ChartSource {
  sourceKind: "questions" | "entity_metric";
  metricKey?: string | null;
}

export interface MapUnit {
  plural: string;
  emptyLabel: string;
}

export type DepartmentState = "value" | "suppressed" | "empty" | "outside";

export interface DepartmentCell {
  name: string;
  state: DepartmentState;
  count: number | null;
  step: number | null;
  color: string | null;
  inProject: boolean;
  interactive: boolean;
}

export interface LegendStep {
  step: number;
  color: string;
  min: number;
  max: number;
}

export interface DepartmentMapModel {
  cells: DepartmentCell[];
  cellFor(name: string): DepartmentCell;
  legend: { steps: LegendStep[]; suppressedColor: string; suppressedNote: string };
}

export interface AccessibleRow {
  department: string;
  valueText: string;
  outsideProject: boolean;
  note: string | null;
}

const METRIC_UNITS: Record<string, MapUnit> = {
  production_units_by_department: {
    plural: "unidades productivas",
    emptyLabel: "Sin unidades registradas",
  },
  farms_by_department: { plural: "fincas", emptyLabel: "Sin fincas registradas" },
  farmers_by_department: { plural: "productores", emptyLabel: "Sin productores registrados" },
};
const ANSWERS_UNIT: MapUnit = { plural: "respuestas", emptyLabel: "Sin respuestas" };
const GENERIC_UNIT: MapUnit = { plural: "registros", emptyLabel: "Sin registros" };

/**
 * Nota de privacidad de la leyenda con la unidad de la fuente (A1 + A2): el
 * texto de `SUPPRESSION_LEGEND_NOTE` con la unidad del mapa («unidades
 * productivas», «respuestas», «fincas»…). Bug hallado en producción
 * (TC-111-009): en el mapa de preguntas decía «unidades».
 */
export function suppressionNoteFor(unit: MapUnit): string {
  return `Se ocultan los departamentos con menos de 5 ${unit.plural} y, si hace falta, otro más para que el dato no se pueda deducir`;
}

/** Unidad de los conteos según la fuente del gráfico (A2). */
export function unitFor(source: ChartSource): MapUnit {
  if (source.sourceKind === "questions") return ANSWERS_UNIT;
  return (source.metricKey && METRIC_UNITS[source.metricKey]) || GENERIC_UNIT;
}

/** Combining diacritical marks tras normalizar a NFD. */
const DIACRITICS_PATTERN = /\p{Diacritic}/gu;

function normalizeName(name: string): string {
  return name.trim().toLowerCase().normalize("NFD").replace(DIACRITICS_PATTERN, "");
}

const PROJECT_DEPARTMENTS: readonly string[] = territories.map((t) => t.department);
const PROJECT_BY_KEY = new Map(PROJECT_DEPARTMENTS.map((name) => [normalizeName(name), name]));

/** Departamentos del proyecto, en el orden de `territories`. */
export function projectDepartments(): readonly string[] {
  return PROJECT_DEPARTMENTS;
}

export function isProjectDepartment(name: string): boolean {
  return PROJECT_BY_KEY.has(normalizeName(name));
}

/** Solo las geometrías del proyecto, para encuadrar la proyección. No muta `fc`. */
export function projectFeatureCollection<
  F extends { properties: { DeNombre?: string } | null },
  C extends { type: "FeatureCollection"; features: F[] },
>(fc: C): C {
  return {
    ...fc,
    features: fc.features.filter((f) => isProjectDepartment(f.properties?.DeNombre ?? "")),
  };
}

/** Paso de color (1..K) de un conteo visible, con `max` el mayor visible del proyecto. */
export function stepFor(count: number, max: number): number {
  if (max <= 0) return 1;
  return Math.min(VALUE_STEPS, Math.max(1, Math.ceil((count * VALUE_STEPS) / max)));
}

/** Cortes de la leyenda: el rango de conteos que cae en cada paso (sin pasos vacíos). */
function legendSteps(max: number): LegendStep[] {
  if (max <= 0) return [];
  const steps: LegendStep[] = [];
  for (let step = 1; step <= VALUE_STEPS; step++) {
    const min = Math.floor(((step - 1) * max) / VALUE_STEPS) + 1;
    const top = Math.floor((step * max) / VALUE_STEPS);
    if (min <= top) {
      steps.push({ step, color: MAP_SEQUENTIAL_RAMP[step], min, max: top });
    }
  }
  return steps;
}

function emptyCell(name: string, inProject: boolean): DepartmentCell {
  return {
    name,
    state: inProject ? "empty" : "outside",
    count: null,
    step: null,
    color: null,
    inProject,
    interactive: inProject,
  };
}

export function classifyDepartments(values: DepartmentValue[]): DepartmentMapModel {
  const byKey = new Map<string, DepartmentValue>();
  for (const value of values) byKey.set(normalizeName(value.name), value);

  const projectVisible = PROJECT_DEPARTMENTS.map((name) => byKey.get(normalizeName(name)))
    .filter((v): v is DepartmentValue => !!v && !v.suppressed && (v.count ?? 0) > 0)
    .map((v) => v.count as number);
  const max = projectVisible.length > 0 ? Math.max(...projectVisible) : 0;

  const cells: DepartmentCell[] = PROJECT_DEPARTMENTS.map((name) => {
    const value = byKey.get(normalizeName(name));
    if (value?.suppressed) {
      return {
        name,
        state: "suppressed",
        count: null,
        step: SUPPRESSED_STEP,
        color: MAP_SEQUENTIAL_RAMP[SUPPRESSED_STEP],
        inProject: true,
        interactive: true,
      };
    }
    if (!value || !value.count) return emptyCell(name, true);
    const step = stepFor(value.count, max);
    return {
      name,
      state: "value",
      count: value.count,
      step,
      color: MAP_SEQUENTIAL_RAMP[step],
      inProject: true,
      interactive: true,
    };
  });

  // A3: los de fuera con datos (valor o suprimido) se conservan para la
  // alternativa textual, pero quedan fuera de la escala y sin interacción.
  for (const value of values) {
    if (isProjectDepartment(value.name)) continue;
    if (!value.suppressed && !value.count) continue;
    cells.push({
      ...emptyCell(value.name, false),
      count: value.suppressed ? null : value.count,
    });
  }

  const byCellKey = new Map(cells.map((c) => [normalizeName(c.name), c]));
  return {
    cells,
    cellFor(name: string) {
      return (
        byCellKey.get(normalizeName(name)) ?? emptyCell(name, isProjectDepartment(name))
      );
    },
    legend: {
      steps: legendSteps(max),
      suppressedColor: MAP_SEQUENTIAL_RAMP[SUPPRESSED_STEP],
      suppressedNote: SUPPRESSION_LEGEND_NOTE,
    },
  };
}

const NUMBER_FORMAT = new Intl.NumberFormat("es-CO", { useGrouping: "always" });

function countText(count: number, unit: MapUnit): string {
  return `${NUMBER_FORMAT.format(count)} ${unit.plural}`;
}

export function tooltipText(
  cell: DepartmentCell,
  unit: MapUnit,
): { title: string; detail: string } | null {
  if (!cell.interactive) return null;
  if (cell.state === "suppressed") return { title: cell.name, detail: PRIVACY_TOOLTIP };
  if (cell.state === "value" && cell.count) {
    return { title: cell.name, detail: countText(cell.count, unit) };
  }
  return { title: cell.name, detail: unit.emptyLabel };
}

/**
 * Filas de la tabla accesible (C10): todos los departamentos con dato, del
 * proyecto y de fuera (marcados), de mayor a menor; los protegidos al final,
 * en orden alfabético.
 */
export function accessibleRows(model: DepartmentMapModel, unit: MapUnit): AccessibleRow[] {
  const isSuppressed = (c: DepartmentCell) =>
    c.state === "suppressed" || (!c.inProject && c.count === null);
  const withData = model.cells.filter((c) => isSuppressed(c) || (c.count ?? 0) > 0);
  const visible = withData
    .filter((c) => !isSuppressed(c))
    .sort((a, b) => (b.count ?? 0) - (a.count ?? 0) || a.name.localeCompare(b.name, "es"));
  const hidden = withData
    .filter(isSuppressed)
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
  return [...visible, ...hidden].map((c) => ({
    department: c.name,
    valueText: isSuppressed(c) ? PRIVACY_ROW_TEXT : countText(c.count as number, unit),
    outsideProject: !c.inProject,
    note: c.inProject ? null : OUTSIDE_PROJECT_NOTE,
  }));
}
