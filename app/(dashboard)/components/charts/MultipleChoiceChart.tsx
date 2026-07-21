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

interface MultipleChoiceChartProps {
  question: DashboardQuestion;
}

export default function MultipleChoiceChart({ question }: MultipleChoiceChartProps) {
  if (question.aggregation?.type !== "multiple_choice") return null;

  const data = [...question.aggregation.options]
    .sort((a, b) => b.count - a.count)
    .map((opt) => ({ name: opt.text, percentage: opt.percentage, count: opt.count }));

  const height = Math.max(120, data.length * 36);

  return (
    <div>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
          <CartesianGrid horizontal={false} stroke="var(--border)" />
          <XAxis type="number" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(value, _name, item) => [
              `${Number(value).toFixed(1)}% (${(item.payload as { count: number }).count})`,
              "Respuestas",
            ]}
          />
          <Bar dataKey="percentage" fill="#166534" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-text-muted mt-1">
        El porcentaje es sobre el total de encuestados que respondieron. La suma
        puede superar el 100%.
      </p>
    </div>
  );
}
