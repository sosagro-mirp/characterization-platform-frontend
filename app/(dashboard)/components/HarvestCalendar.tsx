import { AggregationOption } from "../types";

const MONTHS: { name: string; letter: string }[] = [
  { name: "Enero", letter: "E" },
  { name: "Febrero", letter: "F" },
  { name: "Marzo", letter: "M" },
  { name: "Abril", letter: "A" },
  { name: "Mayo", letter: "M" },
  { name: "Junio", letter: "J" },
  { name: "Julio", letter: "J" },
  { name: "Agosto", letter: "A" },
  { name: "Septiembre", letter: "S" },
  { name: "Octubre", letter: "O" },
  { name: "Noviembre", letter: "N" },
  { name: "Diciembre", letter: "D" },
];

/** Verde claro → verde institucional oscuro, según intensidad (0–1). */
function intensityColor(ratio: number): string {
  const light = { r: 232, g: 242, b: 221 };
  const dark = { r: 20, g: 83, b: 45 };
  const r = Math.round(light.r + (dark.r - light.r) * ratio);
  const g = Math.round(light.g + (dark.g - light.g) * ratio);
  const b = Math.round(light.b + (dark.b - light.b) * ratio);
  return `rgb(${r}, ${g}, ${b})`;
}

interface HarvestCalendarProps {
  /** Opciones de una pregunta "¿En qué meses...?" (multiple_choice) — texto = nombre del mes. */
  options: AggregationOption[];
}

/** Calendario de cosecha (spec 43, D7): heatmap de 12 celdas — meses con
 * mayor % de menciones se pintan más oscuros. "No aplica" y cualquier texto
 * que no coincida con un mes se ignoran silenciosamente. */
export default function HarvestCalendar({ options }: HarvestCalendarProps) {
  // DEBT (spec 66, D2): un mes suprimido por privacidad (`option.suppressed`,
  // `percentage: null`) cae a 0 acá — igual de invisible que "no mencionado".
  // El tratamiento visual explícito de celdas suprimidas en este heatmap
  // queda para la fase de spec 66 que cure C4 (Bloque Cacao), no se resuelve
  // acá; hoy solo se evita el `NaN`/crash de `option.percentage` nullable.
  const percentageByMonth = new Map(
    options.map((option) => [option.text, option.percentage ?? 0]),
  );
  const maxPercentage = Math.max(1, ...Array.from(percentageByMonth.values()));

  return (
    <div className="grid grid-cols-12 gap-1.5">
      {MONTHS.map(({ name, letter }) => {
        const percentage = percentageByMonth.get(name) ?? 0;
        const ratio = percentage / maxPercentage;
        // Fase 9 (WCAG AA): a intensidad alta el fondo converge al mismo
        // verde institucional que usaba el texto fijo (`text-brand-dark`) —
        // texto invisible sobre la celda más oscura. Punto de corte simple
        // (ratio > 0.5) ya que el degradado interpola linealmente entre un
        // verde muy claro y uno muy oscuro.
        const textColorClass = ratio > 0.5 ? "text-white" : "text-brand-dark";
        return (
          <div
            key={name}
            title={`${name}: ${percentage.toFixed(0)}%`}
            style={{ backgroundColor: intensityColor(ratio) }}
            className={`flex aspect-square items-end justify-center rounded pb-1 text-[10px] font-semibold ${textColorClass}`}
          >
            {letter}
          </div>
        );
      })}
    </div>
  );
}
