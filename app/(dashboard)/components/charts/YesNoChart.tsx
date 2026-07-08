"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { DashboardQuestion } from "../../types";

const COLORS = { yes: "#15803d", no: "#dc2626" };

interface YesNoChartProps {
  question: DashboardQuestion;
}

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

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={2}
          label={({ payload }) => `${payload.percentage.toFixed(0)}%`}
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value, name) => [`${value} encuestas`, name]} />
        <Legend
          formatter={(value) => {
            const item = data.find((d) => d.name === value);
            return `${value} (${item?.value ?? 0})`;
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
