/**
 * e2e-109 — Constructor en el panel y dashboards sobre gráficos.
 *
 * Escrito junto con `spec/109_constructor_dashboard_panel_y_servicio.md`,
 * antes de la implementación: arranca EN ROJO. La primera causa del rojo es
 * el import de `./chartCompat`, que todavía no existe (falla la carga del
 * archivo completo). Con ese módulo creado, el rojo pasa a venir de las
 * funciones nuevas de `./chartHint` y `./filters` que este spec agrega.
 *
 * El entorno de Vitest es `node` (ver `vitest.config.ts`): solo lógica pura.
 * Criterios cubiertos: 9 (resolución de `chartKind` y `layout` desde el DTO),
 * 10 (en parte: la navegación ya no depende de una regex fija), 11 (gráficos
 * permitidos por la matriz, motivo de bloqueo, validaciones del formulario),
 * más las ayudas de UI que el spec nombra (reordenamiento accesible, aviso
 * de diferencias de opciones, aviso de caché, `OVERVIEW` fuera de la barra
 * lateral; las categorías vacías ya las filtra el backend).
 * Los criterios 12–14 se verifican en
 * `docs/testing/test-109-constructor-dashboard-panel-y-servicio.md`.
 *
 * ── Contrato supuesto ──────────────────────────────────────────────────────
 * El spec nombra los módulos (`chartCompat.ts` nuevo y puro; `chartHint.ts`
 * conserva la tabla de `ChartKind` y su resolución desde el DTO; `filters.ts`
 * toma las categorías de la API), pero no las firmas. Las de abajo son las
 * que este archivo asume; si la implementación elige otras, se ajustan aquí
 * con aprobación. Identificadores de `chartKind` servidos por el backend
 * (matriz del 108): `donut`, `yes-percent-bars`, `bars`,
 * `horizontal-bars`, `map`, `harvest-calendar`, `diverging`, `histogram`,
 * `histogram-by-unit`, `histogram-normalized`. La comparación Likert se
 * resuelve a `diverging-matrix`. La matriz declara `combineModes` (fijado en
 * el e2e-108) y el catálogo de preguntas trae `compatibleCharts`.
 */
import { describe, expect, it } from "vitest";
import {
  PUBLIC_CACHE_MINUTES,
  allowedChartKinds,
  moveChart,
  optionsDifference,
  questionBlockReason,
  validateChartForm,
  type ChartCompatMatrix,
  type ChartFormValues,
} from "./chartCompat";
import { chartGridSpan, resolveServedChartKind } from "./chartHint";
import { parseDashboardParams, visibleCategories } from "./filters";

// ── Datos de apoyo ──────────────────────────────────────────────────────────

/** Matriz tal como la serviría `GET /api/dashboard/builder/compat-matrix`
 * (P10 del spec 108; forma `{ questionType, charts, combineModes }[]` que
 * fija el `e2e-108`). */
const MATRIX: ChartCompatMatrix = [
  {
    questionType: "yes_no",
    charts: ["donut", "yes-percent-bars"],
    combineModes: ["merge", "compare"],
  },
  {
    questionType: "single_choice",
    charts: ["bars", "horizontal-bars", "donut", "map"],
    combineModes: ["merge"],
  },
  {
    questionType: "multiple_choice",
    charts: ["horizontal-bars", "harvest-calendar"],
    combineModes: ["merge"],
  },
  { questionType: "compliance", charts: ["bars"], combineModes: ["merge"] },
  {
    questionType: "likert",
    charts: ["diverging"],
    combineModes: ["merge", "compare"],
  },
  { questionType: "numeric", charts: ["histogram"], combineModes: ["merge"] },
  {
    questionType: "numeric_with_unit",
    charts: ["histogram-by-unit", "histogram-normalized"],
    combineModes: ["merge"],
  },
];

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
const DEPARTMENTS = ["Antioquia", "Caldas", "Cauca", "Huila", "Tolima"];

const source = (
  questionType: string,
  options: string[] = [],
  extra: Partial<{ questionId: string; selectable: boolean }> = {},
) => ({
  questionId: extra.questionId ?? `${questionType}-1`,
  questionType,
  options,
  selectable: extra.selectable ?? true,
});

