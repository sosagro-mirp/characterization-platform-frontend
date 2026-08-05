interface IndexBarItem {
  label: string;
  value: number | null;
  suppressed?: boolean;
}

interface IndexBarsProps {
  items: IndexBarItem[];
  /** Valor máximo de la escala (D4: el índice de aceptación es sobre 5). */
  max?: number;
}

/**
 * Primitivo genérico (spec 43, D7): fila de "etiqueta + barra + valor", para
 * cualquier índice por corte (edad, nivel educativo, conectividad). No
 * asume la fuente — recibe `{label, value}[]` ya resuelto por quien lo usa.
 */
export default function IndexBars({ items, max = 5 }: IndexBarsProps) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => {
        const ratio = item.value !== null ? Math.min(1, item.value / max) : 0;
        return (
          <div key={item.label} className="flex items-center gap-2">
            <span className="w-16 shrink-0 text-right text-xs text-text-primary">
              {item.label}
            </span>
            <div className="h-2.5 flex-1 rounded-full bg-surface-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-brand"
                style={{ width: `${ratio * 100}%` }}
              />
            </div>
            <span className="w-8 shrink-0 text-right text-xs font-semibold text-text-muted">
              {item.suppressed || item.value === null
                ? "—"
                : item.value.toFixed(1)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
