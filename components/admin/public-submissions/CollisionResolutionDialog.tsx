"use client";

import type { DocumentCollisionInfo } from "@/app/(admin)/types";

interface CollisionResolutionDialogProps {
  collision: DocumentCollisionInfo;
  onResolve: (resolution: "same_person" | "separate_person") => void;
  onCancel: () => void;
  loading?: boolean;
}

/**
 * Spec 79 — declaración de resolución cuando `process-public` responde 409
 * (colisión de documentId, spec 68). No existía un diálogo equivalente en
 * `frontend/`: la resolución de colisiones solo estaba resuelta en mobile.
 * Estilo visual tomado de components/campaign/DuplicateDialog.tsx (mismo
 * patrón de diálogo de decisión con advertencia).
 */
export default function CollisionResolutionDialog({
  collision,
  onResolve,
  onCancel,
  loading = false,
}: CollisionResolutionDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="collision-dialog-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl">
        <div className="mb-4 flex items-start gap-3">
          <div className="mt-0.5 shrink-0 rounded-full bg-[var(--warning-bg)] p-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-5 text-[var(--warning-fg)]"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
          </div>
          <div>
            <h3
              id="collision-dialog-title"
              className="text-base font-semibold text-text-primary"
            >
              El documento ya está registrado
            </h3>
            <p className="mt-1 text-sm text-text-muted">
              El documento <span className="font-medium">{collision.documentId}</span>{" "}
              ya pertenece a{" "}
              <span className="font-medium">{collision.existingFarmer.name}</span>, pero
              este envío respondió el nombre{" "}
              <span className="font-medium">{collision.submittedName}</span>. ¿Es la
              misma persona?
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => onResolve("same_person")}
            className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-brand-foreground hover:bg-brand-hover transition-colors disabled:opacity-50"
          >
            Es la misma persona
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => onResolve("separate_person")}
            className="w-full rounded-lg border border-[var(--border-strong)] px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-surface-muted transition-colors disabled:opacity-50"
          >
            Son personas distintas — crear un agricultor nuevo
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="w-full px-4 py-2 text-sm font-medium text-text-muted hover:text-text-primary transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
