"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ApiError } from "@/lib/apiClient";
import {
  discardPublicSubmission,
  getSurveyResponses,
  processPublicSubmission,
} from "@/services/surveys.service";
import { listConsentRecords, type ConsentRecord } from "@/services/consents.service";
import type { DocumentCollisionInfo } from "@/app/(admin)/types";
import type { SurveyResponsesResult } from "@/app/(admin)/types";
import CollisionResolutionDialog from "@/components/admin/public-submissions/CollisionResolutionDialog";

interface PageProps {
  params: Promise<{ id: string }>;
}

type Status = "loading" | "ready" | "not-found" | "error";
type ActionState = "idle" | "processing" | "discarding" | "processed" | "discarded";

/**
 * Spec 79, criterios 10-13 — detalle de un envío público: sus respuestas, su
 * constancia de consentimiento (criterio 7) y las acciones "Crear
 * agricultor" (reutiliza extractFarmer, incluida la colisión del spec 68) y
 * "Descartar".
 */
export default function PublicSubmissionDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [status, setStatus] = useState<Status>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [survey, setSurvey] = useState<SurveyResponsesResult | null>(null);
  const [consentRecord, setConsentRecord] = useState<ConsentRecord | null>(null);
  const [actionState, setActionState] = useState<ActionState>("idle");
  const [actionError, setActionError] = useState<string | null>(null);
  const [collision, setCollision] = useState<DocumentCollisionInfo | null>(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getSurveyResponses(id),
      listConsentRecords({ surveyId: id }).catch(() => []),
    ])
      .then(([surveyData, consentRecords]) => {
        if (cancelled) return;
        setSurvey(surveyData);
        setConsentRecord(consentRecords[0] ?? null);
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) {
          setStatus("not-found");
          return;
        }
        setErrorMessage(
          err instanceof Error ? err.message : "Error al cargar el envío.",
        );
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleProcess(resolution?: "same_person" | "separate_person") {
    setActionState("processing");
    setActionError(null);
    try {
      await processPublicSubmission(id, resolution);
      setCollision(null);
      setActionState("processed");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409 && err.body) {
        const body = err.body as Partial<DocumentCollisionInfo>;
        if (body.documentId && body.submittedName && body.existingFarmer) {
          setCollision(body as DocumentCollisionInfo);
          setActionState("idle");
          return;
        }
      }
      setActionError(
        err instanceof Error ? err.message : "No se pudo procesar el envío.",
      );
      setActionState("idle");
    }
  }

  async function handleDiscard() {
    setActionState("discarding");
    setActionError(null);
    try {
      await discardPublicSubmission(id);
      setShowDiscardConfirm(false);
      setActionState("discarded");
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "No se pudo descartar el envío.",
      );
      setActionState("idle");
    }
  }

  if (status === "loading") {
    return <p className="p-4 text-sm text-[var(--text-muted)]">Cargando envío…</p>;
  }

  if (status === "not-found") {
    return (
      <div className="p-4">
        <p className="text-sm text-[var(--text-primary)]">Envío no encontrado.</p>
        <Link
          href="/admin/public-submissions"
          className="mt-3 inline-block text-sm text-brand hover:underline"
        >
          Volver a la bandeja
        </Link>
      </div>
    );
  }

  if (status === "error" || !survey) {
    return (
      <div className="p-4">
        <p className="rounded-md border border-[var(--danger-fg)]/40 bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger-fg)]">
          {errorMessage ?? "Error al cargar el envío."}
        </p>
        <Link
          href="/admin/public-submissions"
          className="mt-3 inline-block text-sm text-brand hover:underline"
        >
          Volver a la bandeja
        </Link>
      </div>
    );
  }

  const isResolved = actionState === "processed" || actionState === "discarded";

  return (
    <div className="space-y-6">
      <div className="mb-2 flex items-center gap-2 text-sm text-[var(--text-muted)]">
        <Link
          href="/admin/public-submissions"
          className="hover:text-[var(--text-primary)] transition-colors"
        >
          Envíos públicos
        </Link>
        <span>/</span>
        <span className="text-[var(--text-primary)] font-medium">
          {survey.instrumentName ?? "Envío"}
        </span>
      </div>

      {isResolved && (
        <div className="rounded-md border border-[var(--success-fg)]/30 bg-[var(--success-bg)] px-3 py-2 text-sm text-[var(--success-fg)] flex items-center justify-between gap-3">
          <span>
            {actionState === "processed"
              ? "El envío fue procesado: el agricultor quedó creado o vinculado."
              : "El envío fue descartado. Sus respuestas se conservan, pero salió de la bandeja de pendientes."}
          </span>
          <button
            type="button"
            onClick={() => router.push("/admin/public-submissions")}
            className="shrink-0 rounded-md bg-[var(--success-fg)] px-3 py-1 text-xs font-medium text-white hover:opacity-90 transition-colors"
          >
            Volver a la bandeja
          </button>
        </div>
      )}

      {actionError && (
        <p className="rounded-md border border-[var(--danger-fg)]/40 bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger-fg)]">
          {actionError}
        </p>
      )}

      <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-4 space-y-4">
        <div>
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">
            {survey.instrumentName ?? "Instrumento"}
          </h1>
          <p className="text-xs text-[var(--text-muted)]">
            Recibido {new Date(survey.syncedAt).toLocaleString("es-CO")}
          </p>
        </div>

        <div className="rounded-md border border-[var(--border)] bg-[var(--surface-muted)] p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)] mb-1">
            Consentimiento informado
          </p>
          {consentRecord ? (
            <p className="text-xs text-[var(--text-primary)]">
              Aceptó el tratamiento de datos — versión{" "}
              {consentRecord.consentDocument.version}, el{" "}
              {new Date(consentRecord.acceptedAt).toLocaleString("es-CO")}.
              {consentRecord.acceptedPhoto ||
              consentRecord.acceptedAudio ||
              consentRecord.acceptedVideo ? (
                <>
                  {" "}
                  Autorizó registro multimedia:{" "}
                  {[
                    consentRecord.acceptedPhoto && "fotografías",
                    consentRecord.acceptedAudio && "audio",
                    consentRecord.acceptedVideo && "video",
                  ]
                    .filter(Boolean)
                    .join(", ")}
                  .
                </>
              ) : null}
            </p>
          ) : (
            <p className="text-xs text-[var(--danger-fg)]">
              No se encontró constancia de consentimiento para este envío.
            </p>
          )}
        </div>

        {!isResolved && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              disabled={actionState === "processing" || actionState === "discarding"}
              onClick={() => handleProcess()}
              className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground hover:bg-brand-hover transition-colors disabled:opacity-50"
            >
              {actionState === "processing" ? "Procesando…" : "Crear agricultor"}
            </button>
            <button
              type="button"
              disabled={actionState === "processing" || actionState === "discarding"}
              onClick={() => setShowDiscardConfirm(true)}
              className="rounded-md border border-[var(--border-strong)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-muted)] transition-colors disabled:opacity-50"
            >
              Descartar
            </button>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full text-xs">
          <thead className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-[10.5px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            <tr>
              <th className="px-3 py-2.5 text-left">Sección</th>
              <th className="px-3 py-2.5 text-left">Pregunta</th>
              <th className="px-3 py-2.5 text-left">Respuesta</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {survey.responses.map((r) => (
              <tr key={r.responseId}>
                <td className="px-3 py-2.5 text-[var(--text-muted)] whitespace-nowrap">
                  {r.sectionTitle}
                </td>
                <td className="px-3 py-2.5 text-[var(--text-primary)]">{r.questionText}</td>
                <td className="px-3 py-2.5 text-[var(--text-primary)] font-medium">
                  {r.optionText ??
                    r.textValue ??
                    (r.numericValue !== null ? String(r.numericValue) : null) ??
                    (r.booleanValue !== null ? (r.booleanValue ? "Sí" : "No") : null) ??
                    "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {collision && (
        <CollisionResolutionDialog
          collision={collision}
          loading={actionState === "processing"}
          onResolve={(resolution) => void handleProcess(resolution)}
          onCancel={() => setCollision(null)}
        />
      )}

      {showDiscardConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl">
            <h3 className="text-lg font-bold text-text-primary">¿Descartar este envío?</h3>
            <p className="mt-3 text-sm text-text-muted">
              El envío saldrá de la bandeja de pendientes. Sus respuestas se conservan
              — esto no las borra.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDiscardConfirm(false)}
                className="rounded-lg border border-[var(--border-strong)] px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-muted transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={actionState === "discarding"}
                onClick={() => void handleDiscard()}
                className="rounded-lg bg-[var(--danger-fg)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-colors disabled:opacity-50"
              >
                {actionState === "discarding" ? "Descartando…" : "Descartar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