const validForm = (
  overrides: Partial<ChartFormValues> = {},
): ChartFormValues => ({
  title: "Acceso a crédito",
  subtitle: "",
  categoryId: "11111111-1111-4111-8111-111111111111",
  audience: "public",
  layout: "normal",
  combineMode: "merge",
  chartKind: "donut",
  sources: [source("yes_no")],
  settings: {},
  ...overrides,
});

// ── Criterio 9 — resolución desde el DTO ───────────────────────────────────

describe("resolveServedChartKind — chartKind del gráfico servido (criterio 9)", () => {
  it.each([
    "donut",
    "yes-percent-bars",
    "bars",
    "horizontal-bars",
    "map",
    "harvest-calendar",
    "diverging",
    "histogram",
    "histogram-by-unit",
    "histogram-normalized",
  ])("«%s» resuelve a sí mismo (un componente propio)", (kind) => {
    expect(resolveServedChartKind({ chartKind: kind })).toBe(kind);
  });

  it("la comparación Likert se renderiza como matriz divergente", () => {
    expect(
      resolveServedChartKind({
        chartKind: "diverging",
        combineMode: "compare",
      }),
    ).toBe("diverging-matrix");
  });

  it("la comparación Sí/No se renderiza como barras «% Sí»", () => {
    expect(
      resolveServedChartKind({
        chartKind: "yes-percent-bars",
        combineMode: "compare",
      }),
    ).toBe("yes-percent-bars");
  });

  it("un chartKind desconocido cae al marcador «no soportado», sin lanzar", () => {
    expect(() =>
      resolveServedChartKind({ chartKind: "pastel-3d" }),
    ).not.toThrow();
    expect(resolveServedChartKind({ chartKind: "pastel-3d" })).toBe(
      "unsupported",
    );
  });

  it("ya no depende del tipo de pregunta: lo decide el chartKind del gráfico", () => {
    // multiple_choice por tipo caería a barras horizontales; el gráfico manda.
    expect(
      resolveServedChartKind({
        chartKind: "harvest-calendar",
        questionType: "multiple_choice",
      } as Parameters<typeof resolveServedChartKind>[0]),
    ).toBe("harvest-calendar");
  });
});

describe("chartGridSpan — grilla con layout (criterio 9, P23)", () => {
  it("normal ocupa una columna", () => {
    expect(chartGridSpan("normal")).toBe(1);
  });

  it("wide ocupa dos columnas", () => {
    expect(chartGridSpan("wide")).toBe(2);
  });

  it("un layout desconocido cae a normal", () => {
    expect(chartGridSpan("gigante" as "normal")).toBe(1);
  });
});

// ── Navegación con categorías de la API ────────────────────────────────────

describe("parseDashboardParams — categorías desde la API, sin regex (P2)", () => {
  const codes = ["C1", "C2", "C15", "C20"];

  it("acepta un código que la API declara aunque esté fuera de C1..C14", () => {
    const state = parseDashboardParams(
      { view: "category", categoryId: "C20" },
      codes,
    );
    expect(state.view).toBe("category");
    expect(state.categoryId).toBe("C20");
  });

  it("rechaza un código con forma válida que la API no declara (categoría vacía o inactiva)", () => {
    const state = parseDashboardParams(
      { view: "category", categoryId: "C3" },
      codes,
    );
    expect(state.view).toBe("overview");
    expect(state.categoryId).toBeUndefined();
  });
});

describe("visibleCategories — barra lateral desde la lista de la API", () => {
  // El backend ya filtra las categorías sin gráficos (criterio 7, e2e-109 del
  // backend) y sirve `[{ code, name }]`: el frontend no recibe conteos.
  it("conserva el orden de la API", () => {
    const visible = visibleCategories([
      { code: "C2", name: "Dos" },
      { code: "C1", name: "Uno" },
      { code: "C5", name: "Cinco" },
    ]);
    expect(visible.map((c) => c.code)).toEqual(["C2", "C1", "C5"]);
  });

  it("nunca muestra OVERVIEW como categoría de la barra lateral", () => {
    const visible = visibleCategories([
      { code: "OVERVIEW", name: "Resumen general" },
      { code: "C1", name: "Uno" },
    ]);
    expect(visible.map((c) => c.code)).toEqual(["C1"]);
  });
});

// ── Criterio 11 — gráficos permitidos y motivo de bloqueo ──────────────────

