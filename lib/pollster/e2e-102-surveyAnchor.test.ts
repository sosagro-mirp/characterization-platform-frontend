/**
 * e2e-102 — Spec 102 «Flujo del encuestador por productor en la web» (H7):
 * ancla de la encuesta y contexto de productor en la URL (funciones puras).
 *
 * Escrito junto con el spec, antes de la implementación: arranca EN ROJO.
 * Cubre C6 y C9. La validación del servidor (finca de otro productor → 400)
 * vive en `backend/test/e2e-102-encuestador-web.e2e-spec.ts`.
 *
 * ── Contrato que `lib/pollster/surveyAnchor.ts` debe exponer ──────────────
 *
 * interface ApplyContext { farmerId: string; farmId?: string; farmCropId?: string }
 *
 * - `buildAnchoredSurveyPayload(input: { instrumentId: string;
 *     scopeLevel: "farmer" | "farm" | "farm_crop" } & ApplyContext)`
 *   → `{ instrumentIds: [instrumentId], farmerId, farmId?, farmCropId? }`
 *   Nivel productor: sin claves `farmId` ni `farmCropId` (aunque vengan).
 *   Nivel finca: exige `farmId` (lanza Error si falta); sin `farmCropId`.
 *   Nivel cultivo: exige `farmId` y `farmCropId` (lanza Error si falta alguno).
 *
 * - `applyContextQuery(ctx: ApplyContext): string`
 *   Query string sin «?», solo con las claves presentes, en el orden
 *   farmerId, farmId, farmCropId.
 *
 * - `parseApplyContext(params: URLSearchParams): ApplyContext | null`
 *   null si falta `farmerId` o si cualquier id presente no es un UUID; si
 *   llega `farmCropId` sin `farmId`, también null.
 *
 * - `returnPathAfterSurvey(ctx: ApplyContext | null): string`
 *   Con contexto, `/productores/{farmerId}`; sin contexto (campañas), `/campaign`.
 */
import { describe, expect, it } from "vitest";

interface ApplyContext {
  farmerId: string;
  farmId?: string;
  farmCropId?: string;
}

type Level = "farmer" | "farm" | "farm_crop";

interface SurveyAnchorModule {
  buildAnchoredSurveyPayload(
    input: { instrumentId: string; scopeLevel: Level } & ApplyContext,
  ): {
    instrumentIds: string[];
    farmerId: string;
    farmId?: string;
    farmCropId?: string;
  };
  applyContextQuery(ctx: ApplyContext): string;
  parseApplyContext(params: URLSearchParams): ApplyContext | null;
  returnPathAfterSurvey(ctx: ApplyContext | null): string;
}

async function load(): Promise<SurveyAnchorModule> {
  const specifier = "./surveyAnchor";
  return (await import(/* @vite-ignore */ specifier)) as SurveyAnchorModule;
}

const FARMER = "11111111-1111-4111-8111-111111111111";
const FARM = "22222222-2222-4222-8222-222222222222";
const CROP = "33333333-3333-4333-8333-333333333333";
const INSTRUMENT = "44444444-4444-4444-8444-444444444444";

describe("Spec 102 — ancla de la encuesta", () => {
  it("C6 — nivel productor: solo farmerId, sin finca aunque venga", async () => {
    const { buildAnchoredSurveyPayload } = await load();
    const payload = buildAnchoredSurveyPayload({
      instrumentId: INSTRUMENT,
      scopeLevel: "farmer",
      farmerId: FARMER,
      farmId: FARM,
    });
    expect(payload).toEqual({ instrumentIds: [INSTRUMENT], farmerId: FARMER });
    expect("farmId" in payload).toBe(false);
    expect("farmCropId" in payload).toBe(false);
  });

  it("C6 — nivel finca: farmerId + farmId", async () => {
    const { buildAnchoredSurveyPayload } = await load();
    expect(
      buildAnchoredSurveyPayload({
        instrumentId: INSTRUMENT,
        scopeLevel: "farm",
        farmerId: FARMER,
        farmId: FARM,
        farmCropId: CROP,
      }),
    ).toEqual({ instrumentIds: [INSTRUMENT], farmerId: FARMER, farmId: FARM });
  });

  it("C6 — nivel cultivo: farmerId + farmId + farmCropId", async () => {
    const { buildAnchoredSurveyPayload } = await load();
    expect(
      buildAnchoredSurveyPayload({
        instrumentId: INSTRUMENT,
        scopeLevel: "farm_crop",
        farmerId: FARMER,
        farmId: FARM,
        farmCropId: CROP,
      }),
    ).toEqual({
      instrumentIds: [INSTRUMENT],
      farmerId: FARMER,
      farmId: FARM,
      farmCropId: CROP,
    });
  });

  it("C6 — un contexto incompleto no se envía", async () => {
    const { buildAnchoredSurveyPayload } = await load();
    expect(() =>
      buildAnchoredSurveyPayload({
        instrumentId: INSTRUMENT,
        scopeLevel: "farm",
        farmerId: FARMER,
      }),
    ).toThrow();
    expect(() =>
      buildAnchoredSurveyPayload({
        instrumentId: INSTRUMENT,
        scopeLevel: "farm_crop",
        farmerId: FARMER,
        farmId: FARM,
      }),
    ).toThrow();
  });
});

describe("Spec 102 — contexto de productor en la URL", () => {
  it("serializa solo las claves presentes, en orden", async () => {
    const { applyContextQuery } = await load();
    expect(applyContextQuery({ farmerId: FARMER })).toBe(`farmerId=${FARMER}`);
    expect(
      applyContextQuery({ farmerId: FARMER, farmId: FARM, farmCropId: CROP }),
    ).toBe(`farmerId=${FARMER}&farmId=${FARM}&farmCropId=${CROP}`);
  });

  it("ida y vuelta: parse(query(ctx)) devuelve el mismo contexto", async () => {
    const { applyContextQuery, parseApplyContext } = await load();
    const ctx = { farmerId: FARMER, farmId: FARM, farmCropId: CROP };
    expect(parseApplyContext(new URLSearchParams(applyContextQuery(ctx)))).toEqual(
      ctx,
    );
  });

  it("C6 — ids inválidos o incompletos dan null", async () => {
    const { parseApplyContext } = await load();
    expect(parseApplyContext(new URLSearchParams(""))).toBeNull();
    expect(
      parseApplyContext(new URLSearchParams("farmerId=no-es-uuid")),
    ).toBeNull();
    expect(
      parseApplyContext(
        new URLSearchParams(`farmerId=${FARMER}&farmId=finca-mala`),
      ),
    ).toBeNull();
    expect(
      parseApplyContext(
        new URLSearchParams(`farmerId=${FARMER}&farmCropId=${CROP}`),
      ),
    ).toBeNull();
  });

  it("C9 — con contexto vuelve a la ficha; sin él, a campañas", async () => {
    const { returnPathAfterSurvey } = await load();
    expect(returnPathAfterSurvey({ farmerId: FARMER, farmId: FARM })).toBe(
      `/productores/${FARMER}`,
    );
    expect(returnPathAfterSurvey(null)).toBe("/campaign");
  });
});
