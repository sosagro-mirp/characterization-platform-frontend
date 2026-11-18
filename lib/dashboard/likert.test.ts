/**
 * Spec 109 (heredado de la auditoría 95 del 66) — la matriz Likert no pinta
 * una celda suprimida como 0 ni infla los tramos visibles.
 */
import { describe, expect, it } from "vitest";
import { buildDivergingRows } from "./likert";

describe("buildDivergingRows — celdas suprimidas", () => {
  it("con total, cada tramo visible se mide contra el total real y lo oculto queda aparte", () => {
    const [row] = buildDivergingRows([
      {
        questionId: "q1",
        label: "Ítem",
        distribution: [40, null, 20, 30, null],
        meanScore: 3.1,
        total: 100,
      },
    ]);
    const visible = row.segments.filter((s) => !s.suppressed);
    expect(visible.map((s) => s.percentage)).toEqual([40, 0, 20, 30, 0]);
    const hidden = row.segments.filter((s) => s.suppressed);
    expect(hidden).toHaveLength(1);
    expect(hidden[0].percentage).toBeCloseTo(10);
  });

  it("sin celdas ocultas y sin total, normaliza como antes", () => {
    const [row] = buildDivergingRows([
      { questionId: "q1", label: "Ítem", distribution: [1, 1, 1, 1, 0], meanScore: 2.5 },
    ]);
    expect(row.segments.map((s) => s.percentage)).toEqual([25, 25, 25, 25, 0]);
    expect(row.segments.some((s) => s.suppressed)).toBe(false);
  });
});
