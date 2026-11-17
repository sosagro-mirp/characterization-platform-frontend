/**
 * e2e-107 — Spec 107 «Endurecer la privacidad del dashboard», frontend.
 * `spec/107_endurecer_privacidad_dashboard.md` (raíz del ecosistema). Cubre la
 * parte automatizable del criterio 10; la verificación visual de las gráficas
 * vive en `docs/testing/test-107-endurecer-privacidad-dashboard.md`.
 *
 * Escrito junto con el spec, antes de la implementación: arranca EN ROJO.
 * Hoy `histogram.ts` calcula los intervalos en el cliente a partir de
 * `distribution`/`min`/`max` (`buildHistogramBins`) y no existe
 * `binsToHistogram`; `hasUnitStats` exige `min`/`max`; `yesNoToBarDatum` no
 * conoce celdas suprimidas; las gráficas muestran «Mín»/«Máx» y bigotes, y el
 * dashboard acepta `instrumentId`. Los módulos se cargan con `import()`
 * dinámico para que el rojo sea un fallo de aserción y no de import.
 *
 * ── Contrato tras el spec 107 (el mismo que fija el e2e del backend) ────────
 * `app/(dashboard)/types.ts`
 *   - `AggregationBin { from: number | null; to: number | null;
 *       count: number | null; percentage: number | null; suppressed: boolean }`
 *     (`from: null` = «menos de `to`»; `to: null` = «`from` o más»).
 *   - `AggregationNumeric` y `AggregationUnitGroup`: `bins: AggregationBin[]`;
 *     sin `distribution`, `min` ni `max`.
 *   - `AggregationYesNo`: `yesCount`, `noCount`, `yesPercentage`,
 *     `noPercentage` anulables y `yesSuppressed`, `noSuppressed`.
 * `lib/dashboard/histogram.ts`
 *   - `binsToHistogram(bins: AggregationBin[]): HistogramBar[]`, con
 *     `HistogramBar { label: string; count: number | null;
 *       percentage: number; suppressed: boolean }`: adapta los intervalos del
 *     backend; un intervalo suprimido usa `SUPPRESSED_BAR_PLACEHOLDER`, como
 *     `toBarDatum` en `suppressedOption.ts`.
 *   - Ya no exporta `buildHistogramBins` (el cliente no calcula intervalos).
 * `lib/dashboard/numericWithUnit.ts`
 *   - `hasUnitStats` no depende de `min`/`max`.
 * `lib/dashboard/suppressedOption.ts`
 *   - `yesNoToBarDatum` marca suprimida la barra si la celda «Sí» lo está
 *     (por la supresión complementaria, llegan las dos suprimidas o ninguna).
 * `lib/dashboard/filters.ts`
 *   - `parseDashboardParams` ignora `instrumentId`; `buildDashboardQuery` no
 *     lo emite.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import type { DashboardFilters, DashboardQuestion } from "@/app/(dashboard)/types";
import { buildDashboardQuery, parseDashboardParams } from "./filters";
import { SUPPRESSED_BAR_PLACEHOLDER, yesNoToBarDatum } from "./suppressedOption";
import { hasUnitStats } from "./numericWithUnit";

interface Bin {
  from: number | null;
  to: number | null;
  count: number | null;
  percentage: number | null;
  suppressed: boolean;
}

interface HistogramBar {
  label: string;
  count: number | null;
  percentage: number;
  suppressed: boolean;
}

interface HistogramModule {
  binsToHistogram?: (bins: Bin[]) => HistogramBar[];
  buildHistogramBins?: unknown;
}

async function loadHistogram(): Promise<HistogramModule> {
  const specifier = "./histogram";
  return (await import(/* @vite-ignore */ specifier)) as HistogramModule;
}

const ROOT = resolve(__dirname, "../..");
const source = (rel: string) => readFileSync(resolve(ROOT, rel), "utf8");

const BINS: Bin[] = [
  { from: null, to: 45, count: 6, percentage: 30, suppressed: false },
  { from: 45, to: 50, count: null, percentage: null, suppressed: true },
  { from: 50, to: 55, count: 8, percentage: 40, suppressed: false },
  { from: 55, to: null, count: 6, percentage: 30, suppressed: false },
];

