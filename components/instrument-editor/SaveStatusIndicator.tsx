"use client";

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
    saving: { label: "Guardando…", className: "text-[var(--text-muted)]" },
    saved: { label: "Guardado", className: "text-[var(--success-fg)]" },
    error: {
      label: errorMessage ?? "Error al guardar",
      className: "text-[var(--danger-fg)]",
    },
  } as const;

  const { label, className } = config[status];

  return (
    <span className={`text-xs font-medium ${className}`}>{label}</span>
  );
}
