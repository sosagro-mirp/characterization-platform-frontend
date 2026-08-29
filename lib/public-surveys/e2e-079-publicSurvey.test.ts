/**
 * e2e-079 — Instrumentos públicos: lógica pura del formulario compartible.
 *
 * Escrito junto con `spec/79_instrumentos_publicos_url_compartible.md`, antes
 * de la implementación: arranca EN ROJO. Los módulos
 * `./publicSurveyAccess`, `./publicSurveyPayload` y `./publicSurveyUrl`
 * todavía no existen (los crea la Fase 5 del spec, salvo `publicSurveyUrl`,
 * que la Fase 6 usa también en el panel).
 *
 * El entorno de Vitest de este repositorio es `node` (ver `vitest.config.ts`),
 * así que aquí solo se prueba lógica pura. El recorrido visual del formulario
 * en el celular, el toggle del panel y la bandeja de revisión viven en
 * `docs/testing/test-079-instrumentos-publicos.md`.
 *
 * Cubre, del lado del cliente, los criterios 1, 2, 4, 5, 8 y 9 del spec.
 */
import { describe, expect, it } from "vitest";
import {
  resolvePublicSurveyAccess,
  type PublicSurveyLoadResult,
} from "./publicSurveyAccess";
import { buildPublicSubmissionPayload } from "./publicSurveyPayload";
import { buildPublicSurveyUrl } from "./publicSurveyUrl";

const INSTRUMENT_ID = "550e8400-e29b-41d4-a716-446655440000";
const CONSENT_DOCUMENT_ID = "550e8400-e29b-41d4-a716-4466554400aa";

const acceptedConsent = {
  consentDocumentId: CONSENT_DOCUMENT_ID,
  acceptedDataProcessing: true,
  acceptedPhoto: false,
  acceptedAudio: false,
  acceptedVideo: false,
  acceptedFollowUpContact: false,
};

// ─── criterio 1 — la URL que el panel entrega ───────────────────────────────

describe("buildPublicSurveyUrl — el enlace que se copia desde el panel", () => {
  it("arma la URL pública a partir del origen y el id del instrumento", () => {
    expect(buildPublicSurveyUrl("https://sosagro.example.co", INSTRUMENT_ID)).toBe(
      `https://sosagro.example.co/encuesta/${INSTRUMENT_ID}`,
    );
  });

  it("no duplica la barra final del origen", () => {
    expect(buildPublicSurveyUrl("https://sosagro.example.co/", INSTRUMENT_ID)).toBe(
      `https://sosagro.example.co/encuesta/${INSTRUMENT_ID}`,
    );
  });
});

// ─── criterios 2, 4 y 9 — qué pantalla se muestra al abrir el enlace ────────

describe("resolvePublicSurveyAccess — cerrado, inexistente y disponible son estados distintos", () => {
  it("criterio 4 — con el instrumento servido, el formulario queda disponible", () => {
    const result: PublicSurveyLoadResult = {
      status: 200,
      body: {
        instrumentId: INSTRUMENT_ID,
        name: "Instrumento público",
        sections: [],
        consentDocument: { consentDocumentId: CONSENT_DOCUMENT_ID, version: "1.1" },
      },
    };

    expect(resolvePublicSurveyAccess(result).state).toBe("available");
  });

  it("criterio 2 — un enlace desactivado se muestra como encuesta cerrada", () => {
    const result: PublicSurveyLoadResult = {
      status: 404,
      body: { reason: "closed" },
    };

    const access = resolvePublicSurveyAccess(result);
    expect(access.state).toBe("closed");
    expect(access.message).toMatch(/recib/i);
  });

  it("criterio 9 — un enlace inválido se muestra como no encontrado, con otro mensaje", () => {
    const closed = resolvePublicSurveyAccess({ status: 404, body: { reason: "closed" } });
    const missing = resolvePublicSurveyAccess({
      status: 404,
      body: { reason: "not_found" },
    });

    expect(missing.state).toBe("not_found");
    expect(missing.message).not.toBe(closed.message);
  });

  it("un 403 al enviar también se resuelve como encuesta cerrada", () => {
    expect(resolvePublicSurveyAccess({ status: 403, body: {} }).state).toBe("closed");
  });

  it("un error de red o del servidor no se confunde con un enlace cerrado", () => {
    expect(resolvePublicSurveyAccess({ status: 500, body: {} }).state).toBe("error");
    expect(resolvePublicSurveyAccess({ status: 0, body: null }).state).toBe("error");
  });

  it("un id que no tiene forma de UUID se rechaza sin llamar al servidor", () => {
    expect(resolvePublicSurveyAccess({ status: "invalid-id", body: null }).state).toBe(
      "not_found",
    );
  });
});

