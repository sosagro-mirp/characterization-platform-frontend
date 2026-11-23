/**
 * Spec 109 — ayudas puras del constructor de dashboard sobre la matriz que
 * sirve el backend (`GET /api/dashboard/builder/compat-matrix`, P10 del 108).
 *
 * La validación definitiva la hace el backend al guardar y al publicar; esto
 * solo guía la UI: qué gráficos ofrecer, por qué una pregunta no se puede
 * usar, qué opciones difieren al fusionar y qué falta en el formulario.
 * Las condiciones de opciones (dona ≤ 6, mapa de departamentos, calendario de
 * 12 meses) replican las de `backend/src/dashboard/dashboard-chart-compat.ts`.
 */

export type CombineMode = "merge" | "compare";
export type ChartAudience = "public" | "private";
export type ChartLayout = "normal" | "wide";

export type ChartCompatMatrix = {
  questionType: string;
  charts: string[];
  combineModes: CombineMode[];
}[];

/** Una pregunta elegida como fuente, con lo necesario para validar en la UI. */
export interface ChartSource {
  questionId: string;
  questionType: string;
  /** Textos de las opciones (vacío en sí/no y numéricos). */
  options: string[];
  selectable: boolean;
  blockedReason?: string | null;
  /** Spec 109 (Fase 6): dato sensible, solo para gráficos de audiencia privada. */
  privateOnlyReason?: string | null;
}

export interface NumericWithUnitSettings {
  strategy?: "by_unit" | "normalize";
  targetUnit?: string;
  factors?: Record<string, number>;
}

export interface ChartSettings {
  optionsMismatchAck?: boolean;
  numericWithUnit?: NumericWithUnitSettings;
}

export interface ChartFormValues {
  title: string;
  subtitle: string;
  categoryId: string;
  audience: ChartAudience;
  layout: ChartLayout;
  combineMode: CombineMode;
  chartKind: string;
  /** Todas las fuentes del gráfico (en comparación, las de todas las series). */
  sources: ChartSource[];
  settings: ChartSettings;
}

export type ChartFormField =
  | "title"
  | "categoryId"
  | "audience"
  | "layout"
  | "combineMode"
  | "chartKind"
  | "sources"
  | "settings";

export interface ChartFormValidation {
  valid: boolean;
  errors: Partial<Record<ChartFormField, string>>;
}

/** P22: el dashboard público se cachea 5 minutos. */
export const PUBLIC_CACHE_MINUTES = 5;

/** Gráficos admitidos en comparación, por tipo (P9 del 108). */
const COMPARE_CHARTS: Record<string, string[]> = {
  yes_no: ["yes-percent-bars"],
  likert: ["diverging"],
};

const MAX_DONUT_OPTIONS = 6;

const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

/** Departamentos de Colombia (normalizados), para el mapa. */
const DEPARTMENTS = [
  "amazonas",
  "antioquia",
  "arauca",
  "atlantico",
  "bogota",
  "bogota d.c.",
  "bolivar",
  "boyaca",
  "caldas",
  "caqueta",
  "casanare",
  "cauca",
  "cesar",
  "choco",
  "cordoba",
  "cundinamarca",
  "guainia",
  "guaviare",
  "huila",
  "la guajira",
  "magdalena",
  "meta",
  "narino",
  "norte de santander",
  "putumayo",
  "quindio",
  "risaralda",
  "san andres y providencia",
  "santander",
  "sucre",
  "tolima",
  "valle del cauca",
  "vaupes",
  "vichada",
];

/** Opciones de escape que no cuentan contra la condición del calendario. */
const ESCAPE_OPTION = /^(no aplica|no sabe|ns\/nr|otros?)$/i;

const normalize = (text: string): string =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();

/** Etiquetas en español de cada gráfico, para el selector. */
export const CHART_KIND_LABELS: Record<string, string> = {
  donut: "Dona",
  "yes-percent-bars": "Barras «% Sí»",
  bars: "Barras",
  "horizontal-bars": "Barras horizontales",
  map: "Mapa por departamento",
  "harvest-calendar": "Calendario de cosecha",
  diverging: "Barras divergentes (Likert)",
  histogram: "Histograma",
  "histogram-by-unit": "Histograma por unidad",
  "histogram-normalized": "Histograma normalizado",
};

export function chartKindLabel(kind: string): string {
  return CHART_KIND_LABELS[kind] ?? kind;
}

