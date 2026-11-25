/**
 * Bug (2026-11-25, TC-111-009 en producción): la nota de privacidad de la
 * leyenda del mapa decía «menos de 5 unidades» también en el mapa de
 * preguntas «Departamento», cuya unidad es «respuestas». La nota debe seguir
 * la unidad de la fuente del gráfico.
 */
import { describe, expect, it } from "vitest";
import { SUPPRESSION_LEGEND_NOTE, suppressionNoteFor, unitFor } from "./departmentMap";

describe("bug — la nota de privacidad del mapa usa la unidad de la fuente", () => {
  it("en un mapa de preguntas dice «respuestas», no «unidades»", () => {
    const note = suppressionNoteFor(unitFor({ sourceKind: "questions" }));
    expect(note).toContain("menos de 5 respuestas");
    expect(note).not.toContain("unidades");
  });

  it("con unidades productivas dice «unidades productivas» y conserva el resto del texto de A1", () => {
    const note = suppressionNoteFor(
      unitFor({ sourceKind: "entity_metric", metricKey: "production_units_by_department" }),
    );
    expect(note).toBe(
      SUPPRESSION_LEGEND_NOTE.replace("menos de 5 unidades", "menos de 5 unidades productivas"),
    );
  });

  it.each([
    ["farms_by_department", "menos de 5 fincas"],
    ["farmers_by_department", "menos de 5 productores"],
  ])("métrica %s → «%s»", (metricKey, expected) => {
    expect(suppressionNoteFor(unitFor({ sourceKind: "entity_metric", metricKey }))).toContain(expected);
  });
});
