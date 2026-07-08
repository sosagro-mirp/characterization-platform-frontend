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

interface LikertBatteryChartProps {
  questions: DashboardQuestion[];
}

/**
 * Ranking de medias de acuerdo (escala 1-5) para todas las preguntas likert
 * de la muestra — explota que 129 ítems de S_DCU comparten la misma escala
 * (ver spec 30, "Realidad de los datos"). Ordenado descendente: los ítems de
 * mayor acuerdo arriba.
 */
export default function LikertBatteryChart({ questions }: LikertBatteryChartProps) {
  const items = questions
    .filter(
      (q): q is DashboardQuestion & { aggregation: { type: "likert"; meanScore: number } } =>
        !q.suppressed &&
        q.aggregation?.type === "likert" &&
        q.aggregation.meanScore !== null,
    )
    .map((q) => ({ name: q.questionText, meanScore: q.aggregation.meanScore }))
    .sort((a, b) => b.meanScore - a.meanScore);

  if (items.length < 2) return null;

  const height = Math.max(160, items.length * 40);

  return (
    <div>
      <p className="text-sm font-medium text-text-primary mb-2">
        Batería de escalas de acuerdo — ranking por media (1–5)
      </p>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={items} layout="vertical" margin={{ left: 8, right: 24 }}>
          <CartesianGrid horizontal={false} stroke="var(--border)" />
          <XAxis type="number" domain={[1, 5]} tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="name" width={260} tick={{ fontSize: 10 }} />
          <Tooltip formatter={(value) => [Number(value).toFixed(2), "Media"]} />
          <Bar dataKey="meanScore" fill="#15803d" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
