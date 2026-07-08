import { EyeOff } from "lucide-react";

interface SuppressedDataCardProps {
  reason?: string;
}

export default function SuppressedDataCard({ reason }: SuppressedDataCardProps) {
  return (
    <div className="rounded-lg border border-warning-bg bg-warning-bg/40 text-warning-fg px-4 py-4 flex items-start gap-3">
      <EyeOff size={20} className="shrink-0 mt-0.5" />
      <p className="text-sm">
        {reason ??
          "La muestra de encuestas con estos filtros es insuficiente para mostrar datos (menos de 5 encuestas). Ajusta los filtros para ampliar la muestra."}
      </p>
    </div>
  );
}
