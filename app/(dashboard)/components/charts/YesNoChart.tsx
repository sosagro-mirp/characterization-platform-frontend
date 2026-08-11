"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { DashboardQuestion } from "../../types";

/** Semáforo fijo Sí/No — a diferencia de `DonutChart` (colores por texto de
 * opción, genéricos o específicos como Género), acá el color es semántico
 * y no depende del texto de la pregunta. */
const COLORS = { yes: "#15803d", no: "#dc2626" };

interface YesNoChartProps {
  question: DashboardQuestion;
}

/** Total de respuestas con separador de miles al estilo es-CO (punto). */
function formatSampleSize(count: number): string {
  return count.toLocaleString("es-CO");
}

/**
 * Ajuste de estilo (2026-08-10): mismo layout que `DonutChart` (dona sin
 * espacio entre porciones, "n" centrado en verde, leyenda propia en flexbox
 * a la derecha con porcentaje en negrita + conteo) — a pedido del usuario,
 * conservando la paleta semántica rojo/verde de Sí/No en vez de la paleta
 * categórica genérica o la específica de Género.
 */
export default function YesNoChart({ question }: YesNoChartProps) {
  if (question.aggregation?.type !== "yes_no") return null;
  const aggregation = question.aggregation;

  const data = [
    {
      name: "Sí",
      value: aggregation.yesCount,
      percentage: aggregation.yesPercentage,
      color: COLORS.yes,
    },
    {
      name: "No",
      value: aggregation.noCount,
      percentage: aggregation.noPercentage,
      color: COLORS.no,
    },
  ];

  const total = aggregation.yesCount + aggregation.noCount;

  return (
    <div className="flex w-full items-center gap-6">
      <div className="relative shrink-0" style={{ width: 160, height: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={50}
              outerRadius={78}
              paddingAngle={0}
              isAnimationActive={false}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              cursor={false}
              formatter={(value, name) => [`${value} encuestas`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-success-fg">
            {formatSampleSize(total)}
          </span>
          <span className="text-xs text-text-muted">muestras</span>
        </div>
      </div>

      <ul className="flex flex-1 flex-col gap-2">
        {data.map((entry) => (
          <li key={entry.name} className="flex items-center gap-2 text-sm">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-text-primary">{entry.name}</span>
            <span className="ml-auto flex items-baseline gap-1.5">
              <span className="font-bold text-text-primary">
                {entry.percentage.toFixed(0)}%
              </span>
              <span className="text-text-muted">({formatSampleSize(entry.value)})</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
