/**
 * e2e-078 — Bloqueo del flujo de campaña hasta que exista consentimiento.
 *
 * Escrito junto con `spec/78_consentimiento_informado_tratamiento_datos.md`,
 * antes de la implementación: arranca EN ROJO (los módulos
 * `./resolveConsentRequirement` y `./consentSubmission` todavía no existen).
 *
 * El entorno de Vitest de este repositorio es `node` (ver `vitest.config.ts`),
 * así que aquí se prueba solo la lógica pura que decide si hay que mostrar la
 * pantalla de consentimiento y si el botón de continuar está habilitado. La
 * verificación visual y de navegación vive en
 * `docs/testing/test-078-consentimiento-informado.md`.
 *
 * Cubre los criterios 1, 2, 3, 4 y 5 del spec.
 */
import { describe, expect, it } from "vitest";
import {
  isConsentSubmittable,
  resolveConsentRequirement,
  type ConsentStatus,
} from "./resolveConsentRequirement";
import { buildConsentPayload } from "./consentSubmission";

const ACTIVE_VERSION = "1.1";

function status(overrides: Partial<ConsentStatus> = {}): ConsentStatus {
  return {
    status: "valid",
    acceptedVersion: ACTIVE_VERSION,
    ...overrides,
  };
}

describe("resolveConsentRequirement — cuándo hay que pedir el consentimiento", () => {
  // Criterio 1
  it("lo exige siempre para un encuestado nuevo", () => {
    expect(
      resolveConsentRequirement({ mode: "new", consentStatus: null, activeVersion: ACTIVE_VERSION }),
    ).toBe(true);
  });

  // Criterio 4
  it("no lo exige para un encuestado conocido con consentimiento vigente", () => {
    expect(
      resolveConsentRequirement({
        mode: "existing",
        consentStatus: status(),
        activeVersion: ACTIVE_VERSION,
      }),
    ).toBe(false);
  });

  // Criterio 5
  it("lo vuelve a exigir cuando la versión publicada cambió", () => {
    expect(
      resolveConsentRequirement({
        mode: "existing",
        consentStatus: status({ status: "outdated_version", acceptedVersion: "1.0" }),
        activeVersion: ACTIVE_VERSION,
      }),
    ).toBe(true);
  });

  it("lo exige cuando la constancia fue revocada", () => {
    expect(
      resolveConsentRequirement({
        mode: "existing",
        consentStatus: status({ status: "revoked" }),
        activeVersion: ACTIVE_VERSION,
      }),
    ).toBe(true);
  });

  it("lo exige cuando el agricultor nunca consintió", () => {
    expect(
      resolveConsentRequirement({
        mode: "existing",
        consentStatus: status({ status: "none", acceptedVersion: null }),
        activeVersion: ACTIVE_VERSION,
      }),
    ).toBe(true);
  });

  it("ante un estado desconocido peca de exigirlo, nunca de omitirlo", () => {
    expect(
      resolveConsentRequirement({
        mode: "existing",
        consentStatus: null,
        activeVersion: ACTIVE_VERSION,
      }),
    ).toBe(true);
  });
});

describe("isConsentSubmittable — habilitación del botón de continuar", () => {
  // Criterio 2
  it("no se puede continuar sin marcar la autorización de tratamiento de datos", () => {
    expect(
      isConsentSubmittable({
        acceptedDataProcessing: false,
        acceptedPhoto: false,
        acceptedAudio: false,
        acceptedVideo: false,
      }),
    ).toBe(false);
  });

  // Criterio 2 — marcar solo multimedia no alcanza
  it("marcar solo las autorizaciones multimedia no habilita el botón", () => {
    expect(
      isConsentSubmittable({
        acceptedDataProcessing: false,
        acceptedPhoto: true,
        acceptedAudio: true,
        acceptedVideo: true,
      }),
    ).toBe(false);
  });

  // Criterio 3
  it("se puede continuar con la autorización obligatoria y toda la multimedia negada", () => {
    expect(
      isConsentSubmittable({
        acceptedDataProcessing: true,
        acceptedPhoto: false,
        acceptedAudio: false,
        acceptedVideo: false,
      }),
    ).toBe(true);
  });
});

describe("buildConsentPayload — lo que se envía al backend", () => {
  it("envía las autorizaciones multimedia por separado, sin colapsarlas en una sola", () => {
    const payload = buildConsentPayload({
      sessionId: "11111111-1111-4111-8111-111111111111",
      consentDocumentId: "22222222-2222-4222-8222-222222222222",
      respondentName: "Nombre de prueba",
      acceptedDataProcessing: true,
      acceptedPhoto: true,
      acceptedAudio: false,
      acceptedVideo: false,
      acceptedFollowUpContact: true,
      acceptedAt: new Date("2026-08-27T14:00:00.000Z"),
    });

    expect(payload).toMatchObject({
      acceptedDataProcessing: true,
      acceptedPhoto: true,
      acceptedAudio: false,
      acceptedVideo: false,
      acceptedFollowUpContact: true,
    });
    expect(payload.acceptedAt).toBe("2026-08-27T14:00:00.000Z");
  });

  it("no incluye el documento de identidad si no se capturó en esta pantalla", () => {
    const payload = buildConsentPayload({
      sessionId: "11111111-1111-4111-8111-111111111111",
      consentDocumentId: "22222222-2222-4222-8222-222222222222",
      respondentName: "Nombre de prueba",
      acceptedDataProcessing: true,
      acceptedPhoto: false,
      acceptedAudio: false,
      acceptedVideo: false,
      acceptedFollowUpContact: false,
      acceptedAt: new Date(),
    });

    expect(payload).not.toHaveProperty("respondentDocumentId");
  });
});
