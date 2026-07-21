"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DashboardQuestion } from "../../types";

interface YesNoBatteryChartProps {
  /** Preguntas yes_no de una misma sección (el llamador agrupa por sección). */
  questions: DashboardQuestion[];
}

/**
 * Convierte N donuts Sí/No de una misma sección en un único gráfico
 * comparable de "% Sí" — más legible que N gráficos circulares dispersos.
 */
export default function YesNoBatteryChart({ questions }: YesNoBatteryChartProps) {
  const items = questions
    .filter(
      (q): q is DashboardQuestion & { aggregation: { type: "yes_no"; yesPercentage: number } } =>
        !q.suppressed && q.aggregation?.type === "yes_no",
    )
    .map((q) => ({
      name: q.questionText,
      yesPercentage: q.aggregation.yesPercentage,
      answeredCount: q.answeredCount,
    }))
    .sort((a, b) => b.yesPercentage - a.yesPercentage);

  if (items.length < 2) return null;

  const height = Math.max(120, items.length * 36);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={items} layout="vertical" margin={{ left: 8, right: 24 }}>
        <CartesianGrid horizontal={false} stroke="var(--border)" />
        <XAxis
          type="number"
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 11 }}
        />
        <YAxis type="category" dataKey="name" width={220} tick={{ fontSize: 10 }} />
        <Tooltip
          formatter={(value, _name, item) => [
            `${Number(value).toFixed(1)}% Sí (n=${(item.payload as { answeredCount: number }).answeredCount})`,
            "Respuesta",
          ]}
        />
        <Bar dataKey="yesPercentage" fill="#15803d" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
