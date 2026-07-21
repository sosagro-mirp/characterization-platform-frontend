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

interface SingleChoiceChartProps {
  question: DashboardQuestion;
}

export default function SingleChoiceChart({ question }: SingleChoiceChartProps) {
  if (question.aggregation?.type !== "single_choice") return null;

  const data = [...question.aggregation.options]
    .sort((a, b) => b.count - a.count)
    .map((opt) => ({ name: opt.text, percentage: opt.percentage, count: opt.count }));

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
        <Tooltip
          formatter={(value, _name, item) => [
            `${Number(value).toFixed(1)}% (${(item.payload as { count: number }).count})`,
            "Respuestas",
          ]}
        />
        <Bar dataKey="percentage" fill="#15803d" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
