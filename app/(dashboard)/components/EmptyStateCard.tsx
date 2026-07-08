import { Inbox } from "lucide-react";

export default function EmptyStateCard() {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-surface-muted px-4 py-6 flex flex-col items-center gap-2 text-center">
      <Inbox size={24} className="text-text-muted" />
      <p className="text-sm text-text-muted">
        No hay encuestas sincronizadas que coincidan con estos filtros. Ajusta
        los filtros para ampliar la búsqueda.
      </p>
    </div>
  );
}
