"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { resolveServedChartKind } from "@/lib/dashboard/chartHint";
import { buildDivergingRows, type LikertBatteryItem } from "@/lib/dashboard/likert";
import {
  ComplianceChart,
  LikertChart,
  MultipleChoiceChart,
  NumericChart,
  NumericWithUnitChart,
  SingleChoiceChart,
  UnsupportedQuestionType,
  YesNoChart,
} from "./charts";
import ColombiaMap from "./ColombiaMap";
import HarvestCalendar from "./HarvestCalendar";
import IndexBars from "./IndexBars";
import LikertDivergingMatrix from "./LikertDivergingMatrix";
import OptionBars from "./OptionBars";
import SuppressedDataCard from "./SuppressedDataCard";
import type {
  AggregationOption,
  DashboardAggregation,
  DashboardQuestion,
  ServedChart,
  ServedMetricBucket,
  ServedSeries,
} from "../types";

const DONUT_COLORS = ["#15803d", "#facc15", "#0ea5e9", "#a855f7", "#f97316", "#64748b"];

/** Adapta una serie servida a la forma por pregunta de los gráficos del 43/66. */
function asQuestion(chart: ServedChart, series: ServedSeries): DashboardQuestion {
  return {
    questionId: `${chart.chartId}:${series.seriesKey}`,
    questionText: chart.title,
    questionType: chart.questionType ?? "",
    sectionName: "",
    systemField: null,
    isInverted:
      (series.aggregation as { isInverted?: boolean } | null)?.isInverted ?? false,
    answeredCount: series.answeredCount,
    suppressed: series.suppressed,
    aggregation: series.aggregation as DashboardAggregation | null,
  };
}

/** Opciones de una agregación por opciones, o los buckets de una métrica como opciones. */
function optionsOf(aggregation: unknown): AggregationOption[] {
  const agg = aggregation as
    | { options?: AggregationOption[]; buckets?: ServedMetricBucket[] }
    | null;
  if (agg?.options) return agg.options;
  if (agg?.buckets) {
    return agg.buckets.map((b) => ({
      optionId: b.id,
      text: b.name,
      count: b.count as number,
      percentage: b.percentage as number,
      value: null,
    }));
  }
  return [];
}

function OptionsDonut({ options }: { options: AggregationOption[] }) {
  const data = options
    .filter((o) => o.count !== null && o.count !== undefined)
    .map((o, i) => ({
      name: o.text,
      value: o.count,
      percentage: o.percentage,
      color: DONUT_COLORS[i % DONUT_COLORS.length],
    }));
  const hidden = options.length - data.length;
  return (
    <div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            label={({ payload }) => `${Number(payload.percentage).toFixed(0)}%`}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value, name) => [`${value}`, name]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      {hidden > 0 && (
        <p className="text-xs text-text-muted">
          {hidden === 1 ? "Una opción se oculta" : `${hidden} opciones se ocultan`} por
          tener muy pocas respuestas.
        </p>
      )}
    </div>
  );
}

function yesPercentOf(series: ServedSeries): number | null {
  const agg = series.aggregation as { yesPercentage?: number | null } | null;
  return series.suppressed ? null : (agg?.yesPercentage ?? null);
}

function likertItem(series: ServedSeries): LikertBatteryItem {
  const agg = series.aggregation as {
    options?: AggregationOption[];
    meanScore?: number | null;
  } | null;
  return {
    questionId: series.seriesKey,
    label: series.label,
    distribution: (agg?.options ?? []).map((o) => o.percentage ?? 0),
    meanScore: series.suppressed ? null : (agg?.meanScore ?? null),
  };
}

interface ServedChartFactoryProps {
  chart: ServedChart;
}

/**
 * Spec 109 — dibuja un gráfico servido con el componente de su `chartKind`.
 * En comparación (`compare`), las barras «% Sí» y la matriz Likert usan todas
 * las series; el resto de gráficos dibuja la serie única de una fusión.
 */
export default function ServedChartFactory({ chart }: ServedChartFactoryProps) {
  const kind = resolveServedChartKind(chart);
  if (kind === "unsupported") return <UnsupportedQuestionType />;

  if (kind === "yes-percent-bars") {
    return (
      <IndexBars
        max={100}
        items={chart.series.map((s) => ({
          label: s.label,
          value: yesPercentOf(s),
          suppressed: s.suppressed,
        }))}
      />
    );
  }

  if (kind === "diverging-matrix") {
    const items = chart.series.map(likertItem);
    if (buildDivergingRows(items).length === 0) return <SuppressedDataCard />;
    return <LikertDivergingMatrix items={items} />;
  }

  const series = chart.series[0];
  if (!series || chart.suppressed || series.suppressed || !series.aggregation) {
    return <SuppressedDataCard />;
  }
  const question = asQuestion(chart, series);
  const options = optionsOf(series.aggregation);

  switch (kind) {
    case "donut":
      return chart.questionType === "yes_no" ? (
        <YesNoChart question={question} />
      ) : (
        <OptionsDonut options={options} />
      );
    case "bars":
      if (chart.questionType === "compliance") return <ComplianceChart question={question} />;
      if (chart.questionType === "single_choice") return <SingleChoiceChart question={question} />;
      if (chart.questionType === "multiple_choice") {
        return <MultipleChoiceChart question={question} />;
      }
      return <OptionBars options={options} />;
    case "horizontal-bars":
      return <OptionBars options={options} />;
    case "map":
      return (
        <ColombiaMap
          data={options
            .filter((o) => o.count !== null && o.count !== undefined)
            .map((o) => ({
              departmentId: o.optionId,
              departmentName: o.text,
              count: o.count,
            }))}
        />
      );
    case "harvest-calendar":
      return <HarvestCalendar options={options} />;
    case "diverging":
      return <LikertChart question={question} />;
    case "histogram":
    case "histogram-normalized":
      return <NumericChart question={question} />;
    case "histogram-by-unit":
      return <NumericWithUnitChart question={question} />;
    default:
      return <UnsupportedQuestionType />;
  }
}
