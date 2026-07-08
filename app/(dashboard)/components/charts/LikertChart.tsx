"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DashboardQuestion } from "../../types";

/** Rojo (desacuerdo) → amarillo (neutro) → verde (acuerdo), escala 1-5. */
const LEVEL_COLORS = ["#dc2626", "#f87171", "#eab308", "#4ade80", "#16a34a"];

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

  options.forEach((opt, i) => {
    const color = LEVEL_COLORS[i % LEVEL_COLORS.length];
    if (Number.isInteger(mid) && i === mid) {
      // Nivel neutro: se reparte mitad a la izquierda y mitad a la derecha del
      // cero para que la barra quede centrada (truco estándar de barra divergente).
      const half = opt.percentage / 2;
      row[`${opt.optionId}_neg`] = -half;
      row[`${opt.optionId}_pos`] = half;
      barKeys.push({ key: `${opt.optionId}_neg`, color });
      barKeys.push({ key: `${opt.optionId}_pos`, color });
    } else if (i < mid) {
      row[opt.optionId] = -opt.percentage;
      barKeys.push({ key: opt.optionId, color });
    } else {
      row[opt.optionId] = opt.percentage;
      barKeys.push({ key: opt.optionId, color });
    }
  });

  return (
    <div>
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
          <Tooltip formatter={(value) => `${Math.abs(Number(value)).toFixed(1)}%`} />
          {barKeys.map(({ key, color }) => (
            <Bar key={key} dataKey={key} stackId="likert" fill={color} />
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
              {opt.text} ({opt.percentage.toFixed(0)}%)
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
