import { ApiError } from "@/lib/apiClient";
import type { SurveyExtraction } from "@/services/surveys.service";

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
  getInstrumentByCode: GetInstrumentByCode;
  /** Se llama en cuanto el productor queda resuelto, antes de los pasos siguientes. */
  onFarmer: (farmerId: string, name: string) => void;
}

export type CollisionOutcome =
  | { phase: "done" }
  | { phase: "s2_pending"; instrumentId: string };

/**
 * Reanuda el flujo tras la elección del encuestador en el diálogo de colisión:
 * en el Registro termina (spec 95: `extract-farmer` ya extrae también la finca
 * y los cultivos); en el S1 legado se sigue con S2.
 */
export async function resolveCollisionFlow(
  pending: CollisionPending,
  resolution: "same_person" | "separate_person",
  deps: ResolveCollisionDeps,
): Promise<CollisionOutcome> {
  const result = await deps.extractFarmer(pending.surveyId, resolution);
  deps.onFarmer(result.farmer.id, result.farmer.name);

  if (pending.phase === "registro_pending") {
    return { phase: "done" };
  }
  const s2 = await deps.getInstrumentByCode("S2");
  return { phase: "s2_pending", instrumentId: s2.instrumentId };
}

export interface CompleteAfterBatchDeps {
  getExtraction: (surveyId: string) => Promise<SurveyExtraction>;
  getInstrumentByCode: GetInstrumentByCode;
  onFarmer: (farmerId: string, name: string) => void;
}

export type AfterBatchOutcome =
  | { phase: "done" }
  | { phase: "s2_pending"; instrumentId: string }
  | { phase: "collision"; pending: CollisionPending };

const EXTRACTION_FAILURE_MESSAGES: Record<string, string> = {
  error:
    "No se pudo registrar al agricultor a partir de la encuesta. Intenta de nuevo; si el problema continúa, avisa al equipo.",
  no_identity:
    "La encuesta no trae el nombre o el documento del agricultor, así que no se pudo registrar. Revisa las respuestas e inténtalo de nuevo.",
  pending_alias:
    "El registro del agricultor todavía se está sincronizando. Espera un momento e inténtalo de nuevo.",
};

/**
 * Spec 95 (D-H3-12, D-95-2) — tras el batch el backend ya extrajo productor,
 * finca y cultivos: la web solo consulta `GET /surveys/:id/extraction`.
 * `done` y `backfilled` equivalen; `not_applicable` avanza sin productor
 * nuevo; `collision` se resuelve luego con `extract-farmer {resolution}`;
 * `error`, `no_identity` y `pending_alias` detienen el flujo con un mensaje.
 */
export async function completeAfterBatch(
  surveyId: string,
  phase: CollisionPhase,
  deps: CompleteAfterBatchDeps,
): Promise<AfterBatchOutcome> {
  const extraction = await deps.getExtraction(surveyId);

  if (extraction.status === "collision" && extraction.collision) {
    return {
      phase: "collision",
      pending: {
        surveyId,
        submittedName: extraction.collision.submittedName,
        existingFarmerName: extraction.collision.existingFarmer.name,
        phase,
      },
    };
  }

  const isDone =
    extraction.status === "done" || extraction.status === "backfilled";
  if (isDone && extraction.farmerId) {
    deps.onFarmer(extraction.farmerId, extraction.farmerName ?? "");
  } else if (extraction.status !== "not_applicable") {
    throw new Error(
      EXTRACTION_FAILURE_MESSAGES[extraction.status ?? ""] ??
        "No se pudo confirmar el registro del agricultor. Inténtalo de nuevo.",
    );
  }

  if (phase === "s1_pending") {
    const s2 = await deps.getInstrumentByCode("S2");
    return { phase: "s2_pending", instrumentId: s2.instrumentId };
  }
  return { phase: "done" };
}
