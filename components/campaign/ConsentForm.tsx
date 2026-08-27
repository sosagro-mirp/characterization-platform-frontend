"use client";

import { useEffect, useState } from "react";
import {
  getActiveConsentDocument,
  submitConsent,
  type ConsentDocument,
  type ConsentRecord,
} from "@/services/consents.service";
import { buildConsentPayload } from "@/lib/consents/consentSubmission";
import { isConsentSubmittable } from "@/lib/consents/resolveConsentRequirement";

interface ConsentFormProps {
  sessionId: string;
  /** Nombre ya conocido del encuestado (flujo "Buscar encuestado"), si aplica. */
  defaultRespondentName?: string;
  onAccepted: (record: ConsentRecord) => void;
}

/**
 * Pantalla de consentimiento informado (spec 78). Se muestra entre la
 * identificación del encuestado y S1 cuando el encuestado es nuevo, o cuando
 * su última constancia no está vigente para la versión activa del documento.
 */
export default function ConsentForm({
  sessionId,
  defaultRespondentName,
  onAccepted,
}: ConsentFormProps) {
  const [document, setDocument] = useState<ConsentDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [respondentName, setRespondentName] = useState(defaultRespondentName ?? "");
  const [acceptedDataProcessing, setAcceptedDataProcessing] = useState(false);
  const [acceptedPhoto, setAcceptedPhoto] = useState(false);
  const [acceptedAudio, setAcceptedAudio] = useState(false);
  const [acceptedVideo, setAcceptedVideo] = useState(false);
  const [acceptedFollowUpContact, setAcceptedFollowUpContact] = useState(false);

  useEffect(() => {
    getActiveConsentDocument()
      .then(setDocument)
      .catch((err) =>
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo cargar el documento de consentimiento.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  const canSubmit =
    !!document &&
    !submitting &&
    isConsentSubmittable({
      acceptedDataProcessing,
      acceptedPhoto,
      acceptedAudio,
      acceptedVideo,
    });

  async function handleSubmit() {
    if (!document || !canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload = buildConsentPayload({
        sessionId,
        consentDocumentId: document.consentDocumentId,
        respondentName: respondentName.trim(),
        acceptedDataProcessing,
        acceptedPhoto,
        acceptedAudio,
        acceptedVideo,
        acceptedFollowUpContact,
        acceptedAt: new Date(),
      });
      const record = await submitConsent(payload);
      onAccepted(record);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo registrar el consentimiento.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-10">
        <div className="h-8 w-8 rounded-full border-4 border-brand border-t-transparent animate-spin" />
        <p className="text-sm text-text-muted">Cargando consentimiento…</p>
      </div>
    );
  }

  if (!document) {
    return (
      <p className="rounded-xl border border-[var(--danger-fg)]/30 bg-[var(--danger-bg)] p-4 text-sm text-[var(--danger-fg)]">
        {error ?? "No hay un documento de consentimiento publicado. Contacte al administrador."}
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-[var(--border)] bg-surface p-4">
        <h3 className="text-sm font-semibold text-text-primary mb-2">{document.title}</h3>
        <p className="text-xs text-text-muted mb-3">Versión {document.version}</p>
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

      <div className="space-y-2">
        <label className="block text-xs font-medium text-text-muted" htmlFor="respondent-name">
          Nombre de quien acepta
        </label>
        <input
          id="respondent-name"
          type="text"
          value={respondentName}
          onChange={(e) => setRespondentName(e.target.value)}
          placeholder="Nombre completo"
          className="w-full rounded-xl border border-[var(--border)] bg-surface px-4 py-3 text-sm focus:outline-none focus:border-brand transition-colors"
        />
      </div>

      <label className="flex items-start gap-3 rounded-xl border border-brand bg-brand-subtle-bg p-4 cursor-pointer">
        <input
          type="checkbox"
          checked={acceptedDataProcessing}
          onChange={(e) => setAcceptedDataProcessing(e.target.checked)}
          className="mt-0.5"
        />
        <span className="text-sm text-text-primary">
          Autorizo el tratamiento de mis datos personales para fines exclusivamente
          investigativos, conforme a lo descrito arriba. <span className="text-[var(--danger-fg)]">*</span>
        </span>
      </label>

      <div className="space-y-2">
        <p className="text-xs font-medium text-text-muted">
          Registro multimedia del encuentro (opcional, independiente por tipo)
        </p>
        <label className="flex items-center gap-3 rounded-xl border border-[var(--border)] p-3 cursor-pointer">
          <input
            type="checkbox"
            checked={acceptedPhoto}
            onChange={(e) => setAcceptedPhoto(e.target.checked)}
          />
          <span className="text-sm text-text-primary">Autorizo fotografías</span>
        </label>
        <label className="flex items-center gap-3 rounded-xl border border-[var(--border)] p-3 cursor-pointer">
          <input
            type="checkbox"
            checked={acceptedAudio}
            onChange={(e) => setAcceptedAudio(e.target.checked)}
          />
          <span className="text-sm text-text-primary">Autorizo grabaciones de audio</span>
        </label>
        <label className="flex items-center gap-3 rounded-xl border border-[var(--border)] p-3 cursor-pointer">
          <input
            type="checkbox"
            checked={acceptedVideo}
            onChange={(e) => setAcceptedVideo(e.target.checked)}
          />
          <span className="text-sm text-text-primary">Autorizo grabaciones de video</span>
        </label>
        <label className="flex items-center gap-3 rounded-xl border border-[var(--border)] p-3 cursor-pointer">
          <input
            type="checkbox"
            checked={acceptedFollowUpContact}
            onChange={(e) => setAcceptedFollowUpContact(e.target.checked)}
          />
          <span className="text-sm text-text-primary">
            Autorizo ser contactado en etapas posteriores del proyecto
          </span>
        </label>
      </div>

      {error && (
        <p className="rounded-xl border border-[var(--danger-fg)]/30 bg-[var(--danger-bg)] p-3 text-sm text-[var(--danger-fg)]">
          {error}
        </p>
      )}

      <button
        type="button"
        disabled={!canSubmit}
        onClick={handleSubmit}
        className="w-full rounded-xl bg-brand px-5 py-3 text-sm font-medium text-brand-foreground hover:bg-brand-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {submitting ? "Guardando…" : "Continuar"}
      </button>
    </div>
  );
}
