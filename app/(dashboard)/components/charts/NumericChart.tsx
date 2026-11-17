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
import { binsToHistogram, describeHistogram } from "@/lib/dashboard/histogram";
import { DashboardQuestion } from "../../types";
import { CATEGORICAL_BAR_COLORS } from "@/lib/dashboard/palette";
import { SUPPRESSED_TOOLTIP_LABEL } from "@/lib/dashboard/suppressedOption";

interface NumericChartProps {
  question: DashboardQuestion;
}

/** Recharts pasa x/y/width/value con tipos laxos (`number | string`) en las
 * props de contenido de un `LabelList` — no está tipado con más precisión
 * en su API pública. Ver mismo patrón en `HorizontalBarChart.tsx`. */
interface PercentageLabelProps {
  x?: number | string;
  y?: number | string;
  width?: number | string;
  value?: unknown;
  index?: number;
}

/** Ajuste de estilo (2026-08-10): sin ejes ni grilla — solo las barras con
 * su rango debajo y el porcentaje sobre cada barra. */
function renderPercentageLabel(
  props: PercentageLabelProps,
  suppressed: boolean[],
) {
  const x = Number(props.x ?? 0);
  const y = Number(props.y ?? 0);
  const width = Number(props.width ?? 0);
  const value =
    typeof props.value === "number" ? props.value : Number(props.value ?? 0);
  return (
    <text
      x={x + width / 2}
      y={y - 4}
      textAnchor="middle"
      fontSize={11}
      fill="var(--text-muted)"
    >
      {suppressed[Number(props.index ?? -1)]
        ? "Oculto"
        : `${value.toFixed(0)}%`}
    </text>
  );
}

export default function NumericChart({ question }: NumericChartProps) {
  if (question.aggregation?.type !== "numeric") return null;
  const aggregation = question.aggregation;

  const bins = binsToHistogram(aggregation.bins ?? []);

  if (bins.length === 0) return null;

  // Spec 107 (P24): el box plot muestra solo Q1–mediana–Q3 (sin bigotes
  // min–max); el backend los entrega solo con suficientes respuestas.
  const hasBoxPlot =
    aggregation.q1 !== null &&
    aggregation.q3 !== null &&
    aggregation.median !== null;

  const boxData = hasBoxPlot
    ? [
        {
          name: "",
          box: [aggregation.q1!, aggregation.q3!] as [number, number],
        },
      ]
    : [];

  return (
    <div className="w-full space-y-2">
      <div role="img" aria-label={`Histograma: ${describeHistogram(bins)}`}>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart
            accessibilityLayer={false}
            data={bins}
            margin={{ left: 0, right: 8, top: 16, bottom: 24 }}
          >
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
            <Tooltip
              cursor={false}
              formatter={(_value, _name, item) => {
                const bar = item.payload as {
                  suppressed?: boolean;
                  count: number | null;
                };
                return bar.suppressed
                  ? [SUPPRESSED_TOOLTIP_LABEL, "Frecuencia"]
                  : [`${bar.count} encuestas`, "Frecuencia"];
              }}
            />
            <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
              <LabelList
                dataKey="percentage"
                content={(props: PercentageLabelProps) =>
                  renderPercentageLabel(
                    props,
                    bins.map((bin) => bin.suppressed),
                  )
                }
              />
              {bins.map((entry, index) => (
                <Cell
                  key={entry.label}
                  fill={
                    entry.suppressed
                      ? "var(--text-muted)"
                      : CATEGORICAL_BAR_COLORS[
                          index % CATEGORICAL_BAR_COLORS.length
                        ]
                  }
                  fillOpacity={entry.suppressed ? 0.35 : 1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {hasBoxPlot && (
        <div className="w-full">
          <ResponsiveContainer width="100%" height={36}>
            <ComposedChart
              accessibilityLayer={false}
              data={boxData}
              layout="vertical"
              margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
            >
              <XAxis
                type="number"
                domain={[
                  aggregation.q1! - Math.max((aggregation.q3! - aggregation.q1!) * 0.5, 1),
                  aggregation.q3! + Math.max((aggregation.q3! - aggregation.q1!) * 0.5, 1),
                ]}
                hide
              />
              <YAxis type="category" dataKey="name" hide />
              <Tooltip cursor={false} />
              <Bar
                dataKey="box"
                fill={CATEGORICAL_BAR_COLORS[0]}
                radius={4}
                barSize={18}
              />
              <ReferenceLine
                x={aggregation.median!}
                stroke="var(--text-primary)"
                strokeWidth={2}
              />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="flex justify-between px-1 text-[11px] text-text-muted">
            <span>Q1 {aggregation.q1}</span>
            <span className="font-medium text-text-primary">
              Mediana {aggregation.median}
            </span>
            <span>Q3 {aggregation.q3}</span>
          </div>
        </div>
      )}
    </div>
  );
}
