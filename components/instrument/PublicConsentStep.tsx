"use client";

import { useState } from "react";
import type { ConsentDocument } from "@/services/consents.service";
import { isConsentSubmittable } from "@/lib/consents/resolveConsentRequirement";
import type { PublicSurveyConsentInput } from "@/lib/public-surveys/publicSurveyPayload";

interface PublicConsentStepProps {
  document: ConsentDocument;
  onAccept: (consent: PublicSurveyConsentInput) => void;
}

/**
 * Spec 79 — paso de consentimiento del canal público. A diferencia de
 * ConsentForm (spec 78, usada por el encuestador), este paso:
 * - no pide nombre de quien acepta: el respondiente lo da más adelante si el
 *   instrumento incluye una pregunta farmer.name;
 * - es bloqueante de verdad (no un banner persistente): sin marcar la
 *   autorización de tratamiento de datos no hay forma de llegar a la
 *   primera pregunta (criterio 5) — el canal público no tiene la excepción
 *   de preregistro del spec 78, porque aquí el titular siempre está
 *   presente respondiendo él mismo;
 * - no llama a un endpoint propio: el consentimiento capturado aquí viaja
 *   dentro del único envío atómico POST /api/public/surveys.
 */
export default function PublicConsentStep({
  document,
  onAccept,
}: PublicConsentStepProps) {
  const [acceptedDataProcessing, setAcceptedDataProcessing] = useState(false);
  const [acceptedPhoto, setAcceptedPhoto] = useState(false);
  const [acceptedAudio, setAcceptedAudio] = useState(false);
  const [acceptedVideo, setAcceptedVideo] = useState(false);
  const [acceptedFollowUpContact, setAcceptedFollowUpContact] = useState(false);

  const canContinue = isConsentSubmittable({
    acceptedDataProcessing,
    acceptedPhoto,
    acceptedAudio,
    acceptedVideo,
  });

  const handleContinue = () => {
    if (!canContinue) return;
    onAccept({
      consentDocumentId: document.consentDocumentId,
      acceptedDataProcessing,
      acceptedPhoto,
      acceptedAudio,
      acceptedVideo,
      acceptedFollowUpContact,
    });
  };

  return (
    <div className="min-h-[calc(100dvh-4rem)] sm:min-h-[calc(100dvh-3.5rem)] bg-surface-muted flex flex-col">
      <div className="flex-1">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          <div className="bg-surface rounded-lg shadow-sm px-6 py-4 flex items-center gap-3 justify-center">
            <div>
              <p className="text-4xl font-semibold text-brand uppercase tracking-widest text-center">
                SosAgro 4.C
              </p>
              <p className="text-xs text-text-muted leading-tight text-center">
                Plataforma de Caracterización Agrícola
              </p>
            </div>
          </div>

          <div className="bg-surface rounded-lg shadow-sm overflow-hidden">
            <div className="h-2 bg-brand" />
            <div className="px-6 py-5 space-y-5">
              <div>
                <h2 className="text-xl font-bold text-text-primary">
                  Antes de empezar
                </h2>
                <p className="mt-1 text-sm text-text-muted">
                  Lee y acepta el consentimiento informado para continuar.
                </p>
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-surface-muted p-4">
                <h3 className="text-sm font-semibold text-text-primary mb-2">
                  {document.title}
                </h3>
                <p className="text-xs text-text-muted mb-3">
                  Versión {document.version}
                </p>
                <div className="space-y-3 text-sm text-text-primary max-h-64 overflow-y-auto pr-1">
                  <p>{document.body}</p>
                  <p>{document.dataProcessingClause}</p>
                  <p>{document.multimediaClause}</p>
                  <p>{document.rightsClause}</p>
                  <p className="text-xs text-text-muted">
                    {document.responsibleEntity} — {document.contactEmail}
                  </p>
                </div>
              </div>

              <label className="flex items-start gap-3 rounded-xl border border-brand bg-brand-subtle-bg p-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedDataProcessing}
                  onChange={(e) => setAcceptedDataProcessing(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-[var(--border)] text-brand focus:ring-brand"
                />
                <span className="text-sm text-text-primary">
                  Autorizo el tratamiento de mis datos personales para fines
                  exclusivamente investigativos, conforme a lo descrito arriba.{" "}
                  <span className="text-[var(--danger-fg)]">*</span>
                </span>
              </label>

              <div className="space-y-2">
                <p className="text-xs font-medium text-text-muted">
                  Registro multimedia del encuentro (opcional, independiente por
                  tipo)
                </p>
                <label className="flex items-center gap-3 rounded-xl border border-[var(--border)] p-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedPhoto}
                    onChange={(e) => setAcceptedPhoto(e.target.checked)}
                    className="h-4 w-4 shrink-0 rounded border-[var(--border)] text-brand focus:ring-brand"
                  />
                  <span className="text-sm text-text-primary">
                    Autorizo fotografías
                  </span>
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-[var(--border)] p-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedAudio}
                    onChange={(e) => setAcceptedAudio(e.target.checked)}
                    className="h-4 w-4 shrink-0 rounded border-[var(--border)] text-brand focus:ring-brand"
                  />
                  <span className="text-sm text-text-primary">
                    Autorizo grabaciones de audio
                  </span>
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-[var(--border)] p-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedVideo}
                    onChange={(e) => setAcceptedVideo(e.target.checked)}
                    className="h-4 w-4 shrink-0 rounded border-[var(--border)] text-brand focus:ring-brand"
                  />
                  <span className="text-sm text-text-primary">
                    Autorizo grabaciones de video
                  </span>
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-[var(--border)] p-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedFollowUpContact}
                    onChange={(e) => setAcceptedFollowUpContact(e.target.checked)}
                    className="h-4 w-4 shrink-0 rounded border-[var(--border)] text-brand focus:ring-brand"
                  />
                  <span className="text-sm text-text-primary">
                    Autorizo ser contactado en etapas posteriores del proyecto
                  </span>
                </label>
              </div>

              <button
                type="button"
                disabled={!canContinue}
                onClick={handleContinue}
                className="w-full rounded-xl bg-brand px-5 py-3 text-sm font-medium text-brand-foreground hover:bg-brand-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continuar
              </button>
            </div>
          </div>

          <div className="text-center py-4 space-y-1">
            <p className="text-xs text-text-muted">
              Instituto Tecnológico Metropolitano · Proyecto SOSAgro 4C
            </p>
            <p className="text-xs text-text-muted">
              Código SIGP 108927 · Convocatoria SGR 2023–2024
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
