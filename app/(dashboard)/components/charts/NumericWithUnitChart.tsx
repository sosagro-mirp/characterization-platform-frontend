"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { binsToHistogram, describeHistogram } from "@/lib/dashboard/histogram";
import { SUPPRESSED_TOOLTIP_LABEL } from "@/lib/dashboard/suppressedOption";
import {
  defaultUnitIndex,
  hasUnitStats,
} from "@/lib/dashboard/numericWithUnit";
import { DashboardQuestion } from "../../types";

interface NumericWithUnitChartProps {
  question: DashboardQuestion;
}

const STAT_ITEMS: {
  key: "average" | "median" | "q1" | "q3" | "stdDev";
  label: string;
}[] = [
  { key: "average", label: "Media" },
  { key: "median", label: "Mediana" },
  { key: "q1", label: "Q1" },
  { key: "q3", label: "Q3" },
  { key: "stdDev", label: "Desv. estándar" },
];

/**
 * `numeric_with_unit`: los valores se muestran por unidad, sin convertir
 * entre unidades. La normalización por factor se decide pregunta a pregunta
 * en la curaduría del dashboard (spec 66).
 */
export default function NumericWithUnitChart({
  question,
}: NumericWithUnitChartProps) {
  const aggregation =
    question.aggregation?.type === "numeric_with_unit"
      ? question.aggregation
      : null;
  // Se guarda la unidad por `optionId`, no por posición: al cambiar los
  // filtros el orden de los grupos puede cambiar sin que la tarjeta se monte de nuevo.
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  if (!aggregation || aggregation.units.length === 0) return null;

  const group =
    aggregation.units.find(
      (unitGroup) => unitGroup.optionId === selectedOptionId,
    ) ?? aggregation.units[defaultUnitIndex(aggregation.units)];
  const showStats = hasUnitStats(group);
  const bins = showStats ? binsToHistogram(group.bins ?? []) : [];

  return (
    <div className="space-y-4">
      {aggregation.units.length > 1 && (
        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label="Unidad"
        >
          {aggregation.units.map((unitGroup) => {
            const isActive = unitGroup.optionId === group.optionId;
            return (
              <button
                key={unitGroup.optionId}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setSelectedOptionId(unitGroup.optionId)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  isActive
                    ? "border-[#15803d] bg-[#15803d] text-white"
                    : "border-border text-text-muted hover:text-text-primary"
                }`}
              >
                {unitGroup.unit}
                {unitGroup.percentage !== null
                  ? ` · ${unitGroup.percentage.toFixed(0)}%`
                  : ""}
              </button>
            );
          })}
        </div>
      )}

      {showStats ? (
        <dl className="grid grid-cols-3 gap-2 text-sm">
          {STAT_ITEMS.map(({ key, label }) => (
            <div key={key}>
              <dt className="text-xs text-text-muted">{label}</dt>
              <dd className="font-medium text-text-primary">
                {group[key] !== null
                  ? `${group[key]!.toFixed(2)} ${group.unit}`
                  : "—"}
              </dd>
            </div>
          ))}
          <div>
            <dt className="text-xs text-text-muted">n</dt>
            <dd className="font-medium text-text-primary">{group.count}</dd>
          </div>
        </dl>
      ) : (
        <p className="text-sm text-text-muted">
          {group.unit}: oculto por privacidad (menos de 5 respuestas).
        </p>
      )}

      {bins.length > 0 && (
        <div
          role="img"
          aria-label={`Histograma en ${group.unit}: ${describeHistogram(bins)}`}
        >
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
              <YAxis tick={{ fontSize: 11 }} unit="%" />
              <Tooltip
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
              <Bar dataKey="percentage" fill="#15803d" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {aggregation.units.length > 1 && (
        <p className="text-xs text-text-muted">
          Cada unidad se muestra por separado; los valores no se convierten
          entre unidades.
        </p>
      )}
    </div>
  );
}
