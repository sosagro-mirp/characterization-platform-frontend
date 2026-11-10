/**
 * e2e-102 — Spec 102 «Flujo del encuestador por productor en la web» (H7):
 * consentimiento sin sesión de campaña (funciones puras, lado cliente).
 *
 * Escrito junto con el spec, antes de la implementación: arranca EN ROJO.
 * Cubre C11 y la parte de cliente de C12. La validación del servidor vive en
 * `backend/src/consents/e2e-102-consent-anchor.spec.ts`. No modifica
 * `e2e-078-consentGating.test.ts`: la firma actual con `sessionId` se conserva.
 *
 * ── Contrato que `lib/consents/consentAnchor.ts` debe exponer ─────────────
 *
 * type ConsentAnchor = { sessionId: string } | { farmerId: string } | { surveyId: string }
 *
 * - `resolveConsentAnchor(input: { sessionId?: string | null;
 *     farmerId?: string | null; surveyId?: string | null }): ConsentAnchor`
 *   Devuelve un objeto con exactamente la clave presente. Lanza Error si no
 *   llega ninguna o si llega más de una (null y "" cuentan como ausentes).
 *
 * - `consentNoticeForFarmer(status: { status: "valid" | "outdated_version" |
 *     "revoked" | "none"; acceptedVersion: string | null } | null):
 *     "none" | "pending" | "outdated" | "unknown"`
 *   Aviso NO bloqueante de la ficha: valid → none; none o revoked → pending;
 *   outdated_version → outdated; null (no se pudo consultar) → unknown.
 */
import { describe, expect, it } from "vitest";

type ConsentAnchor =
  | { sessionId: string }
  | { farmerId: string }
  | { surveyId: string };

type Vigency = "valid" | "outdated_version" | "revoked" | "none";

interface ConsentAnchorModule {
  resolveConsentAnchor(input: {
    sessionId?: string | null;
    farmerId?: string | null;
    surveyId?: string | null;
  }): ConsentAnchor;
  consentNoticeForFarmer(
    status: { status: Vigency; acceptedVersion: string | null } | null,
  ): "none" | "pending" | "outdated" | "unknown";
}

async function load(): Promise<ConsentAnchorModule> {
  const specifier = "./consentAnchor";
  return (await import(/* @vite-ignore */ specifier)) as ConsentAnchorModule;
}

const SESSION = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const FARMER = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const SURVEY = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";

describe("Spec 102 — ancla del consentimiento", () => {
  it("C12 — cada ancla sola produce un objeto con esa única clave", async () => {
    const { resolveConsentAnchor } = await load();
    expect(resolveConsentAnchor({ sessionId: SESSION })).toEqual({
      sessionId: SESSION,
    });
    expect(resolveConsentAnchor({ farmerId: FARMER, sessionId: null })).toEqual({
      farmerId: FARMER,
    });
    expect(resolveConsentAnchor({ surveyId: SURVEY, farmerId: "" })).toEqual({
      surveyId: SURVEY,
    });
  });

  it("C12 — sin ancla o con varias, falla", async () => {
    const { resolveConsentAnchor } = await load();
    expect(() => resolveConsentAnchor({})).toThrow();
    expect(() =>
      resolveConsentAnchor({ sessionId: SESSION, farmerId: FARMER }),
    ).toThrow();
    expect(() =>
      resolveConsentAnchor({ farmerId: FARMER, surveyId: SURVEY }),
    ).toThrow();
  });
});

describe("Spec 102 — aviso de consentimiento en la ficha", () => {
  it("C11 — vigente no muestra aviso", async () => {
    const { consentNoticeForFarmer } = await load();
    expect(
      consentNoticeForFarmer({ status: "valid", acceptedVersion: "1.0" }),
    ).toBe("none");
  });

  it("C11 — sin constancia o revocada: pendiente", async () => {
    const { consentNoticeForFarmer } = await load();
    expect(
      consentNoticeForFarmer({ status: "none", acceptedVersion: null }),
    ).toBe("pending");
    expect(
      consentNoticeForFarmer({ status: "revoked", acceptedVersion: "1.0" }),
    ).toBe("pending");
  });

  it("C11 — versión vieja: desactualizado; consulta fallida: desconocido", async () => {
    const { consentNoticeForFarmer } = await load();
    expect(
      consentNoticeForFarmer({
        status: "outdated_version",
        acceptedVersion: "1.0",
      }),
    ).toBe("outdated");
    expect(consentNoticeForFarmer(null)).toBe("unknown");
  });
});
