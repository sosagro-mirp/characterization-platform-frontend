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
import {
  SUPPRESSED_TOOLTIP_LABEL,
  yesNoToBarDatum,
} from "@/lib/dashboard/suppressedOption";

interface YesNoBatteryChartProps {
  /** Preguntas yes_no de una misma sección (el llamador agrupa por sección). */
  questions: DashboardQuestion[];
}

/**
 * DEBT (spec 107): este componente no se importa en ninguna vista (ni en `development`
 * antes del spec); se conserva con su tratamiento de celdas suprimidas hasta decidir
 * si se reincorpora a `QuestionsAnalysisSection` o se retira.
 *
 * Convierte N donuts Sí/No de una misma sección en un único gráfico
 * comparable de "% Sí" — más legible que N gráficos circulares dispersos.
 */
export default function YesNoBatteryChart({
  questions,
}: YesNoBatteryChartProps) {
  // Los Sí/No suprimidos por privacidad se muestran atenuados con el
  // placeholder de `suppressedOption.ts`, no se omiten en silencio.
  const items = questions
    .filter((q) => q.questionType === "yes_no")
    .map((q) => {
      const datum = yesNoToBarDatum(q, q.questionText);
      return {
        name: datum.name,
        yesPercentage: datum.percentage,
        suppressed: datum.suppressed,
        answeredCount: q.answeredCount,
      };
    })
    .sort(
      (a, b) =>
        Number(a.suppressed) - Number(b.suppressed) ||
        b.yesPercentage - a.yesPercentage,
    );

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
        <YAxis
          type="category"
          dataKey="name"
          width={220}
          tick={{ fontSize: 10 }}
        />
        <Tooltip
          formatter={(value, _name, item) => {
            const row = item.payload as {
              answeredCount: number;
              suppressed: boolean;
            };
            return row.suppressed
              ? [SUPPRESSED_TOOLTIP_LABEL, "Respuesta"]
              : [
                  `${Number(value).toFixed(1)}% Sí (n=${row.answeredCount})`,
                  "Respuesta",
                ];
          }}
        />
        <Bar dataKey="yesPercentage" fill="#15803d" radius={[0, 4, 4, 0]}>
          {items.map((item) => (
            <Cell
              key={item.name}
              fill={item.suppressed ? "var(--text-muted)" : "#15803d"}
              fillOpacity={item.suppressed ? 0.35 : 1}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
