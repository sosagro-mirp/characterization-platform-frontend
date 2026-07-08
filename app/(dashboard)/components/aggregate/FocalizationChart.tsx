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

interface FocalizationChartProps {
  questions: DashboardQuestion[];
}

/** Detecta la pregunta de focalización social por su texto (no hay un
 * `systemField` dedicado para ella en el backend). Ver S1a: "¿Pertenece el
 * productor a alguno de los siguientes grupos o territorios?" */
const FOCALIZATION_PATTERN = /narp|lgbtiq|pdet|zomac|grupos?.{0,20}territorios?/i;

export default function FocalizationChart({ questions }: FocalizationChartProps) {
  const question = questions.find(
    (q) =>
      !q.suppressed &&
      q.questionType === "multiple_choice" &&
      FOCALIZATION_PATTERN.test(q.questionText),
  );

  if (!question || question.aggregation?.type !== "multiple_choice") return null;

  const data = [...question.aggregation.options]
    .sort((a, b) => b.count - a.count)
    .map((opt) => ({ name: opt.text, percentage: opt.percentage, count: opt.count }));

  const height = Math.max(120, data.length * 36);

  return (
    <div>
      <p className="text-sm font-medium text-text-primary mb-2">
        {question.questionText}
      </p>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
          <CartesianGrid horizontal={false} stroke="var(--border)" />
          <XAxis type="number" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(value, _name, item) => [
              `${Number(value).toFixed(1)}% (${(item.payload as { count: number }).count})`,
              "Respuestas",
            ]}
          />
          <Bar dataKey="percentage" fill="#facc15" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-text-muted mt-1">
        Cruce de enfoque diferencial y equidad. El porcentaje es sobre el total
        de encuestados que respondieron; la suma puede superar el 100%.
      </p>
    </div>
  );
}
