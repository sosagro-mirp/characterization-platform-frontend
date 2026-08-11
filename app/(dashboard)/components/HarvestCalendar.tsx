"use client";

import { useState, type MouseEvent as ReactMouseEvent } from "react";
import { AggregationOption } from "../types";
import { SUPPRESSED_TOOLTIP_LABEL } from "@/lib/dashboard/suppressedOption";

const MONTHS: { name: string; short: string }[] = [
  { name: "Enero", short: "Ene" },
  { name: "Febrero", short: "Feb" },
  { name: "Marzo", short: "Mar" },
  { name: "Abril", short: "Abr" },
  { name: "Mayo", short: "May" },
  { name: "Junio", short: "Jun" },
  { name: "Julio", short: "Jul" },
  { name: "Agosto", short: "Ago" },
  { name: "Septiembre", short: "Sep" },
  { name: "Octubre", short: "Oct" },
  { name: "Noviembre", short: "Nov" },
  { name: "Diciembre", short: "Dic" },
];

const LIGHT = { r: 232, g: 242, b: 221 };
const DARK = { r: 20, g: 83, b: 45 };

/** Verde claro → verde institucional oscuro, según intensidad (0–1). */
function intensityColor(ratio: number): string {
  const r = Math.round(LIGHT.r + (DARK.r - LIGHT.r) * ratio);
  const g = Math.round(LIGHT.g + (DARK.g - LIGHT.g) * ratio);
  const b = Math.round(LIGHT.b + (DARK.b - LIGHT.b) * ratio);
  return `rgb(${r}, ${g}, ${b})`;
}

interface HarvestCalendarProps {
  /** Opciones de una pregunta "¿En qué meses...?" (multiple_choice) — texto = nombre del mes. */
  options: AggregationOption[];
}

interface HoverState {
  name: string;
  option: AggregationOption | undefined;
  x: number;
  y: number;
}

/** Calendario de cosecha (spec 43, D7): heatmap de 12 celdas — meses con
 * mayor % de menciones se pintan más oscuros. "No aplica" y cualquier texto
 * que no coincida con un mes se ignoran silenciosamente.
 *
 * Resuelto (spec 66, Fase 5, 2026-08-11): un mes suprimido por privacidad
 * (`option.suppressed`, `percentage: null`) ya no cae en 0 % — antes se veía
 * igual que "no mencionado", violando el mismo criterio D2 que el resto de
 * las gráficas (nunca mostrar una celda suprimida como cero). Ahora se pinta
 * en ámbar (`--warning-fg`), fuera de la escala de intensidad verde, con un
 * tooltip explícito.
 *
 * Ajuste de estilo (2026-08-11, a pedido del usuario): la única letra por
 * celda era ambigua (Marzo/Mayo, Junio/Julio comparten inicial) — se
 * cambió a las primeras 3 letras del mes. Se agregó una barra de escala de
 * color debajo (menos → más menciones) y un tooltip propio (HTML, no el
 * `title` nativo del navegador) con el nombre completo del mes, el
 * porcentaje y el conteo real. */
export default function HarvestCalendar({ options }: HarvestCalendarProps) {
  const [hover, setHover] = useState<HoverState | null>(null);
  const optionByMonth = new Map(options.map((option) => [option.text, option]));
  const maxPercentage = Math.max(
    1,
    ...options.filter((o) => !o.suppressed).map((o) => o.percentage ?? 0),
  );

  function handleMouseMove(e: ReactMouseEvent<HTMLDivElement>) {
    if (!hover) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setHover((prev) =>
      prev ? { ...prev, x: e.clientX - rect.left, y: e.clientY - rect.top } : prev,
    );
  }

  return (
    <div className="relative" onMouseMove={handleMouseMove} onMouseLeave={() => setHover(null)}>
      <div className="grid grid-cols-12 gap-1.5">
        {MONTHS.map(({ name, short }) => {
          const option = optionByMonth.get(name);
          const suppressed = option?.suppressed ?? false;
          const percentage = option?.percentage ?? 0;
          const ratio = percentage / maxPercentage;
          // Fase 9 (WCAG AA): a intensidad alta el fondo converge al mismo
          // verde institucional que usaba el texto fijo (`text-brand-dark`) —
          // texto invisible sobre la celda más oscura. Punto de corte simple
          // (ratio > 0.5) ya que el degradado interpola linealmente entre un
          // verde muy claro y uno muy oscuro.
          const textColorClass = ratio > 0.5 && !suppressed ? "text-white" : "text-brand-dark";
          return (
            <div
              key={name}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                setHover({
                  name,
                  option,
                  x: rect ? e.clientX - rect.left : 0,
                  y: rect ? e.clientY - rect.top : 0,
                });
              }}
              style={{
                backgroundColor: suppressed ? "var(--warning-fg)" : intensityColor(ratio),
                opacity: suppressed ? 0.5 : 1,
              }}
              className={`flex aspect-square cursor-default items-end justify-center rounded pb-1 text-[9px] font-semibold ${textColorClass}`}
            >
              {short}
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex items-center gap-2">
        <span className="text-[10px] text-text-muted">Menos</span>
        <div
          className="h-2 flex-1 rounded-full"
          style={{
            background: `linear-gradient(to right, ${intensityColor(0)}, ${intensityColor(1)})`,
          }}
        />
        <span className="text-[10px] text-text-muted">Más menciones</span>
      </div>

      {hover && (
        <div
          role="status"
          aria-live="polite"
          style={{ left: hover.x + 14, top: hover.y + 14 }}
          className="pointer-events-none absolute z-10 rounded-lg border border-[var(--border)] bg-surface/95 px-3 py-2 shadow-lg backdrop-blur-sm"
        >
          <p className="text-sm font-medium text-text-primary">{hover.name}</p>
          <p className="text-xs text-text-muted">
            {hover.option?.suppressed
              ? SUPPRESSED_TOOLTIP_LABEL
              : hover.option
                ? `${(hover.option.percentage ?? 0).toFixed(0)}% (${hover.option.count ?? 0})`
                : "Sin menciones"}
          </p>
        </div>
      )}
    </div>
  );
}
