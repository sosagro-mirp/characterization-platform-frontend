/**
 * e2e-101 — Spec 101 «Ficha y lista de productores por cobertura»: resolución
 * de discrepancias desde la ficha (funciones puras).
 *
 * Escrito junto con el spec, antes de la implementación: arranca EN ROJO.
 * Cubre C12, C13 y C16. Lo visual (diálogo, 409, recarga, bloqueo con «Datos»
 * sucio: C10, C11, C14, C15) vive en el `test-101` manual (raíz del ecosistema).
 *
 * Import dinámico por el mismo motivo que en `e2e-094-farmerFarms.test.ts`.
 *
 * ── Contrato que `lib/farmers/discrepancyActions.ts` debe exponer ──────────
 *
 * Las discrepancias son las de `GET /api/farmers/:farmerId/discrepancies` con
 * los campos que suma el spec 100: `liveValue`, `isStale`, `canApply` y, para
 * `townId`, `liveLabel`, `currentLabel` y `submittedLabel`.
 *
 * - `allowedDiscrepancyActions(d: EnrichedDiscrepancy): DiscrepancyAction[]`
 *   `["apply", "dismiss"]` si se puede aplicar; solo `["dismiss"]` si
 *   `canApply` es falso o `entityType === "farmer_farm"` (aunque `canApply`
 *   llegara verdadero). Una discrepancia no abierta no ofrece acciones (`[]`).
 *
 * - `discrepancyValueLabels(d: EnrichedDiscrepancy):
 *     { currentText: string; submittedText: string; liveText: string }`
 *   Textos legibles; vacío o nulo → «—». Para `townId` usa `currentLabel`,
 *   `submittedLabel` y `liveLabel` en vez del id; si falta la etiqueta, cae en el
 *   valor crudo.
 *
 * - `applyConfirmationText(d: EnrichedDiscrepancy,
 *     context?: { farmFarmerCount?: number }): string`
 *   Pregunta de confirmación que nombra el campo y el valor propuesto. Si
 *   `isStale`, advierte que el dato cambió desde que se registró la diferencia
 *   y muestra el valor vivo (`liveText`). Si la discrepancia es de finca y
 *   `farmFarmerCount > 1`, advierte que el cambio afecta a los demás
 *   productores de la finca (nombra el número de productores).
 *
 * Tipos locales y mínimos; la implementación los define con estos nombres de campo.
 */
import { describe, expect, it } from "vitest";

type DiscrepancyAction = "apply" | "dismiss";

interface EnrichedDiscrepancy {
  discrepancyId: string;
  entityType: "farmer" | "farm" | "farmer_farm";
  farmerId: string | null;
  farmId: string | null;
  field: string;
  systemField: string | null;
  currentValue: unknown;
  submittedValue: unknown;
  surveyId: string;
  status: "open" | "applied" | "dismissed";
  createdAt: string;
  liveValue: unknown;
  isStale: boolean;
  canApply: boolean;
  liveLabel?: string | null;
  currentLabel?: string | null;
  submittedLabel?: string | null;
}

interface DiscrepancyActionsModule {
  allowedDiscrepancyActions(d: EnrichedDiscrepancy): DiscrepancyAction[];
  discrepancyValueLabels(d: EnrichedDiscrepancy): {
    currentText: string;
    submittedText: string;
    liveText: string;
  };
  applyConfirmationText(
    d: EnrichedDiscrepancy,
    context?: { farmFarmerCount?: number },
  ): string;
}

async function loadActions(): Promise<DiscrepancyActionsModule> {
  const specifier = "./discrepancyActions";
  return (await import(
    /* @vite-ignore */ specifier
  )) as DiscrepancyActionsModule;
}

function discrepancy(
  partial: Partial<EnrichedDiscrepancy>,
): EnrichedDiscrepancy {
  return {
    discrepancyId: "d1",
    entityType: "farm",
    farmerId: "farmer-1",
    farmId: "farm-1",
    field: "vereda",
    systemField: "farm.vereda",
    currentValue: "La Palma",
    submittedValue: "El Retiro",
    surveyId: "s1",
    status: "open",
    createdAt: "2026-10-20T10:00:00.000Z",
    liveValue: "La Palma",
    isStale: false,
    canApply: true,
    ...partial,
  };
}

const TOWN_IDS = {
  andes: "0b6f3f0e-0000-4000-8000-000000000001",
  jardin: "0b6f3f0e-0000-4000-8000-000000000002",
  betania: "0b6f3f0e-0000-4000-8000-000000000003",
};