describe("Spec 107 — criterio 10: histogramas desde los intervalos del backend", () => {
  it("el cliente ya no calcula intervalos a partir de valores crudos", async () => {
    const histogram = await loadHistogram();
    expect(typeof histogram.binsToHistogram).toBe("function");
    expect("buildHistogramBins" in histogram).toBe(false);
  });

  it("los extremos abiertos se rotulan «Menos de x» y «x o más», sin mínimo ni máximo", async () => {
    const { binsToHistogram } = await loadHistogram();
    const bars = binsToHistogram!(BINS);
    expect(bars).toHaveLength(BINS.length);
    expect(bars[0].label).toMatch(/^menos de 45$/i);
    expect(bars[bars.length - 1].label).toMatch(/^55 o más$/i);
    expect(bars[2].label).toContain("50");
    expect(bars[2].label).toContain("55");
    // Un intervalo abierto no inventa el límite que no tiene.
    expect(bars[0].label).not.toMatch(/null|undefined|NaN|-?Infinity/);
    expect(bars[bars.length - 1].label).not.toMatch(/null|undefined|NaN|-?Infinity/);
  });

  it("un intervalo suprimido se dibuja con el placeholder, nunca como 0 ni omitido", async () => {
    const { binsToHistogram } = await loadHistogram();
    const suppressed = binsToHistogram!(BINS)[1];
    expect(suppressed.suppressed).toBe(true);
    expect(suppressed.count).toBeNull();
    expect(suppressed.percentage).toBe(SUPPRESSED_BAR_PLACEHOLDER);

    const visible = binsToHistogram!(BINS)[2];
    expect(visible.suppressed).toBe(false);
    expect(visible.count).toBe(8);
    expect(visible.percentage).toBe(40);
  });

  it("un grupo por unidad tiene estadísticas sin min ni max", () => {
    const group = {
      optionId: "ha",
      unit: "hectáreas",
      count: 12,
      percentage: 100,
      suppressed: false,
      average: 3.2,
      median: 3,
      q1: 2,
      q3: 4,
      stdDev: 1.1,
      bins: BINS,
    };
    expect(hasUnitStats(group as unknown as Parameters<typeof hasUnitStats>[0])).toBe(true);
  });

  it("las gráficas numéricas no muestran Mín, Máx ni bigotes min–max", () => {
    for (const file of [
      "app/(dashboard)/components/charts/NumericChart.tsx",
      "app/(dashboard)/components/charts/NumericWithUnitChart.tsx",
      "app/(dashboard)/components/OverviewView.tsx",
    ]) {
      const text = source(file);
      expect({ file, min: /Mín\b/.test(text) }).toEqual({ file, min: false });
      expect({ file, max: /Máx\b/.test(text) }).toEqual({ file, max: false });
      expect({ file, whisker: /whisker/i.test(text) }).toEqual({ file, whisker: false });
      expect({ file, raw: /\bdistribution\b/.test(text) }).toEqual({ file, raw: false });
    }
  });
});

describe("Spec 107 — criterio 10: Sí/No con celda suprimida", () => {
  // Supresión complementaria (criterio 13 del spec): si una celda se suprime,
  // el backend suprime también la otra. Nunca llega una sola celda oculta.
  const yesNoQuestion = (
    aggregation: Record<string, unknown>,
    answeredCount: number,
  ): DashboardQuestion =>
    ({
      questionId: "q-1",
      questionText: "¿Cultiva actualmente café?",
      questionType: "yes_no",
      sectionName: "S",
      systemField: null,
      chartHint: null,
      isInverted: false,
      answeredCount,
      suppressed: false,
      aggregation: { type: "yes_no", ...aggregation },
    }) as unknown as DashboardQuestion;

  // 10 «Sí» y 1 «No»: el «No» queda bajo el umbral y arrastra al «Sí».
  const bothSuppressed = yesNoQuestion(
    {
      yesCount: null,
      noCount: null,
      yesPercentage: null,
      noPercentage: null,
      yesSuppressed: true,
      noSuppressed: true,
    },
    11,
  );
  // 7 «Sí» y 5 «No»: ambas celdas visibles.
  const bothVisible = yesNoQuestion(
    {
      yesCount: 7,
      noCount: 5,
      yesPercentage: 58.33,
      noPercentage: 41.67,
      yesSuppressed: false,
      noSuppressed: false,
    },
    12,
  );

  it("con las dos celdas suprimidas, la barra se marca oculta y no muestra 0", () => {
    const datum = yesNoToBarDatum(bothSuppressed, "Café");
    expect(datum.suppressed).toBe(true);
    expect(datum.count).toBeNull();
    expect(datum.count).not.toBe(0);
    expect(datum.percentage).toBe(SUPPRESSED_BAR_PLACEHOLDER);
  });

  it("con las dos celdas visibles, el «Sí» se muestra normal (control)", () => {
    const datum = yesNoToBarDatum(bothVisible, "Café");
    expect(datum.suppressed).toBe(false);
    expect(datum.count).toBe(7);
    expect(datum.percentage).toBe(58.33);
  });

  it("la gráfica Sí/No contempla celdas suprimidas", () => {
    expect(source("app/(dashboard)/components/charts/YesNoChart.tsx")).toMatch(
      /yesSuppressed|noSuppressed/,
    );
  });
});

describe("Spec 107 — criterio 10: sin navegación pública por instrumento", () => {
  it("un enlace con instrumentId se abre sin ese filtro", () => {
    const state = parseDashboardParams({
      instrumentId: "11111111-1111-4111-8111-111111111111",
      departmentId: "d-1",
    });
    expect(state.filters).toEqual({ departmentId: "d-1" });
    expect(state.view).toBe("overview");
  });

  it("la consulta generada nunca lleva instrumentId", () => {
    const filters = {
      instrumentId: "11111111-1111-4111-8111-111111111111",
      departmentId: "d-1",
    } as unknown as DashboardFilters;
    const query = buildDashboardQuery({ view: "overview", filters });
    expect(query).not.toContain("instrumentId");
    expect(query).toContain("departmentId=d-1");
  });

  it("las consultas públicas del dashboard no envían instrumentId", () => {
    expect(source("app/(dashboard)/api.ts")).not.toMatch(/["']instrumentId["']/);
    expect(source("app/(dashboard)/dashboard/page.tsx")).not.toMatch(/filters\.instrumentId/);
    expect(source("app/(dashboard)/components/GlobalFilterBar.tsx")).not.toMatch(
      /filters\.instrumentId/,
    );
  });
});
