import {
  fetchDashboardOverview,
  fetchDigitalDemand,
  fetchServedChartsOrNull,
} from "../api";
import { AGE_RANGE_BUCKETS, OVERVIEW_CATEGORY_CODE } from "@/lib/dashboard/filters";
import { DashboardFilters, DashboardQuestion } from "../types";
import CropDonut from "./CropDonut";
import { NumericChart } from "./charts";
import LikertDivergingMatrix from "./LikertDivergingMatrix";
import IndexBars from "./IndexBars";
import ChartsGrid from "./ChartsGrid";
import EmptyStateCard from "./EmptyStateCard";
import SuppressedDataCard from "./SuppressedDataCard";

interface OverviewViewProps {
  filters: DashboardFilters;
}

const CARD_CLASS = "rounded-lg border border-[var(--border)] bg-surface p-4";

function cardHeader(title: string, source: string) {
  return (
    <div className="flex items-start justify-between mb-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
        {title}
      </p>
      <span className="text-[10px] text-[var(--border-strong)]">{source}</span>
    </div>
  );
}

/** Envuelve un agregado numérico suelto (ej. `/overview`.age) en un
 * `DashboardQuestion` mínimo — `NumericChart` solo lee `.aggregation`. */
function wrapNumericAggregation(
  aggregation: DashboardQuestion["aggregation"],
): DashboardQuestion {
  return {
    questionId: "overview-numeric",
    questionText: "",
    questionType: "numeric",
    sectionName: "",
    systemField: null,
    chartHint: null,
    isInverted: false,
    answeredCount: aggregation?.type === "numeric" ? aggregation.count : 0,
    suppressed: aggregation === null,
    aggregation,
  };
}

/**
 * Vista "Resumen general" (spec 43, Fase 6, layout `1a`; spec 109, P3;
 * spec 111). Bloques fijos en código: dona de cultivos y rango de edad
 * (`/overview`, decisión del usuario del 2026-11-18: sin métrica P13) y la
 * matriz de demanda digital (`/digital-demand`). Todo lo demás —el mapa de
 * unidades productivas por departamento (spec 111), género, etapas de la
 * cadena, calendario de cosecha…— son los gráficos publicados de la
 * categoría reservada `OVERVIEW`, armados en el constructor.
 */
export default async function OverviewView({ filters }: OverviewViewProps) {
  const [overview, overviewCharts, digitalDemand] = await Promise.all([
    fetchDashboardOverview(filters),
    fetchServedChartsOrNull(OVERVIEW_CATEGORY_CODE, filters),
    fetchDigitalDemand(filters),
  ]);

  const ageByBucketLabel = new Map(
    digitalDemand.indexByCut.age.map((bucket) => [bucket.label, bucket]),
  );

  // `LikertRankingItem` (metadata rica: sectionName, answeredCount) → forma
  // mínima que espera `LikertDivergingMatrix`/`buildDivergingRows`.
  const likertBatteryItems = digitalDemand.likertRanking.map((item) => ({
    questionId: item.questionId,
    label: item.questionText,
    distribution: item.bands.map((band) => band.count),
    meanScore: item.meanScore,
    total: item.answeredCount,
  }));

  // Fase 8: si la muestra global (sin restringir a categoría) está por
  // debajo del umbral, ninguna fila curada tendría datos reales que mostrar
  // — un solo mensaje es más claro que 7 tarjetas diciendo "Sin datos" cada
  // una por separado.
  const charts = overviewCharts?.charts ?? [];

  if (overview.suppressed) {
    // Spec 111: las métricas de entidad (p. ej. el mapa de unidades
    // productivas) no dependen de la muestra de encuestas y traen su propia
    // supresión; se siguen mostrando debajo del aviso.
    const entityCharts = charts.filter((c) => c.sourceKind === "entity_metric");
    return (
      <div className="space-y-4">
        {overview.totalCount === 0 ? (
          <EmptyStateCard />
        ) : (
          <SuppressedDataCard reason={`La muestra global con estos filtros es insuficiente para mostrar datos (${overview.totalCount} encuestas, se requieren al menos 5).`} />
        )}
        {entityCharts.length > 0 && <ChartsGrid charts={entityCharts} />}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Spec 111 (A6): el mapa de unidades productivas es un gráfico
          publicado de OVERVIEW (posición 0, ancho completo) y va primero; la
          dona de cultivos y la edad (bloques fijos de `/overview`, sin
          métrica P13) van después, y luego el resto de gráficos publicados. */}
      <ChartsGrid
        charts={charts}
        leadingAfter={charts[0]?.chartKind === "map" ? 1 : 0}
        leading={[
          <div key="crop" className={`${CARD_CLASS} h-full`}>
            {cardHeader("Distribución por cultivo", "S1b/S_REG·4-7 · Dona")}
            <CropDonut data={overview.byCrop} />
          </div>,
          <div key="age" className={`${CARD_CLASS} h-full`}>
            {cardHeader("Rango de edad", "S1a/S_REG·16 · Histograma")}
            {overview.age ? (
              <NumericChart question={wrapNumericAggregation(overview.age)} />
            ) : (
              <p className="text-sm text-text-muted">Sin datos</p>
            )}
          </div>,
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
        <div className={CARD_CLASS}>
          {cardHeader(
            "Demanda digital — interés en la app ★",
            "Batería Likert ★ transversal",
          )}
          <LikertDivergingMatrix items={likertBatteryItems} limit={8} />
        </div>
        <div className={CARD_CLASS}>
          {cardHeader("Índice demanda × edad", "/5")}
          <IndexBars
            items={AGE_RANGE_BUCKETS.map((bucket) => ({
              label: bucket,
              value: ageByBucketLabel.get(bucket)?.meanScore ?? null,
              suppressed: ageByBucketLabel.get(bucket)?.suppressed ?? true,
            }))}
          />
        </div>
      </div>

    </div>
  );
}