describe("Spec 101 — acciones sobre discrepancias", () => {
  it("una discrepancia aplicable ofrece Aplicar y Descartar", async () => {
    const { allowedDiscrepancyActions } = await loadActions();
    expect(allowedDiscrepancyActions(discrepancy({}))).toEqual([
      "apply",
      "dismiss",
    ]);
  });

  it("C13 — las de farmer_farm solo ofrecen Descartar", async () => {
    const { allowedDiscrepancyActions } = await loadActions();
    expect(
      allowedDiscrepancyActions(
        discrepancy({ entityType: "farmer_farm", field: "role", canApply: false }),
      ),
    ).toEqual(["dismiss"]);
    // Aunque el backend dijera canApply: true, farmer_farm no se aplica.
    expect(
      allowedDiscrepancyActions(
        discrepancy({ entityType: "farmer_farm", field: "role", canApply: true }),
      ),
    ).toEqual(["dismiss"]);
  });

  it("C13 — con canApply falso se oculta Aplicar", async () => {
    const { allowedDiscrepancyActions } = await loadActions();
    expect(
      allowedDiscrepancyActions(
        discrepancy({ entityType: "farmer", field: "name", canApply: false }),
      ),
    ).toEqual(["dismiss"]);
  });

  it("una discrepancia ya resuelta no ofrece acciones", async () => {
    const { allowedDiscrepancyActions } = await loadActions();
    expect(allowedDiscrepancyActions(discrepancy({ status: "applied" }))).toEqual(
      [],
    );
    expect(
      allowedDiscrepancyActions(discrepancy({ status: "dismissed" })),
    ).toEqual([]);
  });

  it("C12 — el texto de confirmación nombra el valor propuesto", async () => {
    const { applyConfirmationText } = await loadActions();
    const text = applyConfirmationText(discrepancy({}));
    expect(text).toContain("El Retiro");
    expect(text).toMatch(/vereda/i);
  });

  it("C12 — sin desactualización no advierte cambios", async () => {
    const { applyConfirmationText } = await loadActions();
    const text = applyConfirmationText(discrepancy({}));
    expect(text).not.toMatch(/cambi[óo]/i);
  });

  it("C12 — desactualizada: advierte y muestra el valor vivo", async () => {
    const { applyConfirmationText } = await loadActions();
    const text = applyConfirmationText(
      discrepancy({ isStale: true, liveValue: "San José" }),
    );
    expect(text).toMatch(/cambi[óo]/i);
    expect(text).toContain("San José");
    expect(text).toContain("El Retiro");
  });

  it("C12 + C16 — desactualizada en municipio: el valor vivo va por nombre, no por id", async () => {
    const { applyConfirmationText } = await loadActions();
    const text = applyConfirmationText(
      discrepancy({
        field: "townId",
        systemField: "farm.townId",
        currentValue: TOWN_IDS.andes,
        submittedValue: TOWN_IDS.jardin,
        liveValue: TOWN_IDS.betania,
        currentLabel: "Andes",
        submittedLabel: "Jardín",
        liveLabel: "Betania",
        isStale: true,
      }),
    );
    expect(text).toContain("Betania");
    expect(text).toContain("Jardín");
    expect(text).not.toContain(TOWN_IDS.betania);
    expect(text).not.toContain(TOWN_IDS.jardin);
  });

  it("finca compartida: advierte que el cambio afecta a los demás productores", async () => {
    const { applyConfirmationText } = await loadActions();
    const shared = applyConfirmationText(discrepancy({}), {
      farmFarmerCount: 3,
    });
    expect(shared).toMatch(/productores/i);
    expect(shared).toContain("3");

    const alone = applyConfirmationText(discrepancy({}), {
      farmFarmerCount: 1,
    });
    expect(alone).not.toMatch(/productores/i);
  });

  it("el aviso de finca compartida no aplica a una discrepancia del productor", async () => {
    const { applyConfirmationText } = await loadActions();
    const text = applyConfirmationText(
      discrepancy({
        entityType: "farmer",
        farmId: null,
        field: "phone",
        currentValue: "3001112233",
        submittedValue: "3004445566",
        liveValue: "3001112233",
      }),
      { farmFarmerCount: 3 },
    );
    expect(text).not.toMatch(/productores/i);
    expect(text).toContain("3004445566");
  });

  it("C16 — un municipio se muestra por su nombre, no por su id", async () => {
    const { discrepancyValueLabels } = await loadActions();
    const labels = discrepancyValueLabels(
      discrepancy({
        field: "townId",
        systemField: "farm.townId",
        currentValue: TOWN_IDS.andes,
        submittedValue: TOWN_IDS.jardin,
        liveValue: TOWN_IDS.andes,
        currentLabel: "Andes",
        submittedLabel: "Jardín",
        liveLabel: "Andes",
      }),
    );
    expect(labels).toEqual({
      currentText: "Andes",
      submittedText: "Jardín",
      liveText: "Andes",
    });
  });

  it("C16 — un municipio vacío se muestra como «—»", async () => {
    const { discrepancyValueLabels } = await loadActions();
    const labels = discrepancyValueLabels(
      discrepancy({
        field: "townId",
        currentValue: null,
        submittedValue: TOWN_IDS.jardin,
        liveValue: null,
        currentLabel: null,
        submittedLabel: "Jardín",
        liveLabel: null,
      }),
    );
    expect(labels.currentText).toBe("—");
    expect(labels.liveText).toBe("—");
    expect(labels.submittedText).toBe("Jardín");
  });

  it("los demás campos se muestran con su valor legible", async () => {
    const { discrepancyValueLabels } = await loadActions();
    expect(
      discrepancyValueLabels(
        discrepancy({ field: "area", currentValue: 2.5, submittedValue: 3, liveValue: "" }),
      ),
    ).toEqual({ currentText: "2.5", submittedText: "3", liveText: "—" });
  });
});
