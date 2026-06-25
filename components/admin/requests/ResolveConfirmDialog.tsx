"use client";

import { ChangeRequestListItem } from "@/app/(admin)/types";

interface Props {
  item: ChangeRequestListItem;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

export default function ResolveConfirmDialog({ item, onConfirm, onCancel, loading }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-6 shadow-xl mx-4">
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-2">
          Marcar como resuelta
        </h2>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          ¿Confirmás que ya atendiste esta solicitud y querés marcarla como resuelta?
        </p>
        <blockquote className="border-l-4 border-[var(--brand)] pl-3 text-sm text-[var(--text-primary)] bg-[var(--surface-muted)] rounded-r-lg py-2 pr-3 mb-6 line-clamp-3">
          {item.description}
        </blockquote>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-muted)] transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--brand-hover)] transition-colors disabled:opacity-50"
          >
            {loading ? "Guardando…" : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}
