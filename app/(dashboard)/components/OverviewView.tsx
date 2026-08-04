import {
  fetchDashboardAnalytics,
  fetchDashboardOverview,
  fetchDigitalDemand,
  fetchKpis,
} from "../api";
import { AGE_RANGE_BUCKETS } from "@/lib/dashboard/filters";
import { DashboardFilters, DashboardQuestion } from "../types";
import ViewHeader from "./ViewHeader";
import KpiStrip from "./KpiStrip";
import CropDonut from "./CropDonut";
import ColombiaMap from "./ColombiaMap";
import { SingleChoiceChart, MultipleChoiceChart, NumericChart } from "./charts";
import LikertDivergingMatrix from "./LikertDivergingMatrix";
import IndexBars from "./IndexBars";
import HarvestCalendar from "./HarvestCalendar";

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

function findQuestion(
  questions: DashboardQuestion[],
  matcher: (q: DashboardQuestion) => boolean,
): DashboardQuestion | undefined {
  return questions.find(matcher);
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
    isInverted: false,
    answeredCount: aggregation?.type === "numeric" ? aggregation.count : 0,
    suppressed: aggregation === null,
    aggregation,
  };
}

/**
 * Vista "Resumen general" (spec 43, Fase 6, layout `1a`). Fuentes reales por
 * fila — nunca los números ilustrativos del mockup:
 * - KPI strip → `/kpis` (sin categoryId → tira de resumen general, D5).
 * - Donut de cultivo + mapa → `/overview` (`byCrop`, `byDepartment`).
 * - Género + edad → `/analytics?categoryId=C1` (S1a: única fuente real de
 *   `farmer.gender`; `/overview` no expone género, a diferencia de edad).
 * - Etapas de la cadena → `/analytics?categoryId=C3` (S1b·10).
 * - Batería Likert ★ consolidada + índice por edad → `/digital-demand`
 *   (D4) — **no** `/analytics` sin más: ningún endpoint de Fase 1-2 agrega
 *   los 130 ítems ★ cruzando instrumentos salvo `/digital-demand`; llamarlo
 *   aquí es una extensión deliberada del alcance original de esta fase
 *   (que solo listaba `/overview`, `/kpis` y `/analytics`), documentada en
 *   el spec junto a esta decisión.
 * - Calendario de cosecha → `/analytics?categoryId=C4` (S2.4·23).
 *
 * "Internet por departamento" del mockup se omite: no existe ese desglose
 * en ningún endpoint (`/kpis` solo da el % global) y agregarlo requeriría
 * un campo nuevo en el backend, fuera de alcance de una fase de frontend.
 */
export default async function OverviewView({ filters }: OverviewViewProps) {
  const [kpis, overview, c1, c3, c4, digitalDemand] = await Promise.all([
    fetchKpis(filters),
    fetchDashboardOverview(filters),
    fetchDashboardAnalytics({ ...filters, categoryId: "C1" }),
    fetchDashboardAnalytics({ ...filters, categoryId: "C3" }),
    fetchDashboardAnalytics({ ...filters, categoryId: "C4" }),
    fetchDigitalDemand(filters),
  ]);

  const genderQuestion = findQuestion(
    c1.questions,
    (q) => q.systemField === "farmer.gender",
  );
  const chainStageQuestion = findQuestion(c3.questions, (q) =>
    q.questionText.startsWith("¿En qué etapas de la cadena productiva"),
  );
  const harvestQuestion = findQuestion(c4.questions, (q) =>
    q.questionText.startsWith("¿En qué meses se presenta la cosecha principal"),
  );

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
  }));

  return (
    <div className="space-y-4">
      <ViewHeader title="Resumen general" />

      <KpiStrip kpis={kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4">
        <div className={CARD_CLASS}>
          {cardHeader("Distribución por cultivo", "S1b·4-7 · Dona")}
          <CropDonut data={overview.byCrop} />
        </div>
        <div className={CARD_CLASS}>
          {cardHeader("Cobertura geográfica", "S1a·Ubicación · Mapa")}
          {/* D6 (Fase 6): el mapa se muestra siempre — `/department-counts`
              (y aquí `/overview`.byDepartment) ya ignora departmentId/townId
              por diseño del backend (spec 30), así que ocultarlo cuando hay
              un departamento activo (como hacía page.tsx antes de la Fase 5)
              no evitaba ningún dato incorrecto: la distribución nacional es
              la misma con o sin ese filtro. */}
          <ColombiaMap data={departmentCounts} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={CARD_CLASS}>
          {cardHeader("Género del productor", "S1a·15")}
          {genderQuestion ? (
            <SingleChoiceChart question={genderQuestion} />
          ) : (
            <p className="text-sm text-text-muted">Sin datos</p>
          )}
        </div>
        <div className={CARD_CLASS}>
          {cardHeader("Rango de edad", "S1a·16 · Histograma")}
          {overview.age ? (
            <NumericChart question={wrapNumericAggregation(overview.age)} />
          ) : (
            <p className="text-sm text-text-muted">Sin datos</p>
          )}
        </div>
        <div className={CARD_CLASS}>
          {cardHeader("Etapas de la cadena", "S1b·10 · BarrasH")}
          {chainStageQuestion ? (
            <MultipleChoiceChart question={chainStageQuestion} />
          ) : (
            <p className="text-sm text-text-muted">Sin datos</p>
          )}
        </div>
      </div>

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

      <div className={CARD_CLASS}>
        {cardHeader("Meses de cosecha principal", "S2.4·23 · Calendario")}
        {harvestQuestion?.aggregation?.type === "single_choice" ||
        harvestQuestion?.aggregation?.type === "multiple_choice" ? (
          <HarvestCalendar options={harvestQuestion.aggregation.options} />
        ) : (
          <p className="text-sm text-text-muted">Sin datos</p>
        )}
      </div>
    </div>
  );
}
