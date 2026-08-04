"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { cropColor } from "@/lib/dashboard/palette";
import { DashboardOverviewBucket } from "../types";
import CropChips from "./CropChips";

interface CropDonutProps {
  data: DashboardOverviewBucket[];
}

/** Donut de distribución por cultivo (spec 43, Fase 6) — fuente: `/overview`
 * `byCrop`. D7: Recharts, no un `conic-gradient` CSS como el mockup. */
export default function CropDonut({ data }: CropDonutProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  if (total === 0) {
    return (
      <p className="text-sm text-text-muted text-center py-8">
        Sin datos suficientes para esta distribución.
      </p>
    );
  }

  const chartData = data.map((item) => ({
    name: item.name,
    value: item.count,
    count: item.count,
    percentage: (item.count / total) * 100,
    color: cropColor(item.name),
  }));

  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0" style={{ width: 132, height: 132 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={40}
              outerRadius={64}
              paddingAngle={2}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, _name, item) => [
                `${Number(value)} (${(item.payload as { percentage: number }).percentage.toFixed(0)}%)`,
                item.payload && "name" in item.payload
                  ? (item.payload as { name: string }).name
                  : "",
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          {/* Fase 9 (WCAG AA): `text-text-primary` reactivo, no `text-brand-dark`
              fijo — este número se apoya en `--surface` (blanco/oscuro según
              tema), y el verde institucional fijo pierde contraste en oscuro
              contra un fondo que también se oscurece. */}
          <span className="text-xl font-extrabold text-text-primary">
            {total.toLocaleString("es-CO")}
          </span>
          <span className="text-[9px] text-text-muted">productores</span>
        </div>
      </div>

      <div className="flex-1">
        <CropChips items={chartData} />
      </div>
    </div>
  );
}
