"use client";

import { resolveServedChartKind } from "@/lib/dashboard/chartHint";
import { buildDivergingRows, type LikertBatteryItem } from "@/lib/dashboard/likert";
import {
  ComplianceChart,
  DepartmentMap,
  DonutChart,
  HarvestCalendarChart,
  LikertChart,
  MultipleChoiceChart,
  NumericChart,
  NumericWithUnitChart,
  SingleChoiceChart,
  UnsupportedQuestionType,
  YesNoChart,
} from "./charts";
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

/**
 * Agregación de la serie en la forma de los gráficos del 43/66. Los buckets
 * de una métrica de conteo (P13 del 108) se presentan como opciones de una
 * selección única, para reutilizar dona, barras y mapa.
 */
function aggregationOf(series: ServedSeries): DashboardAggregation | null {
  const agg = series.aggregation as
    | (DashboardAggregation & { buckets?: undefined })
    | { buckets: ServedMetricBucket[] }
    | null;
  if (!agg) return null;
  if ("buckets" in agg && agg.buckets) {
    const options: AggregationOption[] = agg.buckets.map((b) => ({
      optionId: b.id,
      text: b.name,
      count: b.count,
      percentage: b.percentage,
      value: null,
      suppressed: b.suppressed ?? false,
    }));
    return { type: "single_choice", options };
  }
  return agg as DashboardAggregation;
}

/** Adapta una serie servida a la forma por pregunta de los gráficos existentes. */
function asQuestion(chart: ServedChart, series: ServedSeries): DashboardQuestion {
  const aggregation = aggregationOf(series);
  return {
    questionId: `${chart.chartId}:${series.seriesKey}`,
    questionText: chart.title,
    questionType:
      chart.sourceKind === "entity_metric"
        ? (aggregation?.type ?? "")
        : (chart.questionType ?? ""),
    sectionName: "",
    systemField: null,
    isInverted: (aggregation as { isInverted?: boolean } | null)?.isInverted ?? false,
    answeredCount: series.answeredCount,
    suppressed: series.suppressed,
    aggregation,
  } as DashboardQuestion;
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
    // Porcentajes sobre el total; una celda suprimida llega en `null` y queda
    // como tramo «suprimido», no como cero (likert.ts, spec 109).
    distribution: (agg?.options ?? []).map((o) => o.percentage),
    meanScore: series.suppressed ? null : (agg?.meanScore ?? null),
    total: 100,
  };
}

interface ServedChartFactoryProps {
  chart: ServedChart;
}

/**
 * Spec 109 — dibuja un gráfico servido con el componente de su `chartKind`.
 * En comparación, las barras «% Sí» y la matriz Likert usan todas las series;
 * el resto dibuja la serie única de una fusión.
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
  const type = question.aggregation?.type;

  switch (kind) {
    case "donut":
      return type === "yes_no" ? (
        <YesNoChart question={question} />
      ) : (
        <DonutChart question={question} />
      );
    case "bars":
      if (type === "compliance") return <ComplianceChart question={question} />;
      if (type === "multiple_choice") return <MultipleChoiceChart question={question} />;
      return <SingleChoiceChart question={question} />;
    case "horizontal-bars":
      if (type === "multiple_choice") return <MultipleChoiceChart question={question} />;
      return (
        <OptionBars
          options={
            (question.aggregation as { options?: AggregationOption[] } | null)?.options ?? []
          }
        />
      );
    case "map":
      return <DepartmentMap question={question} />;
    case "harvest-calendar":
      return <HarvestCalendarChart question={question} />;
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
