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

/**
 * No hay preguntas `compliance` en producción hoy (ver spec 30, sección
 * "Realidad de los datos"). Este componente es un fallback de robustez
 * futura: si una opción no tiene semántica de cumplimiento reconocible,
 * usa el mismo verde genérico que SingleChoiceChart.
 */
function semaphoreColor(text: string): string {
  const normalized = text.toLowerCase();
  if (/no\s*cumple/.test(normalized)) return "#dc2626";
  if (/parcial/.test(normalized)) return "#eab308";
  if (/cumple/.test(normalized)) return "#16a34a";
  return "#15803d";
}

interface ComplianceChartProps {
  question: DashboardQuestion;
}

export default function ComplianceChart({ question }: ComplianceChartProps) {
  if (question.aggregation?.type !== "compliance") return null;

  const data = [...question.aggregation.options]
    .sort((a, b) => b.count - a.count)
    .map((opt) => ({
      name: opt.text,
      percentage: opt.percentage,
      count: opt.count,
      color: semaphoreColor(opt.text),
    }));

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
        <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
