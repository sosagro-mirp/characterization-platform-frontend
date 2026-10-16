import { Construction } from "lucide-react";

/**
 * Aviso que reemplaza al dashboard mientras se corrige la agregación de
 * preguntas `numeric_with_unit` (una categoría con 500 tumbaba la página
 * entera; ver `spec/backlog.md`, incidente del 2026-10-16). No consulta la API.
 */
export default function DashboardUnderConstruction() {
  return (
    <div className="flex justify-center px-4 py-16 sm:py-24">
      <div
        role="status"
        className="max-w-md w-full rounded-lg border border-[var(--border)] bg-surface px-6 py-10 flex flex-col items-center gap-4 text-center"
      >
        <Construction size={32} className="text-text-muted" />
        <h1 className="text-xl font-bold tracking-tight">
          Dashboard en construcción
        </h1>
        <p className="text-sm text-text-muted text-pretty leading-relaxed">
          Estamos actualizando la visualización de los datos de caracterización.
          Volverá a estar disponible pronto.
        </p>
      </div>
    </div>
  );
}