describe("allowedChartKinds — solo los gráficos permitidos para las fuentes (criterio 11)", () => {
  it("sin fuentes no ofrece ningún gráfico", () => {
    expect(allowedChartKinds(MATRIX, [])).toEqual([]);
  });

  it("Sí/No ofrece dona y barras «% Sí», con la dona primero (default)", () => {
    expect(allowedChartKinds(MATRIX, [source("yes_no")])).toEqual([
      "donut",
      "yes-percent-bars",
    ]);
  });

  it("selección múltiple nunca ofrece dona", () => {
    const kinds = allowedChartKinds(MATRIX, [
      source("multiple_choice", ["A", "B"]),
    ]);
    expect(kinds).not.toContain("donut");
    expect(kinds).toContain("horizontal-bars");
  });

  it("el calendario de cosecha solo aparece si las opciones son los 12 meses", () => {
    expect(
      allowedChartKinds(MATRIX, [source("multiple_choice", MONTHS)]),
    ).toContain("harvest-calendar");
    expect(
      allowedChartKinds(MATRIX, [
        source("multiple_choice", MONTHS.slice(0, 6)),
      ]),
    ).not.toContain("harvest-calendar");
  });

  it("la dona de selección única solo con 6 opciones o menos", () => {
    const six = ["1", "2", "3", "4", "5", "6"];
    expect(allowedChartKinds(MATRIX, [source("single_choice", six)])).toContain(
      "donut",
    );
    expect(
      allowedChartKinds(MATRIX, [source("single_choice", [...six, "7"])]),
    ).not.toContain("donut");
  });

  it("el mapa solo si las opciones son departamentos", () => {
    expect(
      allowedChartKinds(MATRIX, [source("single_choice", DEPARTMENTS)], {
        departmentNames: DEPARTMENTS,
      }),
    ).toContain("map");
    expect(
      allowedChartKinds(MATRIX, [source("single_choice", ["Sí", "No", "NS"])], {
        departmentNames: DEPARTMENTS,
      }),
    ).not.toContain("map");
  });

  it("fusionar preguntas de tipos distintos no ofrece ningún gráfico", () => {
    expect(
      allowedChartKinds(MATRIX, [
        source("yes_no"),
        source("single_choice", ["A"], { questionId: "sc-1" }),
      ]),
    ).toEqual([]);
  });

  it("un tipo no seleccionable (texto abierto) no ofrece ningún gráfico", () => {
    expect(allowedChartKinds(MATRIX, [source("open_text")])).toEqual([]);
  });

  it("una fuente bloqueada no ofrece ningún gráfico", () => {
    expect(
      allowedChartKinds(MATRIX, [source("yes_no", [], { selectable: false })]),
    ).toEqual([]);
  });
});

describe("questionBlockReason — motivo de bloqueo en el buscador (criterio 11)", () => {
  it("una pregunta seleccionable no tiene motivo", () => {
    expect(questionBlockReason({ selectable: true })).toBeNull();
  });

  it("una pregunta bloqueada muestra el motivo que envía el backend", () => {
    expect(
      questionBlockReason({
        selectable: false,
        blockedReason: "Identifica al productor",
      }),
    ).toBe("Identifica al productor");
  });

  it("una pregunta bloqueada sin motivo explícito muestra un texto genérico no vacío", () => {
    const reason = questionBlockReason({ selectable: false });
    expect(typeof reason).toBe("string");
    expect((reason ?? "").trim().length).toBeGreaterThan(0);
  });
});

describe("optionsDifference — aviso de diferencias de opciones en una fusión", () => {
  it("opciones idénticas no generan aviso", () => {
    const diff = optionsDifference([
      source("single_choice", ["A", "B"], { questionId: "q1" }),
      source("single_choice", ["B", "A"], { questionId: "q2" }),
    ]);
    expect(diff.hasDifferences).toBe(false);
  });

  it("opciones distintas listan lo que solo está en cada pregunta", () => {
    const diff = optionsDifference([
      source("single_choice", ["A", "B"], { questionId: "q1" }),
      source("single_choice", ["A", "C"], { questionId: "q2" }),
    ]);
    expect(diff.hasDifferences).toBe(true);
    expect(diff.onlyIn).toEqual({ q1: ["B"], q2: ["C"] });
  });
});

// ── Criterio 11 — validaciones del formulario ──────────────────────────────

