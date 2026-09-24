import { describe, expect, it } from "vitest";
import {
  describeBlockReason,
  describePreview,
  type ProcessPreview,
} from "./processPreview";

function preview(over: Partial<ProcessPreview> = {}): ProcessPreview {
  return {
    surveyId: "s1",
    identity: { name: "Ana", documentId: "123", phone: null },
    document: { status: "new", farmerId: null, candidates: [] },
    farm: { action: "create", farmId: null, sharedCandidates: [] },
    crops: { resolved: [], unmapped: [] },
    fieldsToComplete: [],
    warnings: [],
    ...over,
  };
}

const farm = (action: ProcessPreview["farm"]["action"], farmId: string | null = null) => ({
  action,
  farmId,
  sharedCandidates: [
    { source: "farm" as const, farmId: "f1", surveyId: null, name: "La Esperanza", vereda: null },
  ],
});

describe("describePreview — finca según farm.action", () => {
  it("create exige elegir; complete y none no", () => {
    expect(describePreview(preview()).farmChoiceRequired).toBe(true);
    expect(describePreview(preview({ farm: farm("complete") })).farmChoiceRequired).toBe(false);
    expect(describePreview(preview({ farm: farm("none") })).farmChoiceRequired).toBe(false);
  });

  it("link expone la finca destino", () => {
    const d = describePreview(preview({ farm: farm("link", "f1") }));
    expect(d.farmAction).toBe("link");
    expect(d.linkedFarm).toEqual({ farmId: "f1", name: "La Esperanza" });
  });

  it("con complete el municipio no se exige si no hay missing_town", () => {
    const d = describePreview(preview({ farm: farm("complete") }));
    expect(d.requiresTown).toBe(false);
    expect(d.canProcess).toBe(true);
  });
});

describe("describePreview — advertencias", () => {
  it("conserva la traducción y agrega el detalle del backend", () => {
    const d = describePreview(
      preview({
        warnings: [
          { code: "area_converted", message: "Área convertida de 25000 m² a 2.5 ha" },
        ],
      }),
    );
    expect(d.warnings[0].message).toContain("hectáreas");
    expect(d.warnings[0].detail).toBe("Área convertida de 25000 m² a 2.5 ha");
  });

  it("sin mensaje del backend no hay detalle", () => {
    const d = describePreview(preview({ warnings: [{ code: "area_converted" }] }));
    expect(d.warnings[0].detail).toBeUndefined();
  });
});

describe("describeBlockReason", () => {
  const ok = {
    hasPreview: true,
    loading: false,
    requiresTown: false,
    farmChoiceRequired: true,
    farmMode: "create" as const,
  };
  it("null cuando no falta nada", () => {
    expect(describeBlockReason(ok)).toBeNull();
  });
  it("indica espera, municipio y finca", () => {
    expect(describeBlockReason({ ...ok, loading: true })).toMatch(/vista previa/);
    expect(describeBlockReason({ ...ok, requiresTown: true })).toMatch(/municipio/);
    expect(describeBlockReason({ ...ok, farmMode: "link" })).toMatch(/finca/);
  });
  it("no exige finca cuando no hay nada que elegir", () => {
    expect(
      describeBlockReason({ ...ok, farmChoiceRequired: false, farmMode: "link" }),
    ).toBeNull();
  });
});
