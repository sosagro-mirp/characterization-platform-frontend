/**
 * e2e-043 — Rediseño del dashboard público: categorías, filtros globales y
 * vistas consolidadas.
 *
 * Escrito junto con `spec/43_rediseno_dashboard_publico_categorias_y_filtros_globales.md`,
 * antes de la implementación: arranca EN ROJO (los módulos `./filters`,
 * `./likert` y `./palette` todavía no existen).
 *
 * El entorno de Vitest de este repositorio es `node` (ver `vitest.config.ts`),
 * por eso aquí solo se prueba lógica pura: la resolución de vista y filtros
 * desde los `searchParams` (D6), el cálculo de la matriz Likert divergente
 * (hueco #1 del análisis de impacto) y la paleta categórica de datos (D8).
 * La verificación visual e interactiva vive en
 * `docs/testing/test-043-rediseno-dashboard-publico.md`.
 */
import { describe, expect, it } from "vitest";
import {
  buildDashboardQuery,
  clearDashboardFilters,
  parseDashboardParams,
} from "./filters";
import { buildDivergingRows } from "./likert";
import { CROP_COLORS, LIKERT_SCALE_COLORS, cropColor } from "./palette";

describe("parseDashboardParams — vista y navegación (criterios 1 y 2)", () => {
  it("sin parámetros resuelve la vista de resumen general", () => {
    const state = parseDashboardParams({});
    expect(state.view).toBe("overview");
    expect(state.categoryId).toBeUndefined();
  });

  it("resuelve la vista de categoría a partir de categoryId", () => {
    const state = parseDashboardParams({ view: "category", categoryId: "C1" });
    expect(state.view).toBe("category");
    expect(state.categoryId).toBe("C1");
  });

  it("ignora un categoryId fuera del rango C1..C15 y vuelve a overview", () => {
    const state = parseDashboardParams({ view: "category", categoryId: "C16" });
    expect(state.view).toBe("overview");
    expect(state.categoryId).toBeUndefined();
  });

  it("no acepta categoryId e instrumentId a la vez (D2: mutuamente excluyentes)", () => {
    const state = parseDashboardParams({
      categoryId: "C15",
      instrumentId: "3f1a5c9e-0000-4000-8000-000000000000",
    });
    expect(
      Boolean(state.categoryId) && Boolean(state.filters.instrumentId),
    ).toBe(false);
  });
});

describe("parseDashboardParams — filtros globales (criterio 4)", () => {
  it("lee los filtros heredados del spec 30", () => {
    const { filters } = parseDashboardParams({
      departmentId: "d-1",
      townId: "t-1",
      cropId: "c-1",
      actorTypeId: "a-1",
    });
    expect(filters).toMatchObject({
      departmentId: "d-1",
      townId: "t-1",
      cropId: "c-1",
      actorTypeId: "a-1",
    });
  });

  it("lee los filtros derivados de respuestas (D3)", () => {
    const { filters } = parseDashboardParams({
      gender: "F",
      ageRange: "30-45",
      educationLevel: "secundaria",
      connectivity: "baja",
      campaignId: "camp-1",
      dateFrom: "2026-01-01",
      dateTo: "2026-06-30",
    });
    expect(filters.ageRange).toBe("30-45");
    expect(filters.connectivity).toBe("baja");
    expect(filters.dateFrom).toBe("2026-01-01");
  });

  it("descarta valores vacíos en vez de propagarlos como cadena vacía", () => {
    const { filters } = parseDashboardParams({ departmentId: "", cropId: "c-1" });
    expect(filters.departmentId).toBeUndefined();
    expect(filters.cropId).toBe("c-1");
  });
});

