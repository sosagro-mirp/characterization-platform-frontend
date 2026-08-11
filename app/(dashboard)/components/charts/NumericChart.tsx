"use client";

import {
  Bar,
  BarChart,
  Cell,
  ComposedChart,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DashboardQuestion } from "../../types";
import { CATEGORICAL_BAR_COLORS } from "@/lib/dashboard/palette";

interface NumericChartProps {
  question: DashboardQuestion;
}

interface HistogramBin {
  label: string;
  count: number;
  percentage: number;
}

/** Algoritmo de Sturges: k = ceil(log2(n) + 1) bins entre min y max. */
function buildHistogramBins(values: number[], min: number, max: number): HistogramBin[] {
  const n = values.length;
  if (n === 0 || max === min) return [];

  const k = Math.max(1, Math.ceil(Math.log2(n) + 1));
  const binWidth = (max - min) / k;
  const counts = Array.from({ length: k }, () => 0);

  values.forEach((v) => {
    const idx = Math.min(k - 1, Math.floor((v - min) / binWidth));
    counts[idx] += 1;
  });

  return counts.map((count, i) => ({
    label: `${(min + i * binWidth).toFixed(1)}–${(min + (i + 1) * binWidth).toFixed(1)}`,
    count,
    percentage: (count / n) * 100,
  }));
}

/** Recharts pasa x/y/width/value con tipos laxos (`number | string`) en las
 * props de contenido de un `LabelList` — no está tipado con más precisión
 * en su API pública. Ver mismo patrón en `HorizontalBarChart.tsx`. */
interface PercentageLabelProps {
  x?: number | string;
  y?: number | string;
  width?: number | string;
  value?: unknown;
}

/** Ajuste de estilo (2026-08-10): sin ejes ni grilla — solo las barras con
 * su rango debajo y el porcentaje sobre cada barra. */
function renderPercentageLabel(props: PercentageLabelProps) {
  const x = Number(props.x ?? 0);
  const y = Number(props.y ?? 0);
  const width = Number(props.width ?? 0);
  const value = typeof props.value === "number" ? props.value : Number(props.value ?? 0);
  return (
    <text
      x={x + width / 2}
      y={y - 4}
      textAnchor="middle"
      fontSize={11}
      fill="var(--text-muted)"
    >
      {`${value.toFixed(0)}%`}
    </text>
  );
}

export default function NumericChart({ question }: NumericChartProps) {
  if (question.aggregation?.type !== "numeric") return null;
  const aggregation = question.aggregation;

  const hasDistribution =
    aggregation.distribution !== undefined &&
    aggregation.distribution.length > 0 &&
    aggregation.min !== null &&
    aggregation.max !== null;

  const bins = hasDistribution
    ? buildHistogramBins(aggregation.distribution!, aggregation.min!, aggregation.max!)
    : [];

  if (bins.length === 0) return null;

  const hasBoxPlot =
    aggregation.q1 !== null &&
    aggregation.q3 !== null &&
    aggregation.min !== null &&
    aggregation.max !== null &&
    aggregation.median !== null;

  const boxData = hasBoxPlot
    ? [
        {
          name: "",
          whiskerRange: [aggregation.min!, aggregation.max!] as [number, number],
          box: [aggregation.q1!, aggregation.q3!] as [number, number],
        },
      ]
    : [];

  return (
    <div className="w-full space-y-2">
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={bins} margin={{ left: 0, right: 8, top: 16, bottom: 24 }}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 9 }}
            interval={0}
            angle={-30}
            textAnchor="end"
            height={40}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip cursor={false} formatter={(value) => [`${value} encuestas`, "Frecuencia"]} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            <LabelList dataKey="percentage" content={renderPercentageLabel} />
            {bins.map((entry, index) => (
              <Cell
                key={entry.label}
                fill={CATEGORICAL_BAR_COLORS[index % CATEGORICAL_BAR_COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {hasBoxPlot && (
        <div className="w-full">
          <ResponsiveContainer width="100%" height={36}>
            <ComposedChart
              data={boxData}
              layout="vertical"
              margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
            >
              <XAxis type="number" domain={[aggregation.min!, aggregation.max!]} hide />
              <YAxis type="category" dataKey="name" hide />
              <Tooltip cursor={false} />
              <Bar dataKey="whiskerRange" fill="var(--text-muted)" barSize={2} />
              <Bar dataKey="box" fill={CATEGORICAL_BAR_COLORS[0]} radius={4} barSize={18} />
              <ReferenceLine x={aggregation.median!} stroke="var(--text-primary)" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="flex justify-between px-1 text-[11px] text-text-muted">
            <span>Mín {aggregation.min}</span>
            <span>Q1 {aggregation.q1}</span>
            <span className="font-medium text-text-primary">Mediana {aggregation.median}</span>
            <span>Q3 {aggregation.q3}</span>
            <span>Máx {aggregation.max}</span>
          </div>
        </div>
      )}
    </div>
  );
}
