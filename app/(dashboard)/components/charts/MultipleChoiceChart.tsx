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

interface MultipleChoiceChartProps {
  question: DashboardQuestion;
}

export default function MultipleChoiceChart({ question }: MultipleChoiceChartProps) {
  if (question.aggregation?.type !== "multiple_choice") return null;

  // D2 (spec 66): orden sobre el conteo real antes de aplicar el
  // placeholder de celdas suprimidas.
  const data: BarDatum[] = [...question.aggregation.options]
    .sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
    .map(toBarDatum);

  const height = Math.max(120, data.length * 36);

  return (
    <div>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
          <CartesianGrid horizontal={false} stroke="var(--border)" />
          <XAxis type="number" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} />
          <Tooltip formatter={(_value, _name, item) => [formatBarTooltip(item.payload as BarDatum), "Respuestas"]} />
          <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={entry.suppressed ? "var(--warning-fg)" : "#166534"}
                fillOpacity={entry.suppressed ? 0.5 : 1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-text-muted mt-1">
        El porcentaje es sobre el total de encuestados que respondieron. La suma
        puede superar el 100%.
      </p>
    </div>
  );
}