function optionConditionHolds(
  chartKind: string,
  questionType: string,
  options: string[],
  departmentNames?: string[],
): boolean {
  if (chartKind === "donut" && questionType === "single_choice") {
    return options.length <= MAX_DONUT_OPTIONS;
  }
  if (chartKind === "map") {
    const known = (departmentNames ?? DEPARTMENTS).map(normalize);
    // «Otros» es la opción de escape de las preguntas de departamento.
    const named = options.filter((t) => !/^otros?$/i.test(t.trim()));
    return named.length > 0 && named.every((t) => known.includes(normalize(t)));
  }
  if (chartKind === "harvest-calendar") {
    // «No aplica» y similares se ignoran, igual que en el backend.
    const months = options.filter((t) => !ESCAPE_OPTION.test(t.trim()));
    const set = new Set(months.map(normalize));
    return months.length === 12 && MONTHS.every((m) => set.has(m));
  }
  return true;
}

/** El tipo común de las fuentes, o `null` si no hay o si mezclan tipos. */
export function commonQuestionType(sources: ChartSource[]): string | null {
  if (sources.length === 0) return null;
  const type = sources[0].questionType;
  return sources.every((s) => s.questionType === type) ? type : null;
}

/**
 * Gráficos que se pueden ofrecer para las fuentes elegidas, en el orden de la
 * matriz (el primero es el default). Vacío sin fuentes, con una bloqueada,
 * con tipos mezclados o con un tipo sin gráfico.
 */
export function allowedChartKinds(
  matrix: ChartCompatMatrix,
  sources: ChartSource[],
  opts: { departmentNames?: string[]; combineMode?: CombineMode } = {},
): string[] {
  if (sources.length === 0) return [];
  if (sources.some((s) => !s.selectable)) return [];
  const type = commonQuestionType(sources);
  if (!type) return [];
  const row = matrix.find((r) => r.questionType === type);
  if (!row) return [];
  let charts = row.charts;
  if (opts.combineMode === "compare") {
    const cmp = COMPARE_CHARTS[type] ?? [];
    charts = charts.filter((c) => cmp.includes(c));
  }
  const options = sources[0].options;
  return charts.filter((c) =>
    optionConditionHolds(c, type, options, opts.departmentNames),
  );
}

/** Modos de combinación que admite el tipo de las fuentes. */
export function allowedCombineModes(
  matrix: ChartCompatMatrix,
  questionType: string | null,
): CombineMode[] {
  if (!questionType) return ["merge"];
  return (
    matrix.find((r) => r.questionType === questionType)?.combineModes ?? [
      "merge",
    ]
  );
}

const GENERIC_BLOCK_REASON =
  "Esta pregunta no se puede usar en el dashboard (privacidad o tipo sin gráfico).";

/** Motivo por el que una pregunta no se puede elegir, o `null` si se puede. */
export function questionBlockReason(question: {
  selectable: boolean;
  blockedReason?: string | null;
}): string | null {
  if (question.selectable) return null;
  const reason = question.blockedReason?.trim();
  return reason ? reason : GENERIC_BLOCK_REASON;
}

export interface OptionsDifference {
  hasDifferences: boolean;
  /** Opciones que solo tiene cada pregunta, por `questionId` (solo las que difieren). */
  onlyIn: Record<string, string[]>;
}

/** Diferencias de opciones entre las fuentes de una fusión (sin importar el orden). */
export function optionsDifference(sources: ChartSource[]): OptionsDifference {
  const onlyIn: Record<string, string[]> = {};
  if (sources.length < 2) return { hasDifferences: false, onlyIn };
  const sets = sources.map((s) => new Set(s.options));
  sources.forEach((s, i) => {
    const own = s.options.filter((opt) =>
      sets.some((other, j) => j !== i && !other.has(opt)),
    );
    if (own.length > 0) onlyIn[s.questionId] = own;
  });
  return { hasDifferences: Object.keys(onlyIn).length > 0, onlyIn };
}

/** Tipos cuyas opciones deben coincidir para fusionar (P12 del 108). */
const OPTION_MATCH_TYPES = new Set([
  "single_choice",
  "multiple_choice",
  "compliance",
]);

export const PRIVATE_ONLY_AUDIENCE_ERROR =
  "Hay datos sensibles entre las fuentes: el gráfico tiene que ser de audiencia privada.";

/** Motivos (sin repetir) por los que las fuentes solo admiten audiencia privada. */
export function privateOnlyReasons(
  sources: { privateOnlyReason?: string | null }[],
): string[] {
  const reasons = sources
    .map((s) => s.privateOnlyReason?.trim())
    .filter((r): r is string => !!r);
  return [...new Set(reasons)];
}

