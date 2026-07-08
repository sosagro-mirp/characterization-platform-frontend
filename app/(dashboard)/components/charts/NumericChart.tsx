"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DashboardQuestion } from "../../types";

interface NumericChartProps {
  question: DashboardQuestion;
}

interface HistogramBin {
  label: string;
  count: number;
}

/** Algoritmo de Sturges: k = ceil(log2(n) + 1) bins entre min y max. */
function buildHistogramBins(values: number[], min: number, max: number): HistogramBin[] {
  const n = values.length;
  if (n === 0 || max === min) return [];

  const k = Math.max(1, Math.ceil(Math.log2(n) + 1));
  const binWidth = (max - min) / k;
  const bins: HistogramBin[] = Array.from({ length: k }, (_, i) => ({
    label: `${(min + i * binWidth).toFixed(1)}–${(min + (i + 1) * binWidth).toFixed(1)}`,
    count: 0,
  }));

  values.forEach((v) => {
    const idx = Math.min(k - 1, Math.floor((v - min) / binWidth));
    bins[idx].count += 1;
  });

  return bins;
}

const STAT_ITEMS: { key: "average" | "median" | "min" | "max" | "stdDev"; label: string }[] = [
  { key: "average", label: "Media" },
  { key: "median", label: "Mediana" },
  { key: "min", label: "Mínimo" },
  { key: "max", label: "Máximo" },
  { key: "stdDev", label: "Desv. estándar" },
];

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
    <div className="space-y-4">
      <dl className="grid grid-cols-3 gap-2 text-sm">
        {STAT_ITEMS.map(({ key, label }) => (
          <div key={key}>
            <dt className="text-xs text-text-muted">{label}</dt>
            <dd className="font-medium text-text-primary">
              {aggregation[key] !== null ? aggregation[key]!.toFixed(2) : "—"}
            </dd>
          </div>
        ))}
        <div>
          <dt className="text-xs text-text-muted">n</dt>
          <dd className="font-medium text-text-primary">{aggregation.count}</dd>
        </div>
      </dl>

      {bins.length > 0 && (
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={bins} margin={{ left: 0, right: 8, bottom: 24 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 9 }}
              interval={0}
              angle={-30}
              textAnchor="end"
              height={40}
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(value) => [`${value} encuestas`, "Frecuencia"]} />
            <Bar dataKey="count" fill="#15803d" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}

      {hasBoxPlot && (
        <div>
          <p className="text-xs text-text-muted mb-1">
            Distribución (mín – Q1 – Q3 – máx)
          </p>
          <ResponsiveContainer width="100%" height={70}>
            <ComposedChart
              data={boxData}
              layout="vertical"
              margin={{ top: 0, bottom: 0, left: 0, right: 8 }}
            >
              <XAxis
                type="number"
                domain={[aggregation.min!, aggregation.max!]}
                tick={{ fontSize: 10 }}
              />
              <YAxis type="category" dataKey="name" hide />
              <Tooltip />
              <Bar dataKey="whiskerRange" fill="#a3a3a3" barSize={2} />
              <Bar dataKey="box" fill="#86efac" stroke="#15803d" barSize={20} />
              <ReferenceLine x={aggregation.median!} stroke="#15803d" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
