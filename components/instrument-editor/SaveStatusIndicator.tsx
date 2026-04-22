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
    saving: { label: "Guardando…", className: "text-neutral-500" },
    saved: { label: "Guardado", className: "text-green-600" },
    error: {
      label: errorMessage ?? "Error al guardar",
      className: "text-red-600",
    },
  } as const;

  const { label, className } = config[status];

  return (
    <span className={`text-xs font-medium ${className}`}>{label}</span>
  );
}
