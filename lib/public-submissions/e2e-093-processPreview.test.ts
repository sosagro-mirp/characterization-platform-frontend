/**
 * e2e-093 — Incorporación de los envíos del taller como productores: lógica
 * pura de la bandeja de envíos públicos.
 *
 * Escrito junto con `spec/93_incorporacion_envios_taller_productores.md`,
 * antes de la implementación: arranca EN ROJO. Los módulos
 * `./processPreview` y `../responses/formatResponseValue` todavía no existen
 * (los crea la Fase 4 del spec).
 *
 * El entorno de Vitest de este repositorio es `node`, así que aquí solo se
 * prueba lógica pura. El recorrido visual de la bandeja (panel de vista
 * previa, selectores, mensaje final con enlace) vive en
 * `docs/testing/test-093-incorporacion-envios-taller.md`.
 *
 * Cubre, del lado del cliente, el criterio 14 del spec (y la presentación de
 * los criterios 10, 12 y 13).
 *
 * La forma de la vista previa (`ProcessPreview`) es la misma que asume
 * `backend/test/e2e-093-incorporacion-envios-taller.e2e-spec.ts` para
 * `GET /api/surveys/:id/process-preview`. Si la
 * implementación del backend fija otros nombres de campo, se ajustan aquí y
 * en `./processPreview` en el mismo cambio.
 */
import { describe, expect, it } from "vitest";
import {
  buildProcessBody,
  describePreview,
  type ProcessPreview,
} from "./processPreview";
import { formatResponseValue } from "../responses/formatResponseValue";

const FARMER_ID = "550e8400-e29b-41d4-a716-446655440001";
const FARM_ID = "550e8400-e29b-41d4-a716-446655440002";
const TOWN_ID = "550e8400-e29b-41d4-a716-446655440003";

function preview(overrides: Partial<ProcessPreview> = {}): ProcessPreview {
  return {
    surveyId: "550e8400-e29b-41d4-a716-446655440009",
    identity: {
      name: "Spec93 Limpio",
      documentId: "900930011",
      phone: "3000000000",
    },
    document: { status: "new", farmerId: null, candidates: [] },
    farm: { action: "create", farmId: null, sharedCandidates: [] },
    crops: {
      resolved: [
        { cropId: "550e8400-e29b-41d4-a716-4466554400c1", name: "Cacao" },
        { cropId: "550e8400-e29b-41d4-a716-4466554400c2", name: "Café" },
      ],
      unmapped: ["Caucho"],
    },
    fieldsToComplete: [],
    warnings: [],
    ...overrides,
  };
}

// ─── criterio 14 — el documento se ve con su número ─────────────────────────

describe("formatResponseValue — respuestas en la bandeja y en la ficha", () => {
  it("numeric_with_unit muestra el número y la unidad, no solo la unidad", () => {
    const text = formatResponseValue({
      questionType: "numeric_with_unit",
      numericValue: 900930010,
      optionText: "CC",
      textValue: null,
      booleanValue: null,
    });
    expect(text).toContain("900930010");
    expect(text).toContain("CC");
  });

  it("un documento largo no se muestra en notación científica ni con decimales", () => {
    const text = formatResponseValue({
      questionType: "numeric_with_unit",
      numericValue: 1036123456,
      optionText: "CC",
      textValue: null,
      booleanValue: null,
    });
    expect(text).toContain("1036123456");
    expect(text).not.toMatch(/e\+|\.0/);
  });

  it("sí/no se muestra como Sí o No", () => {
    expect(
      formatResponseValue({
        questionType: "yes_no",
        numericValue: null,
        optionText: null,
        textValue: null,
        booleanValue: true,
      }),
    ).toBe("Sí");
  });

  it("sin valor muestra un guion", () => {
    expect(
      formatResponseValue({
        questionType: "open_text",
        numericValue: null,
        optionText: null,
        textValue: null,
        booleanValue: null,
      }),
    ).toBe("—");
  });
});

