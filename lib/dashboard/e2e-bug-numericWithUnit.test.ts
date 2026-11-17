/**
 * Bug `numeric_with_unit` en el dashboard público (spec/backlog.md).
 *
 * El backend agrega estas preguntas con un grupo por unidad. Aquí se prueba
 * la lógica pura que usa la gráfica: la elección de la unidad que se muestra
 * primero (spec 107: los intervalos los calcula el backend).
 */
import { describe, expect, it } from "vitest";
import { defaultUnitIndex, hasUnitStats } from "./numericWithUnit";

const group = (unit: string, count: number, withStats: boolean) => ({
  optionId: unit,
  unit,
  count: withStats ? count : null,
  percentage: withStats ? 0 : null,
  suppressed: !withStats,
  average: withStats ? 1 : null,
  median: withStats ? 1 : null,
  q1: withStats ? 1 : null,
  q3: withStats ? 1 : null,
  stdDev: withStats ? 0.5 : null,
  bins: [],
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
