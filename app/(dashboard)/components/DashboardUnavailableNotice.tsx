import { TriangleAlert } from "lucide-react";

/**
 * Aviso permanente sobre el dashboard mientras se rehacen sus fuentes de datos
 * (spec 84: al retirar instrumentos, varias categorías dejan de tener datos;
 * los ajustes viven en `spec/backlog.md` y se harán en un spec aparte).
 * El contenido sigue visible debajo: el aviso no bloquea la navegación.
 */
export default function DashboardUnavailableNotice() {
  return (
    <div
      role="status"
      className="rounded-lg border border-warning-bg bg-warning-bg/40 text-warning-fg px-4 py-3 flex items-start gap-3"
    >
      <TriangleAlert size={20} className="shrink-0 mt-0.5" />
      <p className="text-sm">
        <span className="font-semibold">Actualmente no está disponible.</span>{" "}
        Estamos actualizando los instrumentos de caracterización, así que los
        datos de esta página están incompletos y pueden cambiar.
      </p>
    </div>
  );
}
