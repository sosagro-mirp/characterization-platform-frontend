interface IndicatorBarProps {
  /** Progreso de línea base sobre meta, 0–100 */
  percent: number;
  /** "primary" = barra del indicador principal (más gruesa, degradé); "sub" = sub-indicadores */
  variant?: "primary" | "sub";
}

export function IndicatorBar({ percent, variant = "sub" }: IndicatorBarProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  const trackHeight = variant === "primary" ? "h-2.5" : "h-1.5";
  const fillClass =
    variant === "primary"
      ? "bg-gradient-to-r from-brand to-accent dark:from-[#fde047] dark:to-[#fde047]"
      : "bg-accent dark:bg-[#fde047]";

  return (
    <div
      className={`w-full ${trackHeight} overflow-hidden rounded-full bg-white/10`}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full rounded-full ${fillClass}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
