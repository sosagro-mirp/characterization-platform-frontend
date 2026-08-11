"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { LIKERT_SCALE_COLORS } from "@/lib/dashboard/palette";
import { DashboardQuestion } from "../../types";
import { SUPPRESSED_TOOLTIP_LABEL } from "@/lib/dashboard/suppressedOption";

/** D8 (spec 43, Fase 6): escala unificada con la matriz divergente del
 * rediseño — antes duplicaba su propia rampa semáforo (rojo→amarillo→verde),
 * distinta de la que ya usa `LikertDivergingMatrix`. */
const LEVEL_COLORS = LIKERT_SCALE_COLORS;

/** D2 (spec 66): altura mínima de barra para un nivel suprimido — nunca 0,
 * nunca ausente del gráfico (criterio de aceptación 3). */
const SUPPRESSED_BAR_PLACEHOLDER = 2;

interface LikertChartProps {
  question: DashboardQuestion;
}

export default function LikertChart({ question }: LikertChartProps) {
  if (question.aggregation?.type !== "likert") return null;
  const aggregation = question.aggregation;

  const options = [...aggregation.options].sort(
    (a, b) => (a.value ?? 0) - (b.value ?? 0),
  );
  const mid = (options.length - 1) / 2;

  const row: Record<string, number | string> = { name: "" };
  const barKeys: { key: string; color: string }[] = [];
  // D2 (spec 66): el tooltip de Recharts solo recibe (value, name) por barra
  // apilada — este mapa permite reconocer una barra suprimida por su dataKey
  // y mostrar el mensaje explícito en vez del placeholder numérico.
  const suppressedByKey = new Map<string, boolean>();

  options.forEach((opt, i) => {
    const color = LEVEL_COLORS[i % LEVEL_COLORS.length];
    const displayPercentage = opt.suppressed
      ? SUPPRESSED_BAR_PLACEHOLDER
      : (opt.percentage ?? 0);

    if (Number.isInteger(mid) && i === mid) {
      // Nivel neutro: se reparte mitad a la izquierda y mitad a la derecha del
      // cero para que la barra quede centrada (truco estándar de barra divergente).
      const half = displayPercentage / 2;
      row[`${opt.optionId}_neg`] = -half;
      row[`${opt.optionId}_pos`] = half;
      barKeys.push({ key: `${opt.optionId}_neg`, color });
      barKeys.push({ key: `${opt.optionId}_pos`, color });
      suppressedByKey.set(`${opt.optionId}_neg`, opt.suppressed);
      suppressedByKey.set(`${opt.optionId}_pos`, opt.suppressed);
    } else if (i < mid) {
      row[opt.optionId] = -displayPercentage;
      barKeys.push({ key: opt.optionId, color });
      suppressedByKey.set(opt.optionId, opt.suppressed);
    } else {
      row[opt.optionId] = displayPercentage;
      barKeys.push({ key: opt.optionId, color });
      suppressedByKey.set(opt.optionId, opt.suppressed);
    }
  });

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-text-muted">Desacuerdo ← → Acuerdo</span>
        {aggregation.isInverted && (
          <span className="text-xs rounded-full bg-warning-bg text-warning-fg px-2 py-0.5">
            Escala invertida
          </span>
        )}
      </div>

      <ResponsiveContainer width="100%" height={70}>
        <BarChart
          data={[row]}
          layout="vertical"
          stackOffset="sign"
          margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
        >
          <XAxis type="number" domain={[-100, 100]} hide />
          <YAxis type="category" dataKey="name" hide />
          <Tooltip
            formatter={(value, name) =>
              suppressedByKey.get(String(name))
                ? SUPPRESSED_TOOLTIP_LABEL
                : `${Math.abs(Number(value)).toFixed(1)}%`
            }
          />
          {barKeys.map(({ key, color }) => (
            <Bar
              key={key}
              dataKey={key}
              stackId="likert"
              fill={suppressedByKey.get(key) ? "var(--warning-fg)" : color}
              fillOpacity={suppressedByKey.get(key) ? 0.5 : 1}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>

      <div className="flex items-start justify-between gap-3 mt-2">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {options.map((opt, i) => (
            <span
              key={opt.optionId}
              className="flex items-center gap-1 text-xs text-text-muted"
            >
              <span
                className="inline-block h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: LEVEL_COLORS[i % LEVEL_COLORS.length] }}
              />
              {opt.text} ({opt.suppressed ? "oculto" : `${opt.percentage?.toFixed(0)}%`})
            </span>
          ))}
        </div>
        {aggregation.meanScore !== null && (
          <span className="text-sm font-semibold text-text-primary shrink-0">
            Media: {aggregation.meanScore.toFixed(2)} / 5
          </span>
        )}
      </div>
    </div>
  );
}
