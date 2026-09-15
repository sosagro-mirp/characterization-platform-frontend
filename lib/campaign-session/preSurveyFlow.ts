import { ApiError } from "@/lib/apiClient";

/**
 * Spec 84 — decisiones puras del flujo de pre-encuesta web
 * (`app/(instrument)/campaign/[id]/session/[sessionId]/page.tsx`), extraídas
 * para poder probarlas con Vitest sin montar la página. Las dependencias de
 * red se inyectan; la página les pasa los servicios reales.
 */

export type CollisionPhase = "registro_pending" | "s1_pending";

// Spec 68/84 — colisión de documentId detectada al extraer el productor,
// tanto en el flujo nuevo (Registro, un solo instrumento) como en el legado
// (S1, cuando S_REG todavía no existe en el backend).
export interface CollisionPending {
  surveyId: string;
  submittedName: string;
  existingFarmerName: string;
  phase: CollisionPhase;
}

export interface DocumentCollisionBody {
  documentId: string;
  submittedName: string;
  existingFarmer: { farmerId: string; name: string };
}

export function isDocumentCollision(
  err: unknown,
): err is ApiError & { body: DocumentCollisionBody } {
  return (
    err instanceof ApiError &&
    err.status === 409 &&
    typeof (err.body as { documentId?: unknown })?.documentId === "string"
  );
}

/** Convierte el error de `extractFarmer` en la colisión pendiente, o `null` si no lo es. */
export function collisionFromError(
  err: unknown,
  surveyId: string,
  phase: CollisionPhase,
): CollisionPending | null {
  if (!isDocumentCollision(err)) return null;
  return {
    surveyId,
    submittedName: err.body.submittedName,
    existingFarmerName: err.body.existingFarmer.name,
    phase,
  };
}

type GetInstrumentByCode = (code: string) => Promise<{ instrumentId: string }>;

/**
 * Fase `idle` sin productor: S_REG reemplaza a S1+S2. Si `S_REG` responde 404
 * (todavía no se ha promovido a este backend) se sigue con S1, como antes del
 * spec 84. Cualquier otro error se propaga.
 */
export async function resolveRegistrationStart(
  getInstrumentByCode: GetInstrumentByCode,
): Promise<{ phase: CollisionPhase; instrumentId: string }> {
  try {
    const registro = await getInstrumentByCode("S_REG");
    return { phase: "registro_pending", instrumentId: registro.instrumentId };
  } catch (err) {
    if (!(err instanceof ApiError && err.status === 404)) throw err;
  }
  const s1 = await getInstrumentByCode("S1");
  return { phase: "s1_pending", instrumentId: s1.instrumentId };
}

export interface ResolveCollisionDeps {
  extractFarmer: (
    surveyId: string,
    resolution: "same_person" | "separate_person",
  ) => Promise<{ farmer: { id: string; name: string } }>;
  extractCrops: (surveyId: string) => Promise<unknown>;
  getInstrumentByCode: GetInstrumentByCode;
  /** Se llama en cuanto el productor queda resuelto, antes de los pasos siguientes. */
  onFarmer: (farmerId: string, name: string) => void;
}

export type CollisionOutcome =
  | { phase: "done" }
  | { phase: "s2_pending"; instrumentId: string };

/**
 * Reanuda el flujo tras la elección del encuestador en el diálogo de colisión:
 * en el Registro se extraen los cultivos de la misma encuesta y termina; en el
 * S1 legado se sigue con S2.
 */
export async function resolveCollisionFlow(
  pending: CollisionPending,
  resolution: "same_person" | "separate_person",
  deps: ResolveCollisionDeps,
): Promise<CollisionOutcome> {
  const result = await deps.extractFarmer(pending.surveyId, resolution);
  deps.onFarmer(result.farmer.id, result.farmer.name);

  if (pending.phase === "registro_pending") {
    await deps.extractCrops(pending.surveyId);
    return { phase: "done" };
  }
  const s2 = await deps.getInstrumentByCode("S2");
  return { phase: "s2_pending", instrumentId: s2.instrumentId };
}
