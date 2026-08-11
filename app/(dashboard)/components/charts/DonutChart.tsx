"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { DashboardQuestion } from "../../types";
import { BarDatum, formatBarTooltip, toBarDatum } from "@/lib/dashboard/suppressedOption";
import { CATEGORICAL_BAR_COLORS, GENDER_DONUT_COLORS } from "@/lib/dashboard/palette";

interface DonutChartProps {
  question: DashboardQuestion;
}

/** Ángulo mínimo visible para una porción suprimida — nunca 0 (se seguiría
 * viendo como si esa opción no existiera), nunca el valor real. */
const SUPPRESSED_SLICE_VALUE = 1;

/** Color por opción: `GENDER_DONUT_COLORS` si el texto coincide (hoy solo
 * Género del productor(a)); si no, cae a la paleta categórica genérica de
 * las barras, por posición. */
function colorForOption(text: string, index: number): string {
  return (
    GENDER_DONUT_COLORS[text] ??
    CATEGORICAL_BAR_COLORS[index % CATEGORICAL_BAR_COLORS.length]
  );
}

/** Total de respuestas con separador de miles al estilo es-CO (punto), ej.
 * 1284 → "1.284". */
function formatSampleSize(count: number): string {
  return count.toLocaleString("es-CO");
}

/**
 * Spec 66 (Fase 3, D3): torta genérica para `single_choice` con N opciones,
 * a diferencia de `YesNoChart` (fija a 2, Sí/No con colores semánticos).
 * Se activa vía `chartHint: "donut"` (curaduría por pregunta) — el default
 * de `single_choice` sigue siendo Barras (`HorizontalBarChart`); esta
 * pregunta puntual (Género del productor(a)) pidió torta.
 *
 * Ajuste de estilo (2026-08-05, mockup del usuario): leyenda a la derecha,
 * "n=" centrado dentro de la dona, colores fijos por opción (Género).
 * Implementado con flexbox + una leyenda HTML propia en vez del `<Legend>`
 * de Recharts — combinar `<Legend align="right">` con radios en % resultaba
 * frágil (la dona colapsaba a tamaño casi nulo al compartir espacio con la
 * leyenda). Este layout da control total sobre el tamaño de la dona y no
 * depende del cálculo interno de espacio compartido de Recharts.
 */
export default function DonutChart({ question }: DonutChartProps) {
  if (question.aggregation?.type !== "single_choice") return null;

  const data = [...question.aggregation.options]
    .sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
    .map(toBarDatum)
    .map((entry) => ({
      ...entry,
      pieValue: entry.suppressed ? SUPPRESSED_SLICE_VALUE : entry.percentage,
    }));

  return (
    <div className="flex w-full items-center gap-6">
      <div className="relative shrink-0" style={{ width: 160, height: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="pieValue"
              nameKey="name"
              innerRadius={50}
              outerRadius={78}
              paddingAngle={0}
              isAnimationActive={false}
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={
                    entry.suppressed
                      ? "var(--warning-fg)"
                      : colorForOption(entry.name, index)
                  }
                  fillOpacity={entry.suppressed ? 0.5 : 1}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(_value, _name, item) => [
                formatBarTooltip(item.payload as BarDatum),
                "Respuestas",
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-success-fg">
            {formatSampleSize(question.answeredCount)}
          </span>
          <span className="text-xs text-text-muted">muestras</span>
        </div>
      </div>

      <ul className="flex flex-1 flex-col gap-2">
        {data.map((entry, index) => (
          <li key={entry.name} className="flex items-center gap-2 text-sm">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{
                backgroundColor: entry.suppressed
                  ? "var(--warning-fg)"
                  : colorForOption(entry.name, index),
                opacity: entry.suppressed ? 0.5 : 1,
              }}
            />
            <span className="text-text-primary">{entry.name}</span>
            <span className="ml-auto flex items-baseline gap-1.5">
              <span className="font-bold text-text-primary">
                {entry.suppressed ? "—" : `${entry.percentage.toFixed(0)}%`}
              </span>
              <span className="text-text-muted">
                {entry.suppressed ? "" : `(${formatSampleSize(entry.count ?? 0)})`}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
