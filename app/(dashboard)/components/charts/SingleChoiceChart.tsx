"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DashboardQuestion } from "../../types";
import { BarDatum, formatBarTooltip, toBarDatum } from "@/lib/dashboard/suppressedOption";

interface SingleChoiceChartProps {
  question: DashboardQuestion;
}

export default function SingleChoiceChart({ question }: SingleChoiceChartProps) {
  if (question.aggregation?.type !== "single_choice") return null;

  // D2 (spec 66): el orden se decide sobre las opciones reales (una celda
  // suprimida sigue existiendo, solo deja de mostrar su valor) antes de
  // mapear al placeholder de la barra.
  const data: BarDatum[] = [...question.aggregation.options]
    .sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
    .map(toBarDatum);

  const height = Math.max(120, data.length * 36);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
        <CartesianGrid horizontal={false} stroke="var(--border)" />
        <XAxis
          type="number"
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 11 }}
        />
        <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} />
        <Tooltip formatter={(_value, _name, item) => [formatBarTooltip(item.payload as BarDatum), "Respuestas"]} />
        <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
          {data.map((entry) => (
            <Cell
              key={entry.name}
              fill={entry.suppressed ? "var(--warning-fg)" : "#15803d"}
              fillOpacity={entry.suppressed ? 0.5 : 1}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