describe("clearDashboardFilters — «Limpiar» conserva la vista (criterio 4)", () => {
  it("elimina todos los filtros pero mantiene view y categoryId", () => {
    const state = parseDashboardParams({
      view: "category",
      categoryId: "C15",
      departmentId: "d-1",
      ageRange: "30-45",
    });
    const cleared = clearDashboardFilters(state);

    expect(cleared.view).toBe("category");
    expect(cleared.categoryId).toBe("C15");
    expect(Object.values(cleared.filters).filter(Boolean)).toHaveLength(0);
  });

  it("la query resultante conserva la categoría y no arrastra filtros", () => {
    const cleared = clearDashboardFilters(
      parseDashboardParams({ view: "category", categoryId: "C15", cropId: "c-1" }),
    );
    const query = buildDashboardQuery(cleared);

    expect(query).toContain("categoryId=C15");
    expect(query).not.toContain("cropId");
  });
});

describe("buildDivergingRows — matriz Likert divergente (criterio 6)", () => {
  const items = [
    {
      questionId: "q-alertas",
      label: "Alertas fitosanitarias",
      distribution: [5, 9, 14, 40, 32],
      meanScore: 4.0,
    },
    {
      questionId: "q-pago",
      label: "Pagaría por servicio digital",
      distribution: [18, 21, 25, 24, 12],
      meanScore: 2.9,
    },
    {
      questionId: "q-precios",
      label: "Precios de mercado y ventas",
      distribution: [4, 7, 10, 44, 35],
      meanScore: 4.2,
    },
  ];

  it("ordena las filas por media descendente", () => {
    const rows = buildDivergingRows(items);
    expect(rows.map((r) => r.questionId)).toEqual([
      "q-precios",
      "q-alertas",
      "q-pago",
    ]);
  });

  it("cada fila expone los 5 tramos que suman 100 %", () => {
    for (const row of buildDivergingRows(items)) {
      expect(row.segments).toHaveLength(5);
      const total = row.segments.reduce((sum, s) => sum + s.percentage, 0);
      expect(total).toBeCloseTo(100, 1);
    }
  });

  it("asigna a cada tramo el color de la escala Likert en orden", () => {
    const [row] = buildDivergingRows(items);
    expect(row.segments.map((s) => s.color)).toEqual(LIKERT_SCALE_COLORS);
  });

  it("normaliza distribuciones que llegan como conteos, no como porcentajes", () => {
    const [row] = buildDivergingRows([
      {
        questionId: "q-conteos",
        label: "Con conteos crudos",
        distribution: [1, 1, 2, 3, 3],
        meanScore: 3.6,
      },
    ]);
    const total = row.segments.reduce((sum, s) => sum + s.percentage, 0);
    expect(total).toBeCloseTo(100, 1);
    expect(row.segments[0].percentage).toBeCloseTo(10, 1);
  });

  it("ignora ítems sin media (suprimidos) en vez de colocarlos al final", () => {
    const rows = buildDivergingRows([
      ...items,
      {
        questionId: "q-suprimido",
        label: "Suprimido",
        distribution: [],
        meanScore: null,
      },
    ]);
    expect(rows.map((r) => r.questionId)).not.toContain("q-suprimido");
  });
});

describe("palette — paleta categórica de datos (D8, criterio 8)", () => {
  it("define un color por cada uno de los cuatro cultivos del proyecto", () => {
    expect(Object.keys(CROP_COLORS).sort()).toEqual([
      "cacao",
      "cafe",
      "canamo",
      "cannabis",
    ]);
  });

  it("resuelve el color de cultivo por nombre, con y sin tildes", () => {
    expect(cropColor("Café")).toBe(CROP_COLORS.cafe);
    expect(cropColor("cafe")).toBe(CROP_COLORS.cafe);
    expect(cropColor("Cáñamo")).toBe(CROP_COLORS.canamo);
  });

  it("devuelve un color de reserva para un cultivo desconocido, sin lanzar", () => {
    expect(() => cropColor("Aguacate")).not.toThrow();
    expect(cropColor("Aguacate")).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it("la escala Likert tiene 5 niveles fijos, iguales en claro y oscuro", () => {
    expect(LIKERT_SCALE_COLORS).toHaveLength(5);
    for (const color of LIKERT_SCALE_COLORS) {
      expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});
