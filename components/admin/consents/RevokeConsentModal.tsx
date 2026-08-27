"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { revokeConsentRecord } from "@/services/consents.service";

interface Props {
  consentRecordId: string;
  respondentName: string | null;
  onClose: () => void;
  onRevoked: () => void;
}

// Spec 78, criterio 13 — el motivo es obligatorio; el backend rechaza con 422 si falta.
export default function RevokeConsentModal({
  consentRecordId,
  respondentName,
  onClose,
  onRevoked,
}: Props) {
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await revokeConsentRecord(consentRecordId, reason.trim());
      onRevoked();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al revocar el consentimiento.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface)] shadow-xl">
        <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--surface-muted)] px-5 py-3.5">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            Revocar consentimiento
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-[var(--text-muted)] hover:bg-[var(--surface)] transition-colors"
            aria-label="Cerrar"
          >
            <X className="size-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
          <p className="text-xs text-[var(--text-muted)]">
            {respondentName
              ? `Se revocará el consentimiento de ${respondentName}. Este agricultor volverá a requerirlo en su próximo encuentro.`
              : "Se revocará esta constancia. El agricultor volverá a requerir consentimiento en su próximo encuentro."}
          </p>
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1" htmlFor="revoke-reason">
              Motivo <span className="text-[var(--danger-fg)]">*</span>
            </label>
            <textarea
              id="revoke-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Ej. Solicitud del titular vía correo"
              className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
            />
          </div>
          {error && (
            <p className="text-xs text-[var(--danger-fg)] rounded-md bg-[var(--danger-bg)] px-3 py-2">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-[var(--border)] px-3 py-2 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--surface-muted)] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!reason.trim() || saving}
              className="rounded-md bg-[var(--danger-fg)] px-3 py-2 text-xs font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? "Revocando…" : "Revocar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
