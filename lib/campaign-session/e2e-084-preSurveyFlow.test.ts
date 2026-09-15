import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/apiClient";
import {
  collisionFromError,
  isDocumentCollision,
  resolveCollisionFlow,
  resolveRegistrationStart,
  type CollisionPending,
} from "./preSurveyFlow";

/**
 * Spec 84 — flujo de pre-encuesta web (Fase 4, criterios 4 y 6).
 *
 * Cubre la decisión Registro (`S_REG`) → respaldo S1 ante 404 y la detección y
 * resolución de la colisión de documento. La página
 * `app/(instrument)/campaign/[id]/session/[sessionId]/page.tsx` delega en estas
 * funciones; lo visual se valida en `docs/testing/test-084-…` (este `vitest`
 * corre en entorno `node`, sin Testing Library).
 */

const collisionBody = {
  message: "Documento ya registrado",
  documentId: "9000840001",
  submittedName: "Rosalba Nueva TEST",
  existingFarmer: { farmerId: "farmer-existing", name: "Rosalba Existente TEST" },
};

describe("resolveRegistrationStart — Registro primero, S1 como respaldo", () => {
  it("usa S_REG cuando existe y no pide S1", async () => {
    const getByCode = vi.fn(async (code: string) => ({ instrumentId: `id-${code}` }));

    await expect(resolveRegistrationStart(getByCode)).resolves.toEqual({
      phase: "registro_pending",
      instrumentId: "id-S_REG",
    });
    expect(getByCode).toHaveBeenCalledTimes(1);
    expect(getByCode).toHaveBeenCalledWith("S_REG");
  });

  it("cae a S1 cuando S_REG responde 404", async () => {
    const getByCode = vi.fn(async (code: string) => {
      if (code === "S_REG") throw new ApiError(404, "Instrument not found", null);
      return { instrumentId: `id-${code}` };
    });

    await expect(resolveRegistrationStart(getByCode)).resolves.toEqual({
      phase: "s1_pending",
      instrumentId: "id-S1",
    });
    expect(getByCode.mock.calls.map(([code]) => code)).toEqual(["S_REG", "S1"]);
  });

  it("no cae a S1 ante otro error de S_REG: lo propaga", async () => {
    const boom = new ApiError(500, "Internal error", null);
    const getByCode = vi.fn(async () => {
      throw boom;
    });

    await expect(resolveRegistrationStart(getByCode)).rejects.toBe(boom);
    expect(getByCode).toHaveBeenCalledTimes(1);
  });

  it("propaga el 404 si tampoco existe S1", async () => {
    const getByCode = vi.fn(async (code: string) => {
      throw new ApiError(404, `${code} not found`, null);
    });

    await expect(resolveRegistrationStart(getByCode)).rejects.toMatchObject({
      status: 404,
      message: "S1 not found",
    });
  });
});

describe("isDocumentCollision / collisionFromError", () => {
  it("reconoce un 409 con documentId como colisión", () => {
    const err = new ApiError(409, collisionBody.message, collisionBody);
    expect(isDocumentCollision(err)).toBe(true);
    expect(collisionFromError(err, "survey-1", "registro_pending")).toEqual({
      surveyId: "survey-1",
      submittedName: "Rosalba Nueva TEST",
      existingFarmerName: "Rosalba Existente TEST",
      phase: "registro_pending",
    });
  });

  it("conserva la fase legada s1_pending", () => {
    const err = new ApiError(409, collisionBody.message, collisionBody);
    expect(collisionFromError(err, "survey-2", "s1_pending")?.phase).toBe("s1_pending");
  });

  it("no confunde otros errores con una colisión", () => {
    expect(isDocumentCollision(new ApiError(409, "Conflicto", { message: "x" }))).toBe(false);
    expect(isDocumentCollision(new ApiError(409, "Conflicto", null))).toBe(false);
    expect(isDocumentCollision(new ApiError(400, "Bad", collisionBody))).toBe(false);
    expect(isDocumentCollision(new ApiError(409, "Conflicto", { documentId: 123 }))).toBe(false);
    expect(isDocumentCollision(new Error("red"))).toBe(false);
    expect(collisionFromError(new Error("red"), "survey-1", "s1_pending")).toBeNull();
  });
});

describe("resolveCollisionFlow — reanudación tras el diálogo", () => {
  const farmer = { id: "farmer-1", name: "Rosalba TEST" };

  function deps() {
    return {
      extractFarmer: vi.fn(async () => ({ farmer })),
      extractCrops: vi.fn(async () => ({ crops: [] })),
      getInstrumentByCode: vi.fn(async (code: string) => ({ instrumentId: `id-${code}` })),
      onFarmer: vi.fn(),
    };
  }

  const registro: CollisionPending = {
    surveyId: "survey-reg",
    submittedName: "A",
    existingFarmerName: "B",
    phase: "registro_pending",
  };

  it("Registro: reenvía la resolución, extrae cultivos de la misma encuesta y termina", async () => {
    const d = deps();

    await expect(resolveCollisionFlow(registro, "same_person", d)).resolves.toEqual({
      phase: "done",
    });
    expect(d.extractFarmer).toHaveBeenCalledWith("survey-reg", "same_person");
    expect(d.onFarmer).toHaveBeenCalledWith("farmer-1", "Rosalba TEST");
    expect(d.extractCrops).toHaveBeenCalledWith("survey-reg");
    expect(d.getInstrumentByCode).not.toHaveBeenCalled();
  });

  it("S1 legado: resuelve el productor y sigue con S2 sin extraer cultivos", async () => {
    const d = deps();

    await expect(
      resolveCollisionFlow({ ...registro, surveyId: "survey-s1", phase: "s1_pending" }, "separate_person", d),
    ).resolves.toEqual({ phase: "s2_pending", instrumentId: "id-S2" });
    expect(d.extractFarmer).toHaveBeenCalledWith("survey-s1", "separate_person");
    expect(d.onFarmer).toHaveBeenCalledWith("farmer-1", "Rosalba TEST");
    expect(d.extractCrops).not.toHaveBeenCalled();
    expect(d.getInstrumentByCode).toHaveBeenCalledWith("S2");
  });

  it("si la resolución falla, no marca productor ni avanza", async () => {
    const d = deps();
    d.extractFarmer.mockRejectedValueOnce(new ApiError(500, "falló", null));

    await expect(resolveCollisionFlow(registro, "same_person", d)).rejects.toMatchObject({
      status: 500,
    });
    expect(d.onFarmer).not.toHaveBeenCalled();
    expect(d.extractCrops).not.toHaveBeenCalled();
  });
});