// ─── criterios 5 y 8 — el payload de envío ─────────────────────────────────

describe("buildPublicSubmissionPayload — el envío es uno solo y va completo", () => {
  const answers = {
    "q-1": { questionId: "q-1", textValue: "Ana Prueba" },
    "q-2": { questionId: "q-2", numericValue: 3 },
  };

  it("criterio 8 — arma una única llamada con instrumento, consentimiento y respuestas", () => {
    const payload = buildPublicSubmissionPayload({
      instrumentId: INSTRUMENT_ID,
      consent: acceptedConsent,
      answers,
    });

    expect(payload.instrumentId).toBe(INSTRUMENT_ID);
    expect(payload.consent).toEqual(acceptedConsent);
    expect(payload.responses).toHaveLength(2);
  });

  it("criterio 5 — sin autorización de tratamiento de datos no se construye payload", () => {
    expect(() =>
      buildPublicSubmissionPayload({
        instrumentId: INSTRUMENT_ID,
        consent: { ...acceptedConsent, acceptedDataProcessing: false },
        answers,
      }),
    ).toThrow(/tratamiento de datos/i);
  });

  it("nunca incluye adjuntos: el canal público no admite multimedia", () => {
    const payload = buildPublicSubmissionPayload({
      instrumentId: INSTRUMENT_ID,
      consent: acceptedConsent,
      answers: {
        ...answers,
        // `attachmentId` no existe en InstrumentDraftAnswer — simula un campo
        // ajeno que un llamador descuidado podría colar; el cast evita el
        // excess-property-check de TS sin debilitar el tipo de la función.
        "q-3": {
          questionId: "q-3",
          attachmentId: "550e8400-e29b-41d4-a716-4466554400bb",
        } as unknown as (typeof answers)["q-1"],
      },
    });

    expect(
      payload.responses.every((r) => !("attachmentId" in r) || r.attachmentId === undefined),
    ).toBe(true);
  });

  it("no envía campaignSessionId, stepOrder ni farmerId: no hay sesión ni agricultor", () => {
    const payload = buildPublicSubmissionPayload({
      instrumentId: INSTRUMENT_ID,
      consent: acceptedConsent,
      answers,
    });

    expect(payload).not.toHaveProperty("campaignSessionId");
    expect(payload).not.toHaveProperty("stepOrder");
    expect(payload).not.toHaveProperty("farmerId");
  });

  it("descarta las preguntas sin responder en vez de mandarlas vacías", () => {
    const payload = buildPublicSubmissionPayload({
      instrumentId: INSTRUMENT_ID,
      consent: acceptedConsent,
      answers: { ...answers, "q-4": { questionId: "q-4" } },
    });

    expect(payload.responses.map((r) => r.questionId)).toEqual(["q-1", "q-2"]);
  });

  it("un envío sin ninguna respuesta se rechaza antes de salir del navegador", () => {
    expect(() =>
      buildPublicSubmissionPayload({
        instrumentId: INSTRUMENT_ID,
        consent: acceptedConsent,
        answers: {},
      }),
    ).toThrow(/respuesta/i);
  });
});