// ─── criterio 14 — lo que la vista previa le dice al administrador ─────────

describe("describePreview — lectura de la vista previa", () => {
  it("un envío limpio se puede procesar y anuncia un productor nuevo", () => {
    const d = describePreview(preview());
    expect(d.canProcess).toBe(true);
    expect(d.outcome).toBe("new_farmer");
    expect(d.requiresTown).toBe(false);
    expect(d.crops).toEqual(["Cacao", "Café"]);
    expect(d.unmappedCrops).toEqual(["Caucho"]);
  });

  it("misma persona anuncia un productor existente con enlace a su ficha", () => {
    const d = describePreview(
      preview({
        document: {
          status: "same_person_match",
          farmerId: FARMER_ID,
          candidates: [],
        },
        fieldsToComplete: [
          { entity: "farm", field: "area", value: 3 },
          { entity: "farm", field: "corregimiento", value: "Spec93 Corr" },
        ],
      }),
    );
    expect(d.outcome).toBe("existing_farmer");
    expect(d.farmerHref).toBe(`/admin/farmers/${FARMER_ID}`);
    expect(d.fieldsToComplete).toEqual(["farm.area", "farm.corregimiento"]);
  });

  it("una colisión exige resolución antes de procesar", () => {
    const d = describePreview(
      preview({
        document: {
          status: "collision",
          farmerId: null,
          candidates: [{ farmerId: FARMER_ID, name: "Spec93 Otro Nombre" }],
        },
      }),
    );
    expect(d.requiresResolution).toBe(true);
  });

  // criterio 10 — finca candidata: crear es la opción por defecto
  it("con finca candidata a compartida, la opción por defecto es crear una nueva", () => {
    const d = describePreview(
      preview({
        farm: {
          action: "create",
          farmId: null,
          sharedCandidates: [
            {
              source: "farm",
              farmId: FARM_ID,
              surveyId: null,
              name: "Spec93 La Arboleda",
              vereda: "spec93 vereda",
            },
          ],
        },
      }),
    );
    expect(d.farmCandidates).toHaveLength(1);
    expect(d.defaultFarmMode).toBe("create");
  });

  // criterio 12 — sin municipio, se pide en la bandeja
  it("sin municipio pide el selector y no deja procesar sin elegirlo", () => {
    const d = describePreview(
      preview({ warnings: [{ code: "missing_town" }] }),
    );
    expect(d.requiresTown).toBe(true);
    expect(d.canProcess).toBe(false);
  });

  // criterio 13 — advertencias legibles
  it("traduce cada advertencia a un mensaje en español", () => {
    const d = describePreview(
      preview({
        warnings: [
          { code: "respondent_not_producer" },
          { code: "duplicate_document_in_pending" },
          { code: "area_converted" },
          { code: "multi_value_truncated" },
        ],
      }),
    );
    expect(d.warnings).toHaveLength(4);
    for (const w of d.warnings) {
      expect(w.message.length).toBeGreaterThan(0);
      expect(w.message).not.toMatch(/_/);
    }
  });
});

// ─── cuerpo de process-public a partir de lo que elige el administrador ─────

describe("buildProcessBody — decisión enviada al backend", () => {
  it("por defecto crea la finca y no envía municipio", () => {
    expect(buildProcessBody({})).toEqual({ farm: { mode: "create" } });
  });

  it("vincular a una finca existente envía su id", () => {
    expect(buildProcessBody({ farmMode: "link", farmId: FARM_ID })).toEqual({
      farm: { mode: "link", farmId: FARM_ID },
    });
  });

  it("vincular sin finca elegida es un error de uso", () => {
    expect(() => buildProcessBody({ farmMode: "link" })).toThrow();
  });

  it("incluye municipio y resolución de colisión cuando se eligen", () => {
    expect(
      buildProcessBody({ townId: TOWN_ID, resolution: "same_person" }),
    ).toEqual({
      farm: { mode: "create" },
      townId: TOWN_ID,
      resolution: "same_person",
    });
  });
});
