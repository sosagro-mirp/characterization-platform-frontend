"use client";

import ConsentForm from "@/components/campaign/ConsentForm";
import type { ConsentRecord } from "@/services/consents.service";

interface ConsentModalProps {
  sessionId: string;
  defaultRespondentName?: string;
  onAccepted: (record: ConsentRecord) => void;
  onClose: () => void;
}

/**
 * Cambio de alcance (2026-08-28, Fase 12) — overlay que monta `ConsentForm`
 * sin navegar, para abrirse desde el aviso persistente de
 * `InstrumentQuestionFlow` en cualquier punto de la aplicación del
 * instrumento. Mismo patrón visual que `DuplicateDialog.tsx`, con
 * `max-h-[90vh] overflow-y-auto` porque el texto de `ConsentForm` es más
 * largo que un diálogo de confirmación simple.
 */
export default function ConsentModal({
  sessionId,
  defaultRespondentName,
  onAccepted,
  onClose,
}: ConsentModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-modal-title"
    >
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-surface p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h3
            id="consent-modal-title"
            className="text-base font-semibold text-text-primary"
          >
            Consentimiento informado
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="shrink-0 rounded-lg p-1 text-text-muted hover:bg-surface-muted transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <ConsentForm
          sessionId={sessionId}
          defaultRespondentName={defaultRespondentName}
          onAccepted={onAccepted}
        />
      </div>
    </div>
  );
}
