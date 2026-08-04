import { PauseCircle } from "lucide-react";

/**
 * Estado propio (spec 43, Fase 8) para una categoría sin instrumentos
 * activos hoy (12 de 15 en el entorno de desarrollo) — distinto de "muestra
 * insuficiente": aquí no hay ninguna pregunta que agregar, sea cual sea la
 * muestra, porque ningún instrumento de la categoría está activo.
 */
export default function CategoryInactiveCard() {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-surface-muted px-4 py-6 flex flex-col items-center gap-2 text-center">
      <PauseCircle size={24} className="text-text-muted" />
      <p className="text-sm text-text-muted">
        Ninguno de los instrumentos de esta categoría está activo todavía. No
        hay preguntas ni datos que mostrar hasta que se active al menos uno.
      </p>
    </div>
  );
}
