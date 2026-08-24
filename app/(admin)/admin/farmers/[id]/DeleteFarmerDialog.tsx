"use client";

import { useEffect, useState } from "react";
import { FarmerDeletionPreview } from "@/app/(admin)/types";
import { getFarmerDeletionPreview } from "@/services/farmers.service";
import {
  isDeletionConfirmed,
  summarizeDeletionPreview,
} from "@/lib/farmers/cascadeDeletion";

interface DeleteFarmerDialogProps {
  farmerId: string;
  deleting: boolean;
  /** Error del intento de confirmación (borrado), no del preview inicial. */
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Spec 73 — diálogo de eliminación en cascada de un agricultor. A diferencia
 * de `ConfirmDialog` (usado en `admin/users/[id]`), este carga un inventario
 * real antes de habilitar el borrado y exige escribir el documento (o el
 * nombre, si no tiene) del agricultor — el riesgo es irreversible y sobre
 * datos de campo, no solo un registro de usuario.
 *
 * El padre lo monta condicionalmente (`{confirmDelete && <DeleteFarmerDialog
 * .../>}`) en vez de pasarle un prop `open`: así cada apertura es un montaje
 * nuevo, con el estado de carga ya resuelto desde el `useState` inicial, sin
 * necesidad de resetearlo con un `setState` síncrono dentro de un efecto.
 */
export default function DeleteFarmerDialog({
  farmerId,
  deleting,
  error,
  onConfirm,
  onCancel,
}: DeleteFarmerDialogProps) {
  const [preview, setPreview] = useState<FarmerDeletionPreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    let cancelled = false;
    getFarmerDeletionPreview(farmerId)
      .then((p) => {
        if (!cancelled) setPreview(p);
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setPreviewError(
            err instanceof Error
              ? err.message
              : "No se pudo cargar el inventario de borrado.",
          );
      })
      .finally(() => {
        if (!cancelled) setLoadingPreview(false);
      });
    return () => {
      cancelled = true;
    };
  }, [farmerId]);

  const confirmationTarget = preview?.documentId ?? preview?.name ?? "";
  const canConfirm = !!preview && isDeletionConfirmed(typed, preview);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-[var(--surface)] p-6 shadow-xl">
        <h2 className="text-base font-semibold text-[var(--text-primary)]">
          Eliminar agricultor
        </h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Esta acción es irreversible: borra al agricultor y todos sus datos
          de campo asociados.
        </p>

        {loadingPreview && (
          <p className="mt-4 text-sm text-[var(--text-muted)]">
            Calculando qué se va a borrar…
          </p>
        )}

        {previewError && (
          <p className="mt-4 text-sm text-[var(--danger-fg)] rounded-lg bg-[var(--danger-bg)] px-3 py-2">
            {previewError}
          </p>
        )}

        {!loadingPreview && preview && (
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
              <p className="text-xs font-medium text-[var(--text-muted)]">
                Se eliminará
              </p>
              <ul className="mt-1 space-y-1 text-sm text-[var(--text-primary)]">
                {summarizeDeletionPreview(preview).map((line, i) => (
                  <li key={i}>• {line}</li>
                ))}
                {summarizeDeletionPreview(preview).length === 0 && (
                  <li>
                    • Solo el registro del agricultor — no tiene datos
                    derivados.
                  </li>
                )}
              </ul>
            </div>

            <div>
              <label
                htmlFor="delete-farmer-confirm"
                className="mb-1 block text-xs font-medium text-[var(--text-muted)]"
              >
                {preview.documentId
                  ? `Escribe el documento del agricultor (${confirmationTarget}) para confirmar`
                  : `Escribe el nombre del agricultor (${confirmationTarget}) para confirmar`}
              </label>
              <input
                id="delete-farmer-confirm"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--danger-fg)]"
                autoComplete="off"
              />
            </div>
          </div>
        )}

        {error && (
          <p className="mt-4 text-sm text-[var(--danger-fg)] rounded-lg bg-[var(--danger-bg)] px-3 py-2">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-muted)] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!canConfirm || deleting}
            onClick={onConfirm}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white bg-[var(--danger-fg)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {deleting ? "Eliminando…" : "Sí, eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}
