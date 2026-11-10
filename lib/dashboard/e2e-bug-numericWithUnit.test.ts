/**
 * Bug `numeric_with_unit` en el dashboard público (spec/backlog.md).
 *
 * El backend agrega estas preguntas con un grupo por unidad. Aquí se prueba
 * la lógica pura que usa la gráfica: los bins del histograma y la elección
 * de la unidad que se muestra primero.
 */
import { describe, expect, it } from "vitest";
import { buildHistogramBins } from "./histogram";
import { defaultUnitIndex, hasUnitStats } from "./numericWithUnit";

describe("buildHistogramBins", () => {
  it("reparte los valores en bins de Sturges entre min y max", () => {
    const bins = buildHistogramBins([1, 2, 3, 4, 5, 6], 1, 6);
    expect(bins).toHaveLength(4);
    expect(bins.reduce((sum, bin) => sum + bin.count, 0)).toBe(6);
    expect(bins[bins.length - 1].count).toBeGreaterThan(0);
  });

  it("devuelve vacío sin valores o con todos los valores iguales", () => {
    expect(buildHistogramBins([], 0, 0)).toEqual([]);
    expect(buildHistogramBins([3, 3, 3], 3, 3)).toEqual([]);
  });
});

const group = (unit: string, count: number, withStats: boolean) => ({
  optionId: unit,
  unit,
  count,
  percentage: 0,
  average: withStats ? 1 : null,
  median: withStats ? 1 : null,
  q1: withStats ? 1 : null,
  q3: withStats ? 1 : null,
  min: withStats ? 1 : null,
  max: withStats ? 2 : null,
  stdDev: withStats ? 0.5 : null,
  distribution: withStats ? [1, 2] : undefined,
});

describe("numeric_with_unit — grupos por unidad", () => {
  it("un grupo sin estadísticas (bajo el umbral) no se grafica", () => {
    expect(hasUnitStats(group("m²", 2, false))).toBe(false);
    expect(hasUnitStats(group("ha", 6, true))).toBe(true);
  });

  it("muestra primero la primera unidad con estadísticas", () => {
    expect(defaultUnitIndex([group("m²", 2, false), group("ha", 6, true)])).toBe(1);
  });

  it("si ninguna unidad alcanza el umbral, muestra la primera", () => {
    expect(defaultUnitIndex([group("m²", 2, false), group("ha", 1, false)])).toBe(0);
  });
});
