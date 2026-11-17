import type {
  CoverageCell,
  CoverageStatus,
} from "@/lib/production-units/types";

const STYLES: Record<CoverageStatus, { label: string; className: string }> = {
  aplicado: {
    label: "Aplicado",
    className: "bg-[var(--success-bg)] text-[var(--success-fg)]",
  },
  parcial: {
    label: "Parcial",
    className: "bg-[var(--warning-bg)] text-[var(--warning-fg)]",
  },
  falta: {
    label: "Falta",
    className: "bg-[var(--danger-bg)] text-[var(--danger-fg)]",
  },
  no_aplica: {
    label: "No aplica",
    className: "bg-[var(--surface-muted)] text-[var(--text-muted)]",
  },
};

export const STATUS_LABELS: Record<CoverageStatus, string> = {
  aplicado: "Aplicado",
  parcial: "Parcial",
  falta: "Falta",
  no_aplica: "No aplica",
};

function detail(cell: CoverageCell): string | null {
  if (
    cell.totalFarmers &&
    cell.totalFarmers > 1 &&
    cell.coveredFarmers !== undefined
  ) {
    return `${cell.coveredFarmers} de ${cell.totalFarmers}`;
  }
  return null;
}

function hint(cell: CoverageCell): string | undefined {
  const notes: string[] = [];
  if (cell.surveyCount && cell.surveyCount > 1) {
    notes.push(`${cell.surveyCount} encuestas; se usa la más reciente`);
  }
  if (cell.outOfScope) notes.push("Encuesta fuera del alcance declarado");
  if (cell.inferredCrop) notes.push("Cultivo inferido");
  if (cell.inferredFarm) notes.push("Finca inferida desde el productor");
  if (cell.noRegisteredCrop) notes.push("Sin cultivo registrado");
  return notes.length ? notes.join(" · ") : undefined;
}

export function StatusChip({ cell }: { cell: CoverageCell | undefined }) {
  if (!cell) return <span className="text-[var(--text-muted)]">—</span>;
  const style = STYLES[cell.status];
  const extra = detail(cell);
  const marks =
    cell.outOfScope || cell.inferredCrop || cell.inferredFarm ? "*" : "";
  return (
    <span
      title={hint(cell)}
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[10.5px] font-medium ${style.className}`}
    >
      {style.label}
      {extra ? ` · ${extra}` : ""}
      {marks}
    </span>
  );
}
