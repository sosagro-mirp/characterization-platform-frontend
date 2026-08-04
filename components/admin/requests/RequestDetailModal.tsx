"use client";

import { X } from "lucide-react";
import { ChangeRequestListItem } from "@/app/(admin)/types";

const SOURCE_LABELS: Record<string, string> = { mobile: "Mobile", web: "Web" };
const CATEGORY_LABELS: Record<string, string> = {
  bug_ui: "Bug UI",
  data_error: "Error de datos",
  suggestion: "Sugerencia",
  other: "Otro",
};

interface Props {
  item: ChangeRequestListItem;
  onClose: () => void;
  onResolve?: (item: ChangeRequestListItem) => void;
}

export default function RequestDetailModal({ item, onClose, onResolve }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface)] shadow-xl">
        <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--surface-muted)] px-5 py-3.5">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            Detalle de la solicitud
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

        <div className="flex flex-col gap-4 p-5">
          <div className="grid grid-cols-3 gap-px overflow-hidden rounded-md border border-[var(--border)] bg-[var(--border)]">
            <div className="bg-[var(--surface-muted)] px-3.5 py-2.5">
              <p className="mb-1 text-[9.5px] uppercase tracking-wide text-[var(--text-muted)]">Origen</p>
              <p className="text-xs font-medium text-[var(--text-primary)]">
                {SOURCE_LABELS[item.source] ?? item.source}
              </p>
            </div>
            <div className="bg-[var(--surface-muted)] px-3.5 py-2.5">
              <p className="mb-1 text-[9.5px] uppercase tracking-wide text-[var(--text-muted)]">Categoría</p>
              <p className="text-xs font-medium text-[var(--text-primary)]">
                {item.category ? (CATEGORY_LABELS[item.category] ?? item.category) : "—"}
              </p>
            </div>
            <div className="bg-[var(--surface-muted)] px-3.5 py-2.5">
              <p className="mb-1 text-[9.5px] uppercase tracking-wide text-[var(--text-muted)]">Estado</p>
              <p className="text-xs font-medium text-[var(--text-primary)]">
                {item.status === "resolved" ? "Resuelta" : "Abierta"}
              </p>
            </div>
            <div className="bg-[var(--surface-muted)] px-3.5 py-2.5">
              <p className="mb-1 text-[9.5px] uppercase tracking-wide text-[var(--text-muted)]">Creado por</p>
              <p className="text-xs font-medium text-[var(--text-primary)]">
                {item.createdBy.name} {item.createdBy.lastName}
              </p>
            </div>
            <div className="bg-[var(--surface-muted)] px-3.5 py-2.5">
              <p className="mb-1 text-[9.5px] uppercase tracking-wide text-[var(--text-muted)]">Fecha</p>
              <p className="text-xs font-medium text-[var(--text-primary)]">
                {new Date(item.createdAt).toLocaleDateString("es-CO")}
              </p>
            </div>
            {item.resolvedAt && (
              <div className="bg-[var(--surface-muted)] px-3.5 py-2.5">
                <p className="mb-1 text-[9.5px] uppercase tracking-wide text-[var(--text-muted)]">Resuelta el</p>
                <p className="text-xs font-medium text-[var(--text-primary)]">
                  {new Date(item.resolvedAt).toLocaleDateString("es-CO")}
                </p>
              </div>
            )}
          </div>

          <div>
            <p className="mb-2 text-[10.5px] uppercase tracking-wide text-[var(--text-muted)]">
              Descripción
            </p>
            <p className="border-l-2 border-[var(--brand)] pl-3.5 text-sm leading-relaxed text-[var(--text-primary)] whitespace-pre-wrap">
              {item.description}
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-muted)] transition-colors"
            >
              Cerrar
            </button>
            {item.status === "open" && onResolve && (
              <button
                type="button"
                onClick={() => onResolve(item)}
                className="rounded-md bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-[var(--brand-foreground)] hover:bg-[var(--brand-hover)] transition-colors"
              >
                Marcar como resuelta
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
