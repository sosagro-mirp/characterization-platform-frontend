import {
  fetchDashboardOverview,
  fetchDigitalDemand,
  fetchServedChartsOrNull,
} from "../api";
import { AGE_RANGE_BUCKETS, OVERVIEW_CATEGORY_CODE } from "@/lib/dashboard/filters";
import { DashboardFilters, DashboardQuestion } from "../types";
import CropDonut from "./CropDonut";
import ColombiaMap from "./ColombiaMap";
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
 * Vista "Resumen general" (spec 43, Fase 6, layout `1a`; spec 109, P3).
 * Bloques fijos en código: tira de KPIs, dona de cultivos y mapa
 * (`/overview`), rango de edad (`/overview`, decisión del usuario del
 * 2026-11-18: sin métrica P13) y la matriz de demanda digital
 * (`/digital-demand`). Todo lo demás —género, etapas de la cadena,
 * calendario de cosecha…— son los gráficos publicados de la categoría
 * reservada `OVERVIEW`, armados en el constructor: ya no se buscan
 * preguntas por texto.
 */
export default async function OverviewView({ filters }: OverviewViewProps) {
  const [overview, overviewCharts, digitalDemand] = await Promise.all([
    fetchDashboardOverview(filters),
    fetchServedChartsOrNull(OVERVIEW_CATEGORY_CODE, filters),
    fetchDigitalDemand(filters),
  ]);

  const departmentCounts = overview.byDepartment.map((bucket) => ({
    departmentId: bucket.id,
    departmentName: bucket.name,
    count: bucket.count,
  }));

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
  if (overview.suppressed) {
    return (
      <div className="space-y-4">
        {overview.totalCount === 0 ? (
          <EmptyStateCard />
        ) : (
          <SuppressedDataCard reason={`La muestra global con estos filtros es insuficiente para mostrar datos (${overview.totalCount} encuestas, se requieren al menos 5).`} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4">
        <div className={CARD_CLASS}>
          {cardHeader("Distribución por cultivo", "S1b/S_REG·4-7 · Dona")}
          <CropDonut data={overview.byCrop} />
        </div>
        <div className={CARD_CLASS}>
          {cardHeader("Cobertura geográfica", "S1a/S_REG·Ubicación · Mapa")}
          {/* D6 (Fase 6): el mapa se muestra siempre — `/department-counts`
              (y aquí `/overview`.byDepartment) ya ignora departmentId/townId
              por diseño del backend (spec 30), así que ocultarlo cuando hay
              un departamento activo (como hacía page.tsx antes de la Fase 5)
              no evitaba ningún dato incorrecto: la distribución nacional es
              la misma con o sin ese filtro. */}
          <ColombiaMap data={departmentCounts} />
        </div>
      </div>

      {/* Spec 109 (P3): edad queda como bloque fijo (sin métrica P13); el
          resto de la fila son los gráficos publicados de OVERVIEW. */}
      <ChartsGrid
        charts={overviewCharts?.charts ?? []}
        leading={
          <div className={`${CARD_CLASS} h-full`}>
            {cardHeader("Rango de edad", "S1a/S_REG·16 · Histograma")}
            {overview.age ? (
              <NumericChart question={wrapNumericAggregation(overview.age)} />
            ) : (
              <p className="text-sm text-text-muted">Sin datos</p>
            )}
          </div>
        }
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
