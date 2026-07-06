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
}

export default function RequestDetailModal({ item, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-6 shadow-xl mx-4 flex flex-col gap-4">

        <div className="flex items-start justify-between gap-4">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">
            Detalle de la solicitud
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[var(--text-muted)] hover:bg-[var(--surface-muted)] transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <span
            className={`inline-flex rounded-full px-2 py-0.5 font-medium ${
              item.source === "mobile"
                ? "bg-[var(--info-bg)] text-[var(--info-fg)]"
                : "bg-[var(--warning-bg)] text-[var(--warning-fg)]"
            }`}
          >
            {SOURCE_LABELS[item.source] ?? item.source}
          </span>
          {item.category && (
            <span className="inline-flex rounded-full px-2 py-0.5 font-medium bg-[var(--surface-muted)] text-[var(--text-muted)]">
              {CATEGORY_LABELS[item.category] ?? item.category}
            </span>
          )}
          <span
            className={`inline-flex rounded-full px-2 py-0.5 font-medium ${
              item.status === "resolved"
                ? "bg-[var(--success-bg)] text-[var(--success-fg)]"
                : "bg-[var(--warning-bg)] text-[var(--warning-fg)]"
            }`}
          >
            {item.status === "resolved" ? "Resuelta" : "Abierta"}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
            Descripción
          </p>
          <p className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
            {item.description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs text-[var(--text-muted)] border-t border-[var(--border)] pt-3">
          <div>
            <p className="font-medium uppercase tracking-wide mb-0.5">Creado por</p>
            <p>{item.createdBy.name} {item.createdBy.lastName}</p>
          </div>
          <div>
            <p className="font-medium uppercase tracking-wide mb-0.5">Fecha</p>
            <p>{new Date(item.createdAt).toLocaleDateString("es-CO")}</p>
          </div>
          {item.resolvedAt && (
            <div>
              <p className="font-medium uppercase tracking-wide mb-0.5">Resuelta el</p>
              <p>{new Date(item.resolvedAt).toLocaleDateString("es-CO")}</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
