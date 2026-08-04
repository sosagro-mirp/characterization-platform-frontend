"use client";

import { Check, LoaderCircle, TriangleAlert } from "lucide-react";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface SaveStatusIndicatorProps {
  status: SaveStatus;
  errorMessage?: string;
}

export default function SaveStatusIndicator({
  status,
  errorMessage,
}: SaveStatusIndicatorProps) {
  if (status === "idle") return null;

  const config = {
    saving: {
      label: "Guardando…",
      className: "bg-[var(--surface-muted)] text-[var(--text-muted)]",
      icon: <LoaderCircle className="size-3.5 shrink-0 animate-spin" aria-hidden="true" />,
    },
    saved: {
      label: "Cambios guardados",
      className: "bg-[var(--success-bg)] text-[var(--success-fg)]",
      icon: <Check className="size-3.5 shrink-0" aria-hidden="true" />,
    },
    error: {
      label: errorMessage ?? "Error al guardar",
      className: "bg-[var(--danger-bg)] text-[var(--danger-fg)]",
      icon: <TriangleAlert className="size-3.5 shrink-0" aria-hidden="true" />,
    },
  } as const;

  const { label, className, icon } = config[status];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap ${className}`}>
      {icon}
      {label}
    </span>
  );
}