describe("validateChartForm — validaciones del formulario del constructor (criterio 11)", () => {
  const ctx = { matrix: MATRIX };

  it("un formulario completo y coherente es válido", () => {
    const result = validateChartForm(validForm(), ctx);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it("exige título (no solo espacios)", () => {
    const result = validateChartForm(validForm({ title: "   " }), ctx);
    expect(result.valid).toBe(false);
    expect(result.errors.title).toBeTruthy();
  });

  it("exige categoría", () => {
    const result = validateChartForm(validForm({ categoryId: "" }), ctx);
    expect(result.errors.categoryId).toBeTruthy();
  });

  it("exige al menos una pregunta", () => {
    const result = validateChartForm(validForm({ sources: [] }), ctx);
    expect(result.errors.sources).toBeTruthy();
  });

  it("rechaza un gráfico que la matriz no permite para las fuentes", () => {
    const result = validateChartForm(
      validForm({
        sources: [source("multiple_choice", ["A", "B"])],
        chartKind: "donut",
      }),
      ctx,
    );
    expect(result.errors.chartKind).toBeTruthy();
  });

  it("rechaza una fuente bloqueada", () => {
    const result = validateChartForm(
      validForm({ sources: [source("yes_no", [], { selectable: false })] }),
      ctx,
    );
    expect(result.errors.sources).toBeTruthy();
  });

  it("numeric_with_unit exige estrategia", () => {
    const result = validateChartForm(
      validForm({
        sources: [source("numeric_with_unit", ["ha", "m2"])],
        chartKind: "histogram-by-unit",
        settings: {},
      }),
      ctx,
    );
    expect(result.errors.settings).toBeTruthy();
  });

  it("la normalización exige unidad destino y al menos un factor positivo", () => {
    const base = {
      sources: [source("numeric_with_unit", ["ha", "m2"])],
      chartKind: "histogram-normalized",
    };
    expect(
      validateChartForm(
        validForm({
          ...base,
          settings: { numericWithUnit: { strategy: "normalize" } },
        }),
        ctx,
      ).errors.settings,
    ).toBeTruthy();
    expect(
      validateChartForm(
        validForm({
          ...base,
          settings: {
            numericWithUnit: {
              strategy: "normalize",
              targetUnit: "ha",
              factors: { ha: 1, m2: 0.0001 },
            },
          },
        }),
        ctx,
      ).valid,
    ).toBe(true);
  });

  it("una fusión con opciones distintas exige confirmación", () => {
    const sources = [
      source("single_choice", ["A", "B"], { questionId: "q1" }),
      source("single_choice", ["A", "C"], { questionId: "q2" }),
    ];
    expect(
      validateChartForm(validForm({ sources, chartKind: "bars" }), ctx).errors
        .sources,
    ).toBeTruthy();
    expect(
      validateChartForm(
        validForm({
          sources,
          chartKind: "bars",
          settings: { optionsMismatchAck: true },
        }),
        ctx,
      ).valid,
    ).toBe(true);
  });

  it("la comparación solo se ofrece para tipos que la admiten", () => {
    const result = validateChartForm(
      validForm({
        sources: [source("numeric")],
        chartKind: "histogram",
        combineMode: "compare",
      }),
      ctx,
    );
    expect(result.errors.combineMode).toBeTruthy();
  });

  it("audiencia y layout solo admiten sus valores", () => {
    const result = validateChartForm(
      validForm({
        audience: "everyone" as "public",
        layout: "giant" as "normal",
      }),
      ctx,
    );
    expect(result.errors.audience).toBeTruthy();
    expect(result.errors.layout).toBeTruthy();
  });
});

// ── Reordenamiento accesible y aviso de caché ─────────────────────────────

describe("moveChart — reordenamiento con botones (subir / bajar)", () => {
  const ids = ["a", "b", "c"];

  it("subir intercambia con el anterior sin mutar la lista original", () => {
    expect(moveChart(ids, "b", "up")).toEqual(["b", "a", "c"]);
    expect(ids).toEqual(["a", "b", "c"]);
  });

  it("bajar intercambia con el siguiente", () => {
    expect(moveChart(ids, "b", "down")).toEqual(["a", "c", "b"]);
  });

  it("los extremos no se mueven fuera de la lista", () => {
    expect(moveChart(ids, "a", "up")).toEqual(ids);
    expect(moveChart(ids, "c", "down")).toEqual(ids);
  });
});

describe("aviso de caché del público (P22)", () => {
  it("el constructor avisa una demora de 5 minutos", () => {
    expect(PUBLIC_CACHE_MINUTES).toBe(5);
  });
});
