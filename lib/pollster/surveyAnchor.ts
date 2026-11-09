/**
 * Spec 102 — ancla de la encuesta al productor, finca o cultivo de finca, y
 * contexto de productor que viaja en la URL de `/instrument/[id]`.
 */

export type ApplyScopeLevel = "farmer" | "farm" | "farm_crop";

export interface ApplyContext {
  farmerId: string;
  farmId?: string;
  farmCropId?: string;
  /** Nivel del instrumento; viaja en la URL para validar el ancla al crear la encuesta. */
  scopeLevel?: ApplyScopeLevel;
}

export interface AnchoredSurveyPayload {
  instrumentIds: string[];
  farmerId: string;
  farmId?: string;
  farmCropId?: string;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function buildAnchoredSurveyPayload(
  input: { instrumentId: string; scopeLevel: ApplyScopeLevel } & ApplyContext,
): AnchoredSurveyPayload {
  const { instrumentId, scopeLevel, farmerId, farmId, farmCropId } = input;
  const payload: AnchoredSurveyPayload = {
    instrumentIds: [instrumentId],
    farmerId,
  };
  if (scopeLevel === "farmer") return payload;
  if (!farmId) throw new Error("Falta farmId para un instrumento de finca");
  payload.farmId = farmId;
  if (scopeLevel === "farm") return payload;
  if (!farmCropId) {
    throw new Error("Falta farmCropId para un instrumento de cultivo");
  }
  payload.farmCropId = farmCropId;
  return payload;
}

export function applyContextQuery(ctx: ApplyContext): string {
  const params = new URLSearchParams();
  params.set("farmerId", ctx.farmerId);
  if (ctx.farmId) params.set("farmId", ctx.farmId);
  if (ctx.farmCropId) params.set("farmCropId", ctx.farmCropId);
  if (ctx.scopeLevel) params.set("scopeLevel", ctx.scopeLevel);
  return params.toString();
}

export function parseApplyContext(params: URLSearchParams): ApplyContext | null {
  const farmerId = params.get("farmerId");
  const farmId = params.get("farmId");
  const farmCropId = params.get("farmCropId");
  if (!farmerId || !UUID_RE.test(farmerId)) return null;
  if (farmId !== null && !UUID_RE.test(farmId)) return null;
  if (farmCropId !== null && (!farmId || !UUID_RE.test(farmCropId))) {
    return null;
  }
  const level = params.get("scopeLevel");
  if (level !== null && !["farmer", "farm", "farm_crop"].includes(level)) {
    return null;
  }
  const ctx: ApplyContext = { farmerId };
  if (level) ctx.scopeLevel = level as ApplyScopeLevel;
  if (farmId) ctx.farmId = farmId;
  if (farmCropId) ctx.farmCropId = farmCropId;
  return ctx;
}

export function returnPathAfterSurvey(ctx: ApplyContext | null): string {
  return ctx ? `/productores/${ctx.farmerId}` : "/productores";
}

/** Spec 102 — ¿la URL trae algún dato de productor (válido o no)? */
export function hasApplyContextParams(params: URLSearchParams): boolean {
  return ["farmerId", "farmId", "farmCropId", "scopeLevel"].some((k) =>
    params.has(k),
  );
}

/** Nivel efectivo: el declarado o, si falta, el que se deduce de los ids. */
export function effectiveScopeLevel(ctx: ApplyContext): ApplyScopeLevel {
  if (ctx.scopeLevel) return ctx.scopeLevel;
  if (ctx.farmCropId) return "farm_crop";
  if (ctx.farmId) return "farm";
  return "farmer";
}
