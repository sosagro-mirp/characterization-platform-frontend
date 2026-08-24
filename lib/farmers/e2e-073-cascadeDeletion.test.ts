import { describe, it, expect } from "vitest";
import {
  isDeletionConfirmed,
  summarizeDeletionPreview,
  type FarmerDeletionPreview,
} from "./cascadeDeletion";

/**
 * Spec 73 — Borrado en cascada de un agricultor desde el panel.
 *
 * Cubre los criterios de aceptación 10 y 11 de
 * `spec/73_borrado_en_cascada_agricultor.md`. El resto de la UI (visibilidad
 * del botón por rol, redirección, error visible) se valida en la ronda manual
 * `docs/testing/test-073-borrado-cascada-agricultor.md`, porque el `vitest` de
 * este repositorio corre en entorno `node` (`vitest.config.ts`) y no hay
 * `testing-library` instalada.
 *
 * ARRANCA EN ROJO: `lib/farmers/cascadeDeletion.ts` no existe todavía; lo crea
 * la Fase 3 del spec.
 */

const preview: FarmerDeletionPreview = {
  farmerId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
  name: "Rosalba TEST",
  documentId: "9000730001",
  counts: {
    farms: 1,
    campaignSessions: 1,
    surveys: 2,
    responses: 30,
    documentCollisions: 0,
    relations: 0,
  },
  farm: { farmId: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee", name: "La Esperanza TEST", shared: false, willBeDeleted: true },
  preserved: { changeRequests: 0 },
};

describe("isDeletionConfirmed — criterio 11", () => {
  it("no confirma con el campo vacío", () => {
    expect(isDeletionConfirmed("", preview)).toBe(false);
    expect(isDeletionConfirmed("   ", preview)).toBe(false);
  });

  it("no confirma con un documento incorrecto", () => {
    expect(isDeletionConfirmed("9000730002", preview)).toBe(false);
    expect(isDeletionConfirmed("900073000", preview)).toBe(false);
  });

  it("confirma con el documento exacto", () => {
    expect(isDeletionConfirmed("9000730001", preview)).toBe(true);
  });

  it("tolera espacios sobrantes alrededor", () => {
    expect(isDeletionConfirmed("  9000730001 ", preview)).toBe(true);
  });

  it("no acepta el nombre cuando el agricultor sí tiene documento", () => {
    expect(isDeletionConfirmed("Rosalba TEST", preview)).toBe(false);
  });

  it("cae al nombre cuando el agricultor no tiene documento", () => {
    const sinDocumento = { ...preview, documentId: null };

    expect(isDeletionConfirmed("Rosalba TEST", sinDocumento)).toBe(true);
    expect(isDeletionConfirmed("  rosalba test  ", sinDocumento)).toBe(true);
    expect(isDeletionConfirmed("Rosalba", sinDocumento)).toBe(false);
  });
});

describe("summarizeDeletionPreview — criterio 10", () => {
  it("enumera los recursos con su conteo real", () => {
    const lines = summarizeDeletionPreview(preview);
    const text = lines.join(" | ");

    expect(text).toContain("2");
    expect(text).toMatch(/encuesta/i);
    expect(text).toContain("30");
    expect(text).toMatch(/respuesta/i);
    expect(text).toContain("1");
    expect(text).toMatch(/sesi/i);
  });

  it("omite los conteos en cero", () => {
    const text = summarizeDeletionPreview(preview).join(" | ");

    expect(text).not.toMatch(/colisi/i);
  });

  it("no inventa filas cuando no hay nada derivado", () => {
    const vacio: FarmerDeletionPreview = {
      ...preview,
      counts: {
        farms: 0,
        campaignSessions: 0,
        surveys: 0,
        responses: 0,
        documentCollisions: 0,
        relations: 0,
      },
      farm: null,
    };

    expect(summarizeDeletionPreview(vacio)).toEqual([]);
  });

  it("advierte cuando la finca es compartida y no se borrará", () => {
    const compartida: FarmerDeletionPreview = {
      ...preview,
      counts: { ...preview.counts, farms: 0 },
      farm: {
        farmId: preview.farm!.farmId,
        name: preview.farm!.name,
        shared: true,
        willBeDeleted: false,
      },
    };

    const text = summarizeDeletionPreview(compartida).join(" | ");

    expect(text).toMatch(/compartida/i);
    expect(text).not.toMatch(/1 finca\b/i);
  });
});
