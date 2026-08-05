/**
 * e2e-066 — Curaduría pregunta a pregunta del dashboard público.
 *
 * Escrito junto con `spec/66_curaduria_preguntas_dashboard_publico.md`, antes
 * de la implementación: arranca EN ROJO (el módulo `./chartHint` todavía no
 * existe).
 *
 * El entorno de Vitest de este repositorio es `node` (ver `vitest.config.ts`),
 * así que aquí solo se prueba lógica pura: la resolución
 * `chartHint` → componente de gráfica y su fallback por tipo de pregunta
 * (criterios 5 y 7 del spec). La verificación visual de cada gráfica y de los
 * ajustes de estilo vive en
 * `docs/testing/test-066-curaduria-preguntas-dashboard.md`.
 */
import { describe, expect, it } from "vitest";
import {
  CHART_KINDS,
  resolveChartKind,
  type ChartKind,
} from "./chartHint";

describe("resolveChartKind — fallback por tipo de pregunta (criterio 7)", () => {
  it("sin chartHint, yes_no cae a dona", () => {
    expect(resolveChartKind({ questionType: "yes_no" })).toBe("donut");
  });

  it("sin chartHint, single_choice cae a barras verticales", () => {
    expect(resolveChartKind({ questionType: "single_choice" })).toBe("bars");
  });

  it("sin chartHint, multiple_choice cae a barras horizontales (nunca dona)", () => {
    const kind = resolveChartKind({ questionType: "multiple_choice" });
    expect(kind).toBe("horizontal-bars");
    expect(kind).not.toBe("donut");
  });

  it("sin chartHint, likert cae a barras apiladas divergentes", () => {
    expect(resolveChartKind({ questionType: "likert" })).toBe("diverging");
  });

  it("sin chartHint, numeric cae a histograma", () => {
    expect(resolveChartKind({ questionType: "numeric" })).toBe("histogram");
  });

  it("sin chartHint, numeric_with_unit cae a histograma normalizado por unidad", () => {
    expect(resolveChartKind({ questionType: "numeric_with_unit" })).toBe(
      "histogram-by-unit",
    );
  });

  it("un tipo desconocido resuelve al marcador de tipo no soportado, sin lanzar", () => {
    expect(() =>
      resolveChartKind({ questionType: "tipo_que_no_existe" }),
    ).not.toThrow();
    expect(resolveChartKind({ questionType: "tipo_que_no_existe" })).toBe(
      "unsupported",
    );
  });
});

describe("resolveChartKind — el chartHint del backend manda (criterio 5)", () => {
  it("un chartHint explícito gana sobre la gráfica por defecto del tipo", () => {
    expect(
      resolveChartKind({
        questionType: "multiple_choice",
        chartHint: "harvest-calendar",
      }),
    ).toBe("harvest-calendar");
  });

  it("un chartHint explícito gana también cuando coincide con el default", () => {
    expect(
      resolveChartKind({ questionType: "yes_no", chartHint: "donut" }),
    ).toBe("donut");
  });

  it("un chartHint desconocido no rompe: cae al comportamiento por tipo", () => {
    expect(
      resolveChartKind({
        questionType: "yes_no",
        chartHint: "grafica_inventada" as ChartKind,
      }),
    ).toBe("donut");
  });

  it("todo chartHint declarado como válido está en el catálogo CHART_KINDS", () => {
    expect(CHART_KINDS).toContain("donut");
    expect(CHART_KINDS).toContain("horizontal-bars");
    expect(CHART_KINDS).toContain("diverging");
    expect(CHART_KINDS).toContain("harvest-calendar");
    expect(new Set(CHART_KINDS).size).toBe(CHART_KINDS.length);
  });
});

describe("resolveChartKind — preguntas ocultas por curaduría (criterio 4)", () => {
  it("una pregunta marcada como oculta no resuelve a ninguna gráfica", () => {
    expect(resolveChartKind({ questionType: "yes_no", hidden: true })).toBe(
      "hidden",
    );
  });

  it("hidden gana sobre un chartHint explícito", () => {
    expect(
      resolveChartKind({
        questionType: "yes_no",
        chartHint: "donut",
        hidden: true,
      }),
    ).toBe("hidden");
  });
});