/** Código con el que el backend rechaza un gráfico público con fuentes de dato sensible. */
export const SOURCE_PRIVATE_ONLY_CODE = "DASHBOARD_SOURCE_PRIVATE_ONLY";

/** ¿El cuerpo de un error de la API es el rechazo por «solo audiencia privada»? */
export function isPrivateOnlyErrorBody(body: unknown): boolean {
  return (
    typeof body === "object" &&
    body !== null &&
    (body as { code?: unknown }).code === SOURCE_PRIVATE_ONLY_CODE
  );
}

/**
 * ¿Hay conflicto entre la audiencia y las fuentes? Un gráfico público no puede
 * usar preguntas ni métricas de dato sensible (spec 109, Fase 6).
 */
export function hasPrivateOnlyConflict(input: {
  audience: ChartAudience;
  sources?: { privateOnlyReason?: string | null }[];
  metric?: { privateOnlyReason?: string | null } | null;
}): boolean {
  if (input.audience !== "public") return false;
  if (input.metric?.privateOnlyReason?.trim()) return true;
  return privateOnlyReasons(input.sources ?? []).length > 0;
}

/** Validaciones del formulario del constructor (criterio 11). */
export function validateChartForm(
  values: ChartFormValues,
  ctx: { matrix: ChartCompatMatrix; departmentNames?: string[] },
): ChartFormValidation {
  const errors: ChartFormValidation["errors"] = {};

  if (!values.title.trim()) errors.title = "Escribe un título.";
  if (!values.categoryId) errors.categoryId = "Elige una categoría.";
  if (values.audience !== "public" && values.audience !== "private") {
    errors.audience = "La audiencia debe ser pública o privada.";
  } else if (
    hasPrivateOnlyConflict({ audience: values.audience, sources: values.sources })
  ) {
    errors.audience = PRIVATE_ONLY_AUDIENCE_ERROR;
  }
  if (values.layout !== "normal" && values.layout !== "wide") {
    errors.layout = "El ancho debe ser normal o ancho.";
  }

  const { sources } = values;
  const type = commonQuestionType(sources);
  if (sources.length === 0) {
    errors.sources = "Elige al menos una pregunta.";
  } else if (sources.some((s) => !s.selectable)) {
    errors.sources =
      "Hay preguntas que no se pueden usar; quítalas para continuar.";
  } else if (!type) {
    errors.sources = "Todas las preguntas deben ser del mismo tipo.";
  } else if (
    values.combineMode === "merge" &&
    OPTION_MATCH_TYPES.has(type) &&
    optionsDifference(sources).hasDifferences &&
    values.settings.optionsMismatchAck !== true
  ) {
    errors.sources =
      "Las preguntas tienen opciones distintas: confirma que quieres fusionarlas.";
  } else if (
    type === "likert" &&
    sources.some((s) => s.options.length !== sources[0].options.length)
  ) {
    errors.sources =
      "Las preguntas Likert deben tener el mismo número de niveles.";
  }

  if (type && !allowedCombineModes(ctx.matrix, type).includes(values.combineMode)) {
    errors.combineMode = "Este tipo de pregunta no admite comparación.";
  }

  if (!errors.sources && !errors.combineMode) {
    const allowed = allowedChartKinds(ctx.matrix, sources, {
      departmentNames: ctx.departmentNames,
      combineMode: values.combineMode,
    });
    if (!allowed.includes(values.chartKind)) {
      errors.chartKind = "Ese gráfico no está permitido para estas preguntas.";
    }
  }

  if (type === "numeric_with_unit") {
    const nwu = values.settings.numericWithUnit;
    const normalize =
      values.chartKind === "histogram-normalized" ||
      nwu?.strategy === "normalize";
    if (!nwu?.strategy) {
      errors.settings = "Elige cómo tratar las unidades.";
    } else if (normalize) {
      const factors = Object.values(nwu.factors ?? {});
      if (!nwu.targetUnit) {
        errors.settings = "Elige la unidad destino.";
      } else if (
        factors.length === 0 ||
        factors.some((f) => !Number.isFinite(f) || f <= 0)
      ) {
        errors.settings =
          "Cada factor de conversión debe ser un número positivo.";
      }
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

/** Sube o baja un gráfico una posición; en los bordes no cambia nada. */
export function moveChart(
  ids: string[],
  id: string,
  direction: "up" | "down",
): string[] {
  const index = ids.indexOf(id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= ids.length) return [...ids];
  const next = [...ids];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
