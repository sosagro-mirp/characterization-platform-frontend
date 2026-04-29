interface IndicatorBarProps {
  baseline: number;
  target: number;
  /** Valor mínimo del eje (default: 0). Útil para comprimir rangos pequeños. */
  axisMin?: number;
  /** Valor máximo del eje (default: target * 1.05). */
  axisMax?: number;
  /** Cantidad de decimales a mostrar */
  precision?: number;
}

export function IndicatorBar({
  baseline,
  target,
  axisMin = 0,
  axisMax,
  precision = 2,
}: IndicatorBarProps) {
  const max = axisMax ?? target * 1.05;
  const range = max - axisMin;
  const baselinePct = ((baseline - axisMin) / range) * 100;
  const targetPct = ((target - axisMin) / range) * 100;
  const deltaPct = targetPct - baselinePct;

  const fmt = (n: number) => n.toFixed(precision).replace(/\.?0+$/, "");

  return (
    <div className="w-full">
      <div className="relative h-3 rounded-full bg-gray-100">
        {/* segmento línea base → meta */}
        <div
          className="absolute top-0 h-full rounded-full bg-brand"
          style={{
            left: `${baselinePct}%`,
            width: `${deltaPct}%`,
          }}
          aria-hidden="true"
        />
        {/* marcador línea base */}
        <span
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 border-white bg-gray-400 shadow-sm"
          style={{ left: `${baselinePct}%` }}
          aria-hidden="true"
        />
        {/* marcador meta */}
        <span
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 rounded-full border-2 border-white bg-brand-dark shadow-sm ring-4 ring-brand/20"
          style={{ left: `${targetPct}%` }}
          aria-hidden="true"
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
        <div className="flex flex-col">
          <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">
            Línea base
          </span>
          <span className="text-base font-bold text-gray-700">
            {fmt(baseline)}
          </span>
        </div>
        <div className="flex flex-col items-end text-right">
          <span className="font-bold text-brand uppercase tracking-wider text-[10px]">
            Meta
          </span>
          <span className="text-base font-bold text-brand-dark">
            {fmt(target)}
          </span>
        </div>
      </div>
    </div>
  );
}
